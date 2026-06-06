INSTALLATION SMARTLEARN AI

1. Backend

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

API:
http://127.0.0.1:8000/docs


2. Frontend

cd frontend
npm install
npm run dev

Site:
http://localhost:5173