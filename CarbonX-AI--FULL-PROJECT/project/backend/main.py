from __future__ import annotations

import io
import os
from datetime import date, datetime, timezone
from typing import Any

import numpy as np
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pyproj import Geod
from shapely.geometry import shape
from shapely.validation import explain_validity
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Load optional secrets from backend/.env
load_dotenv()

app = FastAPI(
    title="CarbonX AI Backend",
    description=(
        "Prototype API for checking submitted project boundaries, supporting "
        "vegetation evidence, and flagging unusual claims for human review."
    ),
    version="1.0.0",
)

# Vite commonly uses 5173; include 5174 as an alternate local dev port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEOD = Geod(ellps="WGS84")
TOKEN_URL = (
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/"
    "protocol/openid-connect/token"
)
PROCESS_URL = "https://sh.dataspace.copernicus.eu/process/v1"


def build_demo_anomaly_model():
    """Build a reproducible demo model using synthetic data only.

    This is for prototype demonstrations, not a validated scientific model.
    """
    rng = np.random.default_rng(42)
    n = 600
    areas = rng.uniform(1, 80, n)
    mismatch_pct = np.abs(rng.normal(4, 4, n)).clip(0, 25)
    overlap_pct = np.abs(rng.normal(2, 4, n)).clip(0, 20)
    mean_ndvi = rng.normal(0.48, 0.12, n).clip(-0.2, 0.9)
    vegetation_change = rng.normal(0.08, 0.12, n).clip(-0.5, 0.6)

    features = np.column_stack(
        [areas, mismatch_pct, overlap_pct, mean_ndvi, vegetation_change]
    )
    model = make_pipeline(
        StandardScaler(),
        IsolationForest(
            n_estimators=150,
            contamination=0.06,
            random_state=42,
        ),
    )
    model.fit(features)
    return model


ANOMALY_MODEL = build_demo_anomaly_model()


def validate_geometry(geometry: dict[str, Any]):
    """Validate a GeoJSON geometry and return its Shapely geometry."""
    if not isinstance(geometry, dict):
        raise ValueError("geometry must be a GeoJSON geometry object")

    try:
        geom = shape(geometry)
    except Exception as exc:
        raise ValueError(f"Invalid GeoJSON geometry: {exc}") from exc

    if geom.geom_type not in {"Polygon", "MultiPolygon"}:
        raise ValueError("geometry must be a Polygon or MultiPolygon")

    if geom.is_empty:
        raise ValueError("geometry cannot be empty")

    if not geom.is_valid:
        raise ValueError(f"Invalid polygon: {explain_validity(geom)}")

    # GeoJSON coordinates should be longitude, latitude in WGS84.
    minx, miny, maxx, maxy = geom.bounds
    if minx < -180 or maxx > 180 or miny < -90 or maxy > 90:
        raise ValueError(
            "Coordinates must be WGS84 longitude/latitude "
            "(longitude -180..180, latitude -90..90)"
        )

    return geom


def polygon_area_ha(geometry: dict[str, Any]) -> float:
    """Calculate geodesic polygon area in hectares from a GeoJSON geometry."""
    geom = validate_geometry(geometry)
    area_m2, _ = GEOD.geometry_area_perimeter(geom)
    area_ha = abs(area_m2) / 10_000

    if not np.isfinite(area_ha) or area_ha <= 0:
        raise ValueError("Could not calculate a positive polygon area")

    return float(area_ha)


def bbox_from_geometry(geometry: dict[str, Any]) -> list[float]:
    geom = validate_geometry(geometry)
    minx, miny, maxx, maxy = geom.bounds
    return [float(minx), float(miny), float(maxx), float(maxy)]


