import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { BookOpen, Bot, Send, Sparkles, UserRound } from "lucide-react";

function ChatAssistant() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    API.get("/courses/")
      .then((res) => setCourses(res.data.filter((c) => c.pdf_path)))
      .catch(() => setError("Impossible de charger les cours."));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setMessages([]);
    setError("");
  };

  const send = async (e) => {
    e.preventDefault();

    const question = input.trim();
    if (!question || !selectedCourse || loading) return;

    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post(`/courses/${selectedCourse.id}/chat`, {
        question,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content:
            err.response?.data?.detail ||
            "Erreur de l'assistant. Réessaie dans un instant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="mb-8 rounded-[34px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">Assistant IA</h1>
            <p className="mt-3 max-w-3xl text-white/55">
              Pose tes questions sur un cours : l'assistant répond uniquement à
              partir du contenu du PDF.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
            <Bot size={28} />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <h2 className="text-xl font-black mb-1">Cours</h2>
          <p className="text-sm text-white/45 mb-5">
            Choisis le cours à interroger
          </p>

          <div className="space-y-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => selectCourse(course)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  selectedCourse?.id === course.id
                    ? "border-fuchsia-400 bg-fuchsia-500/10"
                    : "border-white/10 bg-black/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-fuchsia-300 shrink-0" />
                  <span className="font-bold text-sm">{course.title}</span>
                </div>
              </button>
            ))}

            {courses.length === 0 && (
              <p className="py-6 text-center text-sm text-white/45">
                Aucun cours avec PDF disponible.
              </p>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 flex flex-col rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-xl min-h-[560px]">
          {!selectedCourse ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
                <Sparkles className="text-fuchsia-300" size={30} />
              </div>
              <p className="text-white/50 max-w-sm">
                Sélectionne un cours à gauche pour démarrer la conversation avec
                l'assistant.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 px-6 py-4">
                <p className="font-black">{selectedCourse.title}</p>
                <p className="text-xs text-white/45">
                  Réponses basées sur le PDF du cours
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {messages.length === 0 && !loading && (
                  <p className="py-10 text-center text-sm text-white/40">
                    Pose ta première question, par exemple : « Quels sont les
                    points clés de ce cours ? »
                  </p>
                )}

                {messages.map((message, index) => (
                  <ChatBubble key={index} message={message} />
                ))}

                {loading && (
                  <div className="flex items-center gap-3 text-white/50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      <Bot size={18} className="text-fuchsia-300" />
                    </div>
                    <span className="text-sm animate-pulse">
                      L'assistant réfléchit…
                    </span>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={send}
                className="flex gap-3 border-t border-white/10 p-4"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pose ta question sur le cours…"
                  className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[80%] items-start gap-3">
          <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm text-white">
            {message.content}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <UserRound size={18} />
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "error") {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {message.content}
      </div>
    );
  }

  return (
    <div className="flex max-w-[85%] items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <Bot size={18} className="text-fuchsia-300" />
      </div>

      <div className="space-y-2">
        <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
          {message.content}
        </div>

        {message.sources?.length > 0 && (
          <details className="text-xs text-white/35">
            <summary className="cursor-pointer hover:text-white/60">
              Passages du cours utilisés ({message.sources.length})
            </summary>
            <ul className="mt-2 space-y-1 pl-4">
              {message.sources.map((source, i) => (
                <li key={i} className="list-disc">
                  « {source}… »
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

export default ChatAssistant;
