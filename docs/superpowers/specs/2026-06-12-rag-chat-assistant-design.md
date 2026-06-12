# RAG Chat Assistant

**Date:** 2026-06-12
**Status:** Approved
**Scope:** Per-course AI assistant that answers questions grounded in the course PDF, for all roles.

## Decisions

| Question | Decision |
|---|---|
| Retrieval | Real embeddings via `nomic-embed-text` on Ollama; chunks + vectors in SQLite; cosine similarity in Python (no vector DB) |
| Scope | Per-course chat, available to students, teachers and admins |
| Memory | Session memory: frontend sends the last exchanges with each question; nothing persisted |
| Failure | No heuristic fallback for chat — 503 with a clear French message when Ollama/embeddings are unavailable |

## Architecture

**`backend/pdf_utils.py`** — consolidates the `extract_text_from_pdf` helper currently duplicated in `routes/courses.py` and `routes/quiz.py`; `rag_service` uses it too.

**`backend/ai_service.py`** gains `_embed(texts) -> list[vectors]` using the same OpenAI-compatible client (`EMBED_MODEL` env, default `nomic-embed-text`).

**`backend/rag_service.py`**:
- `chunk_text(text)` — ~1,000-char chunks, 200-char overlap, sentence-boundary aware
- `index_course(course, text, db)` — embed chunks, store in `course_chunks`, replacing previous rows
- `ensure_indexed(course, db)` — lazy indexing for courses uploaded before this feature
- `answer_question(course, question, history, db)` — embed question, top-4 chunks by cosine, French prompt ("answer only from these excerpts; say so if absent"), last 3 exchanges of history included; returns `{answer, sources}` (sources = 160-char excerpts of chunks used)
- raises `RagUnavailableError` when embedding or chat calls fail

**`backend/models.py`** — new `CourseChunk` table: `course_id`, `chunk_index`, `content`, `embedding` (JSON-encoded vector). Created by the existing `create_all`.

**`backend/routes/chat.py`** — `POST /courses/{course_id}/chat`, any authenticated user. Body `{question, history: [{role, content}]}` → `{answer, sources}`. Errors: 404 unknown course, 400 no PDF, 503 AI unavailable.

**PDF upload** (`routes/courses.py`) — after saving, indexes the course best-effort (`try/except`): an indexing failure never fails the upload, lazy indexing recovers later.

## Frontend

New "Assistant IA" sidebar entry (all roles) in the dashboard. Component lives in its own file `frontend/src/components/ChatAssistant.jsx` (Dashboard.jsx is already ~1,500 lines): course picker (courses with a PDF), chat thread, typing indicator, inline error bubbles, sources shown as small excerpts under answers. History kept in component state; the request sends the last 6 messages.

## Testing

- Unit: chunking (size/coverage/overlap), index + re-index, top-k selection feeding the prompt, history inclusion, `RagUnavailableError` on embed failure.
- Endpoint: happy path with pre-indexed chunks, lazy indexing on first chat, 401 unauthenticated, 400 no PDF, 503 AI down, upload triggers indexing.
- `APITestCase` disables `_embed` by default (like `_chat`); suite never needs Ollama.
- Live browser verification at the end, selectors scoped to a dedicated test course.

## Setup

- `ollama pull nomic-embed-text` (one-time, ~274 MB)
- `EMBED_MODEL` documented in `.env.example`

## Out of scope

- Persisted chat history
- Cross-course/global chat
- Streaming responses