def get_token() -> str:
    client_id = os.getenv("COPERNICUS_CLIENT_ID")
    client_secret = os.getenv("COPERNICUS_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=503,
            detail=(
                "Copernicus credentials are not configured. Create backend/.env "
                "and set COPERNICUS_CLIENT_ID and COPERNICUS_CLIENT_SECRET."
            ),
        )

    try:
        response = requests.post(
            TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not connect to Copernicus authentication service: {exc}",
        ) from exc

    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"Copernicus authentication failed: {response.text[:300]}",
        )

    try:
        token = response.json().get("access_token")
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail="Copernicus authentication returned an invalid response.",
        ) from exc

    if not token:
        raise HTTPException(
            status_code=502,
            detail="Copernicus authentication response did not contain an access token.",
        )

    return token


def request_ndvi_image(
    geometry: dict[str, Any],
    start_date: str,
    end_date: str,
) -> bytes:
    token = get_token()
    bbox = bbox_from_geometry(geometry)

    evalscript = """
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "SCL"],
    output: { bands: 1, sampleType: "FLOAT32" }
  };
}
function evaluatePixel(sample) {
  // Mask cloud, cirrus, and cloud-shadow classes.
  if ([3, 8, 9, 10, 11].includes(sample.SCL)) return [-9999];
  const denominator = sample.B08 + sample.B04;
  if (denominator === 0) return [-9999];
  return [(sample.B08 - sample.B04) / denominator];
}
"""

    payload = {
        "input": {
            "bounds": {
                "bbox": bbox,
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                },
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{start_date}T00:00:00Z",
                            "to": f"{end_date}T23:59:59Z",
                        },
                        "mosaickingOrder": "leastCC",
                    },
                }
            ],
        },
        "output": {
            "width": 256,
            "height": 256,
            "responses": [
                {"identifier": "default", "format": {"type": "image/tiff"}}
            ],
        },
        "evalscript": evalscript,
    }

    try:
        response = requests.post(
            PROCESS_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=120,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not connect to Sentinel-2 processing service: {exc}",
        ) from exc

    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"Sentinel-2 request failed: {response.text[:500]}",
        )

    return response.content


def ndvi_stats_from_tiff(content: bytes) -> dict[str, float | int]:
    """Summarize valid NDVI values from the returned TIFF image."""
    try:
        with Image.open(io.BytesIO(content)) as image:
            arr = np.asarray(image).astype(np.float32)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not decode Sentinel-2 NDVI raster: {exc}",
        ) from exc

    valid = arr[
        (arr > -1)
        & (arr <= 1)
        & np.isfinite(arr)
        & (arr != -9999)
    ]

    if valid.size == 0:
        raise HTTPException(
            status_code=502,
            detail="No valid NDVI pixels were returned for this area/date range.",
        )

    return {
        "mean_ndvi": round(float(np.mean(valid)), 4),
        "median_ndvi": round(float(np.median(valid)), 4),
        "vegetation_fraction": round(float(np.mean(valid >= 0.4)), 4),
        "valid_pixels": int(valid.size),
    }


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "CarbonX AI Backend",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "CarbonX AI backend"}


@app.post("/api/verify-claim")
def verify_claim(payload: dict[str, Any]) -> dict[str, Any]:
    """Compare claimed hectares with the area of the submitted GeoJSON boundary."""
    geometry = payload.get("geometry")

    try:
        claimed_area = float(payload.get("claimed_area_ha", 0))
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=400,
            detail="claimed_area_ha must be a positive number.",
        ) from exc

    if not geometry or claimed_area <= 0 or not np.isfinite(claimed_area):
        raise HTTPException(
            status_code=400,
            detail="geometry and positive claimed_area_ha are required.",
        )

    try:
        evidence_area = polygon_area_ha(geometry)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    difference = claimed_area - evidence_area
    mismatch_pct = abs(difference) / claimed_area * 100
    consistency = max(0.0, 100.0 - mismatch_pct)

    return {
        "verified_at": datetime.now(timezone.utc).isoformat(),
        "claimed_area_ha": round(claimed_area, 2),
        "geometry_area_ha": round(evidence_area, 2),
        "area_difference_ha": round(difference, 2),
        "area_mismatch_percent": round(mismatch_pct, 2),
        "area_consistency_percent": round(consistency, 1),
        "status": "review" if mismatch_pct > 10 else "consistent",
        "note": (
            "Area is calculated from the submitted GeoJSON boundary. "
            "This is an area-consistency check, not carbon-credit certification."
        ),
    }


