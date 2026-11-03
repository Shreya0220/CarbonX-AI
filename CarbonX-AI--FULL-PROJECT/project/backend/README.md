# CarbonX AI backend

FastAPI backend for the CarbonX frontend.

## Local setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Put the Copernicus Data Space OAuth client ID and secret in `.env`.

Run:

```powershell
uvicorn main:app --reload --port 8000
```

Health check: http://127.0.0.1:8000/api/health

The React app stays on port 5173. Satellite credentials remain server-side and are never placed in Vite/React code.


## Prototype anomaly model

`POST http://127.0.0.1:8000/api/analyze-anomaly` runs a real scikit-learn Isolation Forest model. For this prototype it is fitted at startup on **synthetic demo examples**, not real verified mangrove projects. Do not describe its flags as validated predictions. Replace the synthetic baseline with reviewed project data and evaluate false positives/negatives before any real-world use.

Example JSON for Swagger (`http://127.0.0.1:8000/docs`):

```json
{
  "claimed_area_ha": 25,
  "geometry_area_ha": 18.7,
  "overlap_percent": 12,
  "mean_ndvi": 0.42,
  "vegetation_change": 0.03
}
```

The endpoint returns a potential anomaly flag, feature values, and a decision score. This is a triage signal only; it does not prove fraud or confirm restoration.
