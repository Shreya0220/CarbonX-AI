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