@app.post("/api/satellite/ndvi")
def satellite_ndvi(payload: dict[str, Any]) -> dict[str, Any]:
    """Request Sentinel-2 NDVI statistics through Copernicus Data Space."""
    geometry = payload.get("geometry")
    start_date = payload.get("start_date")
    end_date = payload.get("end_date")

    if not geometry or not start_date or not end_date:
        raise HTTPException(
            status_code=400,
            detail="geometry, start_date and end_date are required.",
        )

    try:
        start = date.fromisoformat(str(start_date))
        end = date.fromisoformat(str(end_date))
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="Dates must use YYYY-MM-DD format.",
        ) from exc

    if end < start:
        raise HTTPException(
            status_code=400,
            detail="end_date must be on or after start_date.",
        )

    # Validate geometry before making an external API request.
    try:
        bbox = bbox_from_geometry(geometry)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    content = request_ndvi_image(geometry, start.isoformat(), end.isoformat())
    stats = ndvi_stats_from_tiff(content)

    return {
        "source": "Copernicus Sentinel-2 L2A",
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "bbox": bbox,
        "stats": stats,
        "interpretation": (
            "NDVI is supporting vegetation evidence. It does not by itself prove "
            "mangrove identity, restoration success, or exact carbon storage."
        ),
    }


@app.post("/api/analyze-anomaly")
def analyze_anomaly(payload: dict[str, Any]) -> dict[str, Any]:
    """Use a synthetic-data Isolation Forest model to flag unusual claims.

    Prototype only: the model has not been validated on reviewed real-world
    mangrove project claims. A flag is not proof of fraud.
    """
    try:
        claimed = float(payload.get("claimed_area_ha", 0))
        geometry_area = float(payload.get("geometry_area_ha", 0))
        overlap = float(payload.get("overlap_percent", 0))
        ndvi = float(payload.get("mean_ndvi", 0.48))
        vegetation_change = float(payload.get("vegetation_change", 0.08))
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=400,
            detail="All supplied features must be numeric.",
        ) from exc

    values = [claimed, geometry_area, overlap, ndvi, vegetation_change]
    if not all(np.isfinite(value) for value in values):
        raise HTTPException(status_code=400, detail="All features must be finite numbers.")

    if claimed <= 0 or geometry_area <= 0:
        raise HTTPException(
            status_code=400,
            detail="claimed_area_ha and geometry_area_ha must be positive.",
        )
    if not 0 <= overlap <= 100:
        raise HTTPException(
            status_code=400,
            detail="overlap_percent must be between 0 and 100.",
        )
    if not -1 <= ndvi <= 1:
        raise HTTPException(
            status_code=400,
            detail="mean_ndvi must be between -1 and 1.",
        )

    mismatch_pct = abs(claimed - geometry_area) / claimed * 100
    features = np.array(
        [[claimed, mismatch_pct, overlap, ndvi, vegetation_change]],
        dtype=float,
    )
    prediction = int(ANOMALY_MODEL.predict(features)[0])
    decision_score = float(ANOMALY_MODEL.decision_function(features)[0])
    flagged = prediction == -1

    return {
        "model": "Isolation Forest",
        "model_mode": "prototype_demo_synthetic_baseline",
        "flagged_for_review": flagged,
        "result": (
            "potential_anomaly"
            if flagged
            else "no_anomaly_flag_from_demo_model"
        ),
        "features": {
            "claimed_area_ha": round(claimed, 2),
            "geometry_area_ha": round(geometry_area, 2),
            "area_mismatch_percent": round(mismatch_pct, 2),
            "overlap_percent": round(overlap, 2),
            "mean_ndvi": round(ndvi, 4),
            "vegetation_change": round(vegetation_change, 4),
        },
        "decision_score": round(decision_score, 4),
        "note": (
            "Demonstration only: model trained on synthetic baseline data, not "
            "validated real-world mangrove claims. A flag is not proof of fraud; "
            "human review is required."
        ),
    }
