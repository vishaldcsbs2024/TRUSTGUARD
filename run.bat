@echo off
echo Starting Backend Server on port 8000...
start cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Frontend Server on port 5173...
start cmd /k "cd frontend && npm run dev"

echo TrustGuard Servers are starting!
