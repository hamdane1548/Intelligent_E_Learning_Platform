# Intelligent E-Learning Platform — SmartLearn AI

An AI-powered e-learning platform providing personalized learning through AI-generated course summaries, automatic quiz generation, and a Retrieval-Augmented Generation (RAG) assistant that answers student questions grounded in course material.

All AI features run **locally** through [Ollama](https://ollama.com) — no API keys, no cloud costs, course content never leaves the machine. The AI layer is provider-agnostic: pointing it at OpenAI or any OpenAI-compatible API is a config change.

## ✨ Features

### Platform
* 🔐 JWT authentication with three roles: **étudiant**, **enseignant**, **admin**
* 📚 Course management: creation, PDF upload, text extraction
* 📝 Quiz taking with server-side scoring and per-student results
* 📊 Role-specific dashboards (admin stats, teacher tools, student progress)
* 👥 Admin user management

### AI (local LLM via Ollama)
* 🧠 **Course summaries** — `llama3` generates a structured French summary from the uploaded PDF
* ❓ **Quiz generation** — real multiple-choice questions with plausible distractors; options are shuffled server-side so correct answers are evenly distributed
* 💬 **RAG assistant** — per-course chat grounded in the PDF content: chunks are embedded with `nomic-embed-text`, retrieved by cosine similarity, and the answer cites the course passages used. Honest "the course doesn't cover this" when content is missing
* 🛟 **Graceful degradation** — if Ollama is down, summaries and quizzes fall back to heuristic generators (flagged as such in the UI); the chat returns a clear error

## 🏗️ Repository Structure

```text
Intelligent_E_Learning_Platform/
│
├── frontend/                  # React 19 + Vite + Tailwind CSS 4
│   └── src/
│       ├── pages/             # Home, Login, Signup, Dashboard, Profile, About, Contact
│       ├── components/        # ChatAssistant, ProtectedRoute, Footer
│       └── services/api.js    # axios client with JWT interceptor
│
├── backend/                   # FastAPI + SQLAlchemy + SQLite
│   ├── main.py                # app entry point
│   ├── auth.py                # JWT, password hashing, role guards
│   ├── ai_service.py          # LLM gateway: summaries, quiz generation, embeddings
│   ├── rag_service.py         # chunking, indexing, retrieval, grounded answers
│   ├── pdf_utils.py           # PDF text extraction (PyMuPDF)
│   ├── models.py / schemas.py # SQLAlchemy models / Pydantic schemas
│   ├── routes/                # users, courses, quiz, chat, dashboard, contact
│   └── tests/                 # 58 unittest tests (AI fully mocked)
│
├── docs/superpowers/specs/    # design documents for the AI features
└── .github/workflows/         # CI: backend test suite on every push/PR
```

## 🚀 Getting Started

### Prerequisites
* Python 3.12+
* Node.js 18+
* [Ollama](https://ollama.com) with the two models:

```bash
ollama pull llama3
ollama pull nomic-embed-text
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then set SECRET_KEY
uvicorn main:app --reload
```

API docs: http://127.0.0.1:8000/docs

**First admin account**: public signup only allows student/teacher roles. Seed the first admin once:

```bash
python -c "
from database import SessionLocal
from models import User
from auth import hash_password
db = SessionLocal()
db.add(User(nom='Admin', email='admin@example.com', password=hash_password('change-me'), role='admin'))
db.commit()"
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Site: http://localhost:5173

## ⚙️ Configuration (`backend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `SECRET_KEY` | dev fallback | JWT signing key — set a real one |
| `AI_BASE_URL` | `http://localhost:11434/v1` | OpenAI-compatible endpoint (Ollama) |
| `AI_MODEL` | `llama3` | Chat/generation model |
| `EMBED_MODEL` | `nomic-embed-text` | Embedding model for the RAG assistant |
| `AI_API_KEY` | `ollama` | Real key when using a cloud provider |
| `AI_TIMEOUT` | `120` | LLM call timeout (seconds) |

To use OpenAI instead of Ollama: `AI_BASE_URL=https://api.openai.com/v1`, `AI_MODEL=gpt-4o-mini`, `AI_API_KEY=sk-...`.

## 🤖 How the AI works

**Summaries & quizzes** — the PDF text (truncated to fit the model context) goes to the LLM with a French instruction prompt. Quiz output is requested as strict JSON, validated, retried once on bad output, and the answer options are shuffled server-side. Any failure falls back to heuristic generators, and the API response carries an `ai_generated` flag so the UI can tell the teacher which one they got.

**RAG assistant** — on PDF upload (or lazily on first chat), the text is split into ~1,000-char overlapping chunks, embedded, and stored in SQLite. At question time, the question is embedded, the top 4 chunks by cosine similarity are injected into a grounded prompt along with recent conversation history, and the response returns the source passages used.

```text
PDF upload ──► chunk ──► embed (nomic-embed-text) ──► SQLite (course_chunks)

question ──► embed ──► cosine top-4 ──► llama3 + history ──► grounded answer + sources
```

## 🧪 Tests

```bash
cd backend
python run_tests.py
```

58 tests cover auth, role permissions, courses, quizzes, dashboard, AI generation, and the RAG pipeline. All LLM and embedding calls are mocked — the suite runs without Ollama, so CI stays green.

## 🔄 CI

GitHub Actions (`.github/workflows/backend-tests.yml`) runs the backend suite on every push and pull request.

## 🔮 Roadmap

* Persisted chat history
* Streaming assistant responses
* Quiz difficulty levels and question-count selection
* Cross-course (global) assistant
