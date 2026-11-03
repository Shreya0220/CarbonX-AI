from __future__ import annotations

import base64
import io
import os
from datetime import datetime
from typing import Any

import numpy as np
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pyproj import Geod
from shapely.geometry import shape

load_dotenv()

app = FastAPI(title="CarbonX AI Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEOD = Geod(ellps="WGS84")
TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
PROCESS_URL = "https://sh.dataspace.copernicus.eu/process/v1"


def polygon_area_ha(geometry: dict[str, Any]) -> float:
    geom = shape(geometry)
    if geom.geom_type not in {"Polygon", "MultiPolygon"}:
        raise ValueError("AOI must be a Polygon or MultiPolygon GeoJSON geometry")
    area_m2, _ = GEOD.geometry_area_perimeter(geom)
    return abs(area_m2) / 10_000


def bbox_from_geometry(geometry: dict[str, Any]) -> list[float]:
    geom = shape(geometry)
    minx, miny, maxx, maxy = geom.bounds
    return [minx, miny, maxx, maxy]


def get_token() -> str:
    client_id = os.getenv("COPERNICUS_CLIENT_ID")
    client_secret = os.getenv("COPERNICUS_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=503,
            detail="Copernicus credentials are not configured. Add COPERNICUS_CLIENT_ID and COPERNICUS_CLIENT_SECRET to backend/.env.",
        )
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
        timeout=30,
    )
    if not response.ok:
        raise HTTPException(status_code=502, detail=f"Copernicus authentication failed: {response.text[:300]}")
    return response.json()["access_token"]


def request_ndvi_image(geometry: dict[str, Any], start_date: str, end_date: str) -> bytes:
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
  if ([8,9,10].includes(sample.SCL)) return [-9999];
  return [(sample.B08 - sample.B04) / (sample.B08 + sample.B04)];
}
"""
    payload = {
        "input": {
            "bounds": {
                "bbox": bbox,
                "properties": {"crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"},
            },
            "data": [{
                "type": "sentinel-2-l2a",
                "dataFilter": {
                    "timeRange": {
                        "from": f"{start_date}T00:00:00Z",
                        "to": f"{end_date}T23:59:59Z",
                    },
                    "mosaickingOrder": "leastCC",
                },
            }],
        },
        "output": {
            "width": 256,
            "height": 256,
            "responses": [{"identifier": "default", "format": {"type": "image/tiff"}}],
        },
        "evalscript": evalscript,
    }
    response = requests.post(
        PROCESS_URL,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
        timeout=120,
    )
    if not response.ok:
        raise HTTPException(status_code=502, detail=f"Sentinel-2 request failed: {response.text[:500]}")
    return response.content


def ndvi_stats_from_tiff(content: bytes) -> dict[str, float]:
    # Pillow can read simple TIFF outputs; if the provider returns an unsupported TIFF,
    # the endpoint will report that rather than inventing a result.
    try:
        with Image.open(io.BytesIO(content)) as image:
            arr = np.asarray(image).astype(np.float32)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not decode Sentinel-2 NDVI raster: {exc}")
    valid = arr[(arr > -1) & (arr <= 1) & np.isfinite(arr)]
    if valid.size == 0:
        raise HTTPException(status_code=502, detail="No valid NDVI pixels were returned for this AOI/date range.")
    vegetation_fraction = float(np.mean(valid >= 0.4))
    return {
        "mean_ndvi": round(float(np.mean(valid)), 4),
        "median_ndvi": round(float(np.median(valid)), 4),
        "vegetation_fraction": round(vegetation_fraction, 4),
        "valid_pixels": int(valid.size),
    }


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "CarbonX AI backend"}


@app.post("/api/verify-claim")
def verify_claim(payload: dict[str, Any]) -> dict[str, Any]:
    geometry = payload.get("geometry")
    claimed_area = float(payload.get("claimed_area_ha", 0))
    if not geometry or claimed_area <= 0:
        raise HTTPException(status_code=400, detail="geometry and positive claimed_area_ha are required")

    try:
        evidence_area = polygon_area_ha(geometry)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    difference = claimed_area - evidence_area
    mismatch_pct = abs(difference) / claimed_area * 100
    consistency = max(0.0, 100.0 - mismatch_pct)

    return {
        "verified_at": datetime.utcnow().isoformat() + "Z",
        "claimed_area_ha": round(claimed_area, 2),
        "geometry_area_ha": round(evidence_area, 2),
        "area_difference_ha": round(difference, 2),
        "area_consistency_percent": round(consistency, 1),
        "status": "review" if mismatch_pct > 10 else "consistent",
        "note": "Area is calculated from the submitted GeoJSON boundary; this is not a carbon-credit certification.",
    }


@app.post("/api/satellite/ndvi")
def satellite_ndvi(payload: dict[str, Any]) -> dict[str, Any]:
    geometry = payload.get("geometry")
    start_date = payload.get("start_date")
    end_date = payload.get("end_date")
    if not geometry or not start_date or not end_date:
        raise HTTPException(status_code=400, detail="geometry, start_date and end_date are required")

    content = request_ndvi_image(geometry, start_date, end_date)
    stats = ndvi_stats_from_tiff(content)
    return {
        "source": "Copernicus Sentinel-2 L2A",
        "start_date": start_date,
        "end_date": end_date,
        "bbox": bbox_from_geometry(geometry),
        "stats": stats,
        "interpretation": "NDVI is supporting vegetation evidence. It does not by itself prove mangrove identity or exact carbon storage.",
    }
