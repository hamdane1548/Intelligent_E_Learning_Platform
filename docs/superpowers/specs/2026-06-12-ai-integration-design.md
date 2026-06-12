# AI Integration: Course Summaries & Quiz Generation

**Date:** 2026-06-12
**Status:** Approved
**Scope:** Replace the placeholder summary and quiz generators with real LLM calls via local Ollama.

## Decisions

| Question | Decision |
|---|---|
| Provider | Local Ollama (`llama3`) through its OpenAI-compatible API; env-configurable so cloud providers are a config change |
| Scope | Summaries + quizzes only (RAG chat assistant deferred to a later round) |
| Failure handling | Fall back to the existing heuristic generators; surface `ai_generated` flag so the UI can tell the teacher |
| UX while generating | Synchronous request with a loading state on the button (no job queue) |

## Architecture

`backend/ai_service.py` is the only module that talks to the LLM.

- `generate_summary(text) -> (summary: str, ai_generated: bool)`
- `generate_quiz_questions(text, num_questions=5) -> (questions: list[dict], ai_generated: bool)`

Config via env (documented in `.env.example`):

- `AI_BASE_URL` — default `http://localhost:11434/v1` (Ollama)
- `AI_MODEL` — default `llama3`
- `AI_TIMEOUT` — seconds, default `120`
- `AI_API_KEY` — default `ollama` (placeholder; real key when pointing at a cloud provider)

Input text is truncated to ~6,000 characters to fit the model context.

## Behavior

**Summary**: French prompt asking for a 4–6 sentence course summary of the PDF text.

**Quiz**: French prompt requesting strict JSON (`{"questions": [{question, option_a..option_d, correct_answer}]}`) using JSON response mode. Parsing is defensive (code-fence stripping, object extraction). Validation: exactly 4 non-empty options, `correct_answer` in A–D, question text non-empty. One retry on invalid output, then fallback. After parsing, options are shuffled server-side and the correct letter recomputed, guaranteeing even distribution of correct answers regardless of LLM position bias.

**Fallback**: any failure (connection refused, timeout, invalid JSON after retry) silently degrades to the current heuristics (moved into `ai_service.py` as private functions). The endpoint response carries `ai_generated: false`.

## API changes

- `POST /courses/{id}/generate-summary` → `{"course": CourseResponse, "ai_generated": bool}`
- `POST /quiz/generate/{course_id}` → `{"quiz": QuizResponse, "ai_generated": bool}`

(Shape change is safe: the frontend ignores these bodies today and refetches.)

## Frontend

`CoursesManagement` in `Dashboard.jsx`:
- Buttons get a busy state ("Génération en cours…", disabled) while the request runs.
- Success message reflects the flag: "généré par IA ✨" vs "IA indisponible — version basique générée".

## Testing

- Unit tests mock the LLM call (`ai_service._chat`): happy path, JSON retry, validation rejection, option shuffling, fallback on connection error, truncation.
- API tests patch `ai_service` to verify the `ai_generated` flag flows through both endpoints.
- CI never needs Ollama; `run_tests.py` discovery pattern widens from `test_api*.py` to `test_*.py`.
- Manual live verification against real Ollama at the end (browser-driven, like previous rounds).

## Out of scope

- RAG chat assistant (future round)
- Background job queue for generation
- Difficulty levels / question-count selection in the UI
