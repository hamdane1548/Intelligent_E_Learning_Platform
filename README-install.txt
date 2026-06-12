INSTALLATION SMARTLEARN AI

0. Prérequis IA (local, gratuit)

Installer Ollama (https://ollama.com) puis :
ollama pull llama3
ollama pull nomic-embed-text

(Sans Ollama, l'application fonctionne : résumés et quiz passent en mode
dégradé heuristique, l'assistant IA affiche une erreur claire.)

1. Backend

cd backend
python -m venv venv
venv\Scripts\activate          (macOS/Linux : source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env         (macOS/Linux : cp .env.example .env)
uvicorn main:app --reload

API:
http://127.0.0.1:8000/docs

Tests backend (58 tests, sans Ollama) :
python run_tests.py

Commande unittest directe :
python -m unittest discover -s tests -p "test_*.py" -t . -v

2. Frontend

cd frontend
npm install
npm run dev

Site:
http://localhost:5173

3. Premier compte admin

L'inscription publique ne permet que les rôles étudiant/enseignant.
Créer le premier admin (depuis backend/, venv activé) :

python -c "from database import SessionLocal; from models import User; from auth import hash_password; db = SessionLocal(); db.add(User(nom='Admin', email='admin@example.com', password=hash_password('change-me'), role='admin')); db.commit()"

4. Automatisation

Le workflow .github/workflows/backend-tests.yml exécute la suite de tests
backend à chaque push et pull request.
