INSTALLATION SMARTLEARN AI

1. Backend

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

API:
http://127.0.0.1:8000/docs

Run backend API tests:
python run_tests.py

Direct unittest command:
python -m unittest discover -s tests -p "test_api*.py" -t . -v

2. Frontend

cd frontend
npm install
npm run dev

Site:
http://localhost:5173

3. Automation

If you push this project to GitHub, the workflow in .github/workflows/backend-tests.yml
will run the backend API tests automatically on every push and pull request.
