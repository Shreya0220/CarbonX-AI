# CarbonX AI — merged project

This archive combines the original CarbonX AI frontend with the updated backend and Geo Evidence API integration.

## Frontend
From the `project` directory run:

```bash
npm install
npm run dev
```

## Backend (Python 3.10+ recommended)
Open a second terminal:

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend API docs: http://127.0.0.1:8000/docs
Frontend default API base: http://127.0.0.1:8000

## Important limitations
- Isolation Forest is trained on synthetic demo data, not validated real restoration cases.
- Satellite NDVI endpoint requires Copernicus Data Space credentials in `backend/.env`; copy `.env.example` to `.env` and configure credentials.
- Do not publish secrets or claim that sample results are real-world verification.
