import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ChatAssistant from "../components/ChatAssistant";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  LogOut,
  GraduationCap,
  ShieldCheck,
  UserRound,
  Sparkles,
  Menu,
  Settings,
  ClipboardList,
  Plus,
  Trophy,
  Brain,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    API.get("/dashboard/stats")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const getRoleLabel = (role) => {
    if (role === "admin") return "Administrateur";
    if (role === "enseignant") return "Enseignant";
    if (role === "etudiant") return "Étudiant";
    return "Utilisateur";
  };

  const menuItems = getMenuItems(user?.role);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#080A18] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] h-[420px] w-[420px] rounded-full bg-violet-600/25 blur-[120px]"></div>
        <div className="absolute bottom-[-140px] right-[-120px] h-[460px] w-[460px] rounded-full bg-fuchsia-500/20 blur-[130px]"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="SmartLearn AI"
                className="h-12 w-12 rounded-2xl object-contain bg-white p-1"
              />

              <div>
                <h1 className="font-black text-lg">SmartLearn AI</h1>
                <p className="text-xs text-white/45">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                active={activePage === item.id}
                icon={item.icon}
                text={item.label}
                onClick={() => setActivePage(item.id)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-red-300 hover:bg-red-500/10 transition"
            >
              <LogOut size={20} />
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080A18]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <button className="lg:hidden rounded-xl bg-white/10 p-2">
                  <Menu size={22} />
                </button>

                <div>
                  <h2 className="text-2xl font-black">
                    {getPageTitle(activePage)}
                  </h2>
                  <p className="text-sm text-white/45">
                    Bienvenue dans ton espace SmartLearn AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="font-bold">{user?.nom}</p>
                  <p className="text-xs text-white/45">
                    {getRoleLabel(user?.role)}
                  </p>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                  <UserRound size={24} />
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            {activePage === "dashboard" && (
              <>
                {user?.role === "admin" && (
                  <AdminDashboardHome
                    user={user}
                    stats={stats}
                    loading={loading}
                    getRoleLabel={getRoleLabel}
                  />
                )}

                {user?.role === "enseignant" && (
                  <TeacherDashboardHome
                    user={user}
                    stats={stats}
                    loading={loading}
                    getRoleLabel={getRoleLabel}
                  />
                )}

                {user?.role === "etudiant" && (
                  <StudentDashboardHome
                    user={user}
                    stats={stats}
                    loading={loading}
                    getRoleLabel={getRoleLabel}
                  />
                )}
              </>
            )}

            {activePage === "courses" && <CoursesManagement user={user} />}

            {activePage === "quiz" && <QuizManagement user={user} />}

            {activePage === "assistant" && <ChatAssistant />}

            {activePage === "users" && user?.role === "admin" && (
              <UsersManagement />
            )}

            {activePage === "users" && user?.role !== "admin" && (
              <AccessDenied />
            )}

            {activePage === "results" && <ResultsManagement user={user} />}

            {activePage === "stats" && (
              <AdminSection
                title="Statistiques avancées"
                description="Consulte les performances, les scores, la progression et les statistiques globales."
                buttonText="Voir rapports"
              />
            )}

            {activePage === "settings" && user?.role === "admin" && (
              <AdminSection
                title="Paramètres"
                description="Configure les accès, rôles et paramètres de la plateforme."
                buttonText="Modifier paramètres"
              />
            )}

            {activePage === "settings" && user?.role !== "admin" && (
              <AccessDenied />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function getMenuItems(role) {
  if (role === "admin") {
    return [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
      { id: "courses", label: "Cours", icon: <BookOpen size={20} /> },
      { id: "quiz", label: "Quiz", icon: <FileText size={20} /> },
      { id: "assistant", label: "Assistant IA", icon: <Brain size={20} /> },
      { id: "users", label: "Utilisateurs", icon: <Users size={20} /> },
      { id: "results", label: "Résultats", icon: <Trophy size={20} /> },
      { id: "stats", label: "Statistiques", icon: <BarChart3 size={20} /> },
      { id: "settings", label: "Paramètres", icon: <Settings size={20} /> },
    ];
  }

  if (role === "enseignant") {
    return [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
      { id: "courses", label: "Mes cours", icon: <BookOpen size={20} /> },
      { id: "quiz", label: "Quiz", icon: <FileText size={20} /> },
      { id: "assistant", label: "Assistant IA", icon: <Brain size={20} /> },
      { id: "stats", label: "Statistiques", icon: <BarChart3 size={20} /> },
    ];
  }

  return [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "courses", label: "Cours", icon: <BookOpen size={20} /> },
    { id: "quiz", label: "Mes quiz", icon: <ClipboardList size={20} /> },
    { id: "assistant", label: "Assistant IA", icon: <Brain size={20} /> },
    { id: "results", label: "Mes résultats", icon: <BarChart3 size={20} /> },
  ];
}

function getPageTitle(page) {
  if (page === "dashboard") return "Dashboard";
  if (page === "courses") return "Cours";
  if (page === "quiz") return "Quiz";
  if (page === "assistant") return "Assistant IA";
  if (page === "users") return "Utilisateurs";
  if (page === "results") return "Résultats";
  if (page === "stats") return "Statistiques";
  if (page === "settings") return "Paramètres";
  return "Dashboard";
}

function AdminDashboardHome({ user, stats, loading, getRoleLabel }) {
  return (
    <>
      <WelcomeCard
        user={user}
        getRoleLabel={getRoleLabel}
        title={`Bonjour, ${user?.nom || "Admin"} 👋`}
        description="Tu as accès à toute la plateforme : utilisateurs, cours, quiz, résultats, statistiques et paramètres."
      />

      <StatsBlock stats={stats} loading={loading} />

      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        <ActionCard
          title="Gérer les utilisateurs"
          text="Ajouter et consulter les étudiants, enseignants et administrateurs."
          icon={<Users />}
        />
        <ActionCard
          title="Superviser les cours"
          text="Voir tous les cours, PDF, résumés et supports pédagogiques."
          icon={<BookOpen />}
        />
        <ActionCard
          title="Analyser les résultats"
          text="Suivre les scores, quiz et performances globales."
          icon={<BarChart3 />}
        />
      </section>
    </>
  );
}

function TeacherDashboardHome({ user, stats, loading, getRoleLabel }) {
  return (
    <>
      <WelcomeCard
        user={user}
        getRoleLabel={getRoleLabel}
        title={`Bienvenue Professeur ${user?.nom || ""} 👋`}
        description="Ton espace enseignant te permet de créer des cours, uploader des PDF, générer des résumés et préparer des quiz."
      />

      {loading ? (
        <LoadingCard />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={<BookOpen size={26} />}
            title="Cours disponibles"
            value={stats?.courses?.total || 0}
            subtitle="Supports pédagogiques"
          />
          <StatCard
            icon={<FileText size={26} />}
            title="Quiz générés"
            value={stats?.quizzes?.total || 0}
            subtitle="Questions disponibles"
          />
          <StatCard
            icon={<Users size={26} />}
            title="Étudiants"
            value={stats?.users?.students || 0}
            subtitle="Apprenants inscrits"
          />
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ActionCard
          title="Ajouter un cours"
          text="Crée un nouveau cours et ajoute son PDF."
          icon={<Plus />}
        />
        <ActionCard
          title="Générer un résumé"
          text="Utilise l’IA pour résumer automatiquement les supports."
          icon={<Brain />}
        />
        <ActionCard
          title="Préparer un quiz"
          text="Génère automatiquement des questions depuis le cours."
          icon={<ClipboardList />}
        />
      </section>
    </>
  );
}

function StudentDashboardHome({ user, stats, loading, getRoleLabel }) {
  return (
    <>
      <WelcomeCard
        user={user}
        getRoleLabel={getRoleLabel}
        title={`Salut, ${user?.nom || "Étudiant"} 👋`}
        description="Ton espace étudiant te permet de consulter les cours, passer les quiz et suivre ta progression."
      />

      {loading ? (
        <LoadingCard />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={<BookOpen size={26} />}
            title="Cours"
            value={stats?.courses?.total || 0}
            subtitle="Cours disponibles"
          />
          <StatCard
            icon={<ClipboardList size={26} />}
            title="Quiz"
            value={stats?.quizzes?.total || 0}
            subtitle="Quiz à passer"
          />
          <StatCard
            icon={<Trophy size={26} />}
            title="Score moyen"
            value={`${stats?.quizzes?.average_score_percent || 0}%`}
            subtitle="Moyenne générale"
          />
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-[32px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
          <h3 className="text-2xl font-black">Ma progression</h3>
          <p className="text-sm text-white/45 mt-1">
            Suivi général de ton apprentissage.
          </p>

          <div className="mt-7 space-y-5">
            <ProgressRow label="Cours consultés" value={2} total={5} />
            <ProgressRow label="Quiz complétés" value={1} total={4} />
            <ProgressRow label="Progression globale" value={45} total={100} />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 p-7 backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 mb-5">
            <Sparkles className="text-fuchsia-200" />
          </div>

          <h3 className="text-2xl font-black">Recommandation</h3>
          <p className="mt-3 text-sm text-white/60">
            Continue avec les quiz disponibles pour améliorer ton score et suivre ta progression.
          </p>

          <button className="mt-6 rounded-2xl bg-white px-5 py-3 font-bold text-[#080A18]">
            Voir mes quiz
          </button>
        </div>
      </section>
    </>
  );
}

function CoursesManagement({ user }) {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  const canManage = user?.role === "admin" || user?.role === "enseignant";

  const fetchCourses = () => {
    API.get("/courses/")
      .then((res) => setCourses(res.data))
      .catch((err) => {
        console.log(err);
        setError("Impossible de charger les cours.");
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const createCourse = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!title) {
      setError("Le titre du cours est obligatoire.");
      return;
    }

    try {
      await API.post("/courses/", {
        title,
        description,
        teacher_id: user?.id,
      });

      setTitle("");
      setDescription("");
      setMessage("Cours ajouté avec succès.");
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'ajout du cours.");
    }
  };

  const uploadPdf = async (courseId) => {
    setMessage("");
    setError("");

    const file = selectedFiles[courseId];

    if (!file) {
      setError("Veuillez choisir un fichier PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post(`/courses/${courseId}/upload-pdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("PDF uploadé avec succès.");
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'upload du PDF.");
    }
  };

  const generateSummary = async (courseId) => {
    setMessage("");
    setError("");
    setPendingAction(`${courseId}:summary`);

    try {
      const res = await API.post(`/courses/${courseId}/generate-summary`);
      setMessage(
        res.data?.ai_generated
          ? "Résumé généré par IA ✨"
          : "IA indisponible — résumé basique généré."
      );
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la génération du résumé.");
    } finally {
      setPendingAction(null);
    }
  };

  const generateQuiz = async (courseId) => {
    setMessage("");
    setError("");
    setPendingAction(`${courseId}:quiz`);

    try {
      const res = await API.post(`/quiz/generate/${courseId}`);
      setMessage(
        res.data?.ai_generated
          ? "Quiz généré par IA ✨"
          : "IA indisponible — quiz basique généré."
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la génération du quiz.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section>
      <div className="mb-8 rounded-[34px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">
              {canManage ? "Gestion des cours" : "Cours disponibles"}
            </h1>
            <p className="mt-3 max-w-3xl text-white/55">
              {canManage
                ? "Ajoute des cours, upload des PDF, génère des résumés et prépare des quiz automatiquement."
                : "Consulte les cours disponibles et révise avec les supports proposés."}
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
            <BookOpen size={28} />
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {canManage && (
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-fuchsia-300">
                <Plus size={24} />
              </div>

              <div>
                <h2 className="text-xl font-black">Ajouter un cours</h2>
                <p className="text-sm text-white/45">Créer un nouveau cours</p>
              </div>
            </div>

            <form onSubmit={createCourse} className="space-y-4">
              <InputField
                label="Titre du cours"
                value={title}
                onChange={setTitle}
                placeholder="Ex: Introduction à l’IA"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                  placeholder="Description du cours..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 font-bold text-white shadow-lg shadow-fuchsia-950/30 transition hover:scale-[1.01]"
              >
                Ajouter le cours
              </button>
            </form>
          </div>
        )}

        <div className={canManage ? "xl:col-span-2" : "xl:col-span-3"}>
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-xl font-black">Liste des cours</h2>
              <p className="text-sm text-white/45">
                Total : {courses.length} cours
              </p>
            </div>

            <div className="space-y-5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                      <h3 className="text-xl font-black">{course.title}</h3>
                      <p className="mt-2 text-sm text-white/55">
                        {course.description || "Aucune description"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-violet-500/15 px-3 py-1 font-bold text-violet-300">
                          ID : {course.id}
                        </span>

                        <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 font-bold text-fuchsia-300">
                          Enseignant ID : {course.teacher_id}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 font-bold ${
                            course.pdf_path
                              ? "bg-green-500/15 text-green-300"
                              : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {course.pdf_path ? "PDF ajouté" : "Pas de PDF"}
                        </span>
                      </div>

                      {course.summary && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="mb-2 text-sm font-bold text-fuchsia-300">
                            Résumé
                          </p>
                          <p className="text-sm leading-relaxed text-white/60">
                            {course.summary}
                          </p>
                        </div>
                      )}
                    </div>

                    {canManage && (
                      <div className="min-w-[240px] space-y-3">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) =>
                            setSelectedFiles({
                              ...selectedFiles,
                              [course.id]: e.target.files[0],
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                        />

                        <button
                          onClick={() => uploadPdf(course.id)}
                          className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
                        >
                          Upload PDF
                        </button>

                        <button
                          onClick={() => generateSummary(course.id)}
                          disabled={pendingAction !== null}
                          className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {pendingAction === `${course.id}:summary`
                            ? "Génération en cours…"
                            : "Générer résumé"}
                        </button>

                        <button
                          onClick={() => generateQuiz(course.id)}
                          disabled={pendingAction !== null}
                          className="w-full rounded-2xl bg-fuchsia-600 px-4 py-3 text-sm font-bold text-white hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {pendingAction === `${course.id}:quiz`
                            ? "Génération en cours…"
                            : "Générer quiz"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {courses.length === 0 && (
                <div className="py-12 text-center text-white/45">
                  Aucun cours trouvé.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuizManagement({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isStudent = user?.role === "etudiant";

  const fetchQuizzes = () => {
    API.get("/quiz/")
      .then((res) => setQuizzes(res.data))
      .catch((err) => {
        console.log(err);
        setError("Impossible de charger les quiz.");
      });
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const loadQuestions = async (quiz) => {
    setSelectedQuiz(quiz);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setMessage("");
    setError("");

    try {
      const res = await API.get(`/quiz/${quiz.id}/questions`);
      setQuestions(res.data);
    } catch {
      setError("Impossible de charger les questions.");
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const submitQuiz = async () => {
    setMessage("");
    setError("");
    setResult(null);

    if (!selectedQuiz) {
      setError("Veuillez choisir un quiz.");
      return;
    }

    const formattedAnswers = questions.map((q) => ({
      question_id: q.id,
      answer: answers[q.id] || "",
    }));

    try {
      const res = await API.post(`/quiz/${selectedQuiz.id}/submit`, {
        student_id: user?.id,
        answers: formattedAnswers,
      });

      setResult(res.data);
      setMessage("Quiz soumis avec succès.");
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la soumission.");
    }
  };

  return (
    <section>
      <div className="mb-8 rounded-[34px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">
              {isStudent ? "Mes quiz" : "Gestion des quiz"}
            </h1>
            <p className="mt-3 max-w-3xl text-white/55">
              {isStudent
                ? "Choisis un quiz, réponds aux questions et consulte ta note."
                : "Consulte les quiz générés automatiquement et leurs questions."}
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
            <ClipboardList size={28} />
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-black">Liste des quiz</h2>
            <p className="text-sm text-white/45">
              Total : {quizzes.length} quiz
            </p>
          </div>

          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => loadQuestions(quiz)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  selectedQuiz?.id === quiz.id
                    ? "border-fuchsia-400 bg-fuchsia-500/10"
                    : "border-white/10 bg-black/20 hover:bg-white/10"
                }`}
              >
                <p className="font-bold text-white">{quiz.title}</p>
                <p className="mt-1 text-xs text-white/45">
                  Quiz ID : {quiz.id} • Cours ID : {quiz.course_id}
                </p>
              </button>
            ))}

            {quizzes.length === 0 && (
              <div className="py-8 text-center text-white/45">
                Aucun quiz trouvé. Génère un quiz depuis la section Cours.
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          {!selectedQuiz ? (
            <div className="py-16 text-center text-white/45">
              Sélectionne un quiz pour voir les questions.
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-black">{selectedQuiz.title}</h2>
                <p className="text-sm text-white/45">
                  {questions.length} question(s)
                </p>
              </div>

              <div className="space-y-5">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="rounded-3xl border border-white/10 bg-black/20 p-5"
                  >
                    <p className="mb-4 font-bold text-white">
                      {index + 1}. {q.question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <AnswerOption
                        label="A"
                        text={q.option_a}
                        selected={answers[q.id] === "A"}
                        onClick={() => handleAnswerChange(q.id, "A")}
                        disabled={!isStudent}
                      />
                      <AnswerOption
                        label="B"
                        text={q.option_b}
                        selected={answers[q.id] === "B"}
                        onClick={() => handleAnswerChange(q.id, "B")}
                        disabled={!isStudent}
                      />
                      <AnswerOption
                        label="C"
                        text={q.option_c}
                        selected={answers[q.id] === "C"}
                        onClick={() => handleAnswerChange(q.id, "C")}
                        disabled={!isStudent}
                      />
                      <AnswerOption
                        label="D"
                        text={q.option_d}
                        selected={answers[q.id] === "D"}
                        onClick={() => handleAnswerChange(q.id, "D")}
                        disabled={!isStudent}
                      />
                    </div>

                    {!isStudent && (
                      <div className="mt-4 rounded-2xl bg-green-500/10 px-4 py-3 text-sm text-green-300">
                        Réponse correcte : {q.correct_answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isStudent && questions.length > 0 && (
                <button
                  onClick={submitQuiz}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 font-bold text-white shadow-lg shadow-fuchsia-950/30 transition hover:scale-[1.01]"
                >
                  Soumettre le quiz
                </button>
              )}

              {result && (
                <div className="mt-6 rounded-3xl border border-green-500/20 bg-green-500/10 p-6 text-green-200">
                  <h3 className="text-xl font-black">Résultat</h3>
                  <p className="mt-2">
                    Score : <strong>{result.score}</strong> /{" "}
                    <strong>{result.total_questions}</strong>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ResultsManagement({ user }) {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const fetchResults = () => {
    const url = isAdmin
      ? "/quiz/results/all"
      : `/quiz/results/student/${user?.id}`;

    API.get(url)
      .then((res) => {
        setResults(res.data);
        setError("");
      })
      .catch((err) => {
        console.log(err);
        setError("Impossible de charger les résultats.");
      });
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const getAverageScore = () => {
    if (results.length === 0) return 0;

    const totalScore = results.reduce((sum, item) => sum + (item.score || 0), 0);
    const totalQuestions = results.reduce(
      (sum, item) => sum + (item.total_questions || 0),
      0
    );

    if (totalQuestions === 0) return 0;

    return Math.round((totalScore / totalQuestions) * 100);
  };

  return (
    <section>
      <div className="mb-8 rounded-[34px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black">
              {isAdmin ? "Tous les résultats" : "Mes résultats"}
            </h1>

            <p className="mt-3 max-w-3xl text-white/55">
              {isAdmin
                ? "Consulte les résultats de tous les étudiants."
                : "Consulte tes scores, tes quiz soumis et ta progression."}
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
            <Trophy size={28} />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={<ClipboardList size={26} />}
          title="Quiz soumis"
          value={results.length}
          subtitle="Nombre total de tentatives"
        />

        <StatCard
          icon={<Trophy size={26} />}
          title="Score moyen"
          value={`${getAverageScore()}%`}
          subtitle="Moyenne des résultats"
        />

        <StatCard
          icon={<BarChart3 size={26} />}
          title="Progression"
          value={results.length > 0 ? "Active" : "0%"}
          subtitle="Suivi étudiant"
        />
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-xl font-black">Liste des résultats</h2>
          <p className="text-sm text-white/45">
            Total : {results.length} résultat(s)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-left text-sm text-white/45">
                <th className="py-3 pr-4">ID</th>
                {isAdmin && <th className="py-3 pr-4">Étudiant</th>}
                <th className="py-3 pr-4">Quiz</th>
                <th className="py-3 pr-4">Score</th>
                <th className="py-3 pr-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {results.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-white/5 text-sm text-white/75"
                >
                  <td className="py-4 pr-4">{result.id}</td>

                  {isAdmin && (
                    <td className="py-4 pr-4">
                      {result.student_id || "-"}
                    </td>
                  )}

                  <td className="py-4 pr-4">{result.quiz_id || "-"}</td>

                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-bold text-fuchsia-300">
                      {result.score}/{result.total_questions}
                      {result.total_questions
                        ? ` (${Math.round((result.score / result.total_questions) * 100)}%)`
                        : ""}
                    </span>
                  </td>

                  <td className="py-4 pr-4 text-white/45">
                    {result.submitted_at
                      ? new Date(result.submitted_at).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {results.length === 0 && (
            <div className="py-10 text-center text-white/45">
              Aucun résultat trouvé pour le moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState("etudiant");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = () => {
    API.get("/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.log(err);
        setError("Impossible de charger les utilisateurs.");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!nom || !email || !password || !role) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      await API.post("/users/", {
        nom,
        email,
        password,
        role,
      });

      setMessage("Utilisateur ajouté avec succès.");
      setNom("");
      setEmail("");
      setPassword("123456");
      setRole("etudiant");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'ajout.");
    }
  };

  return (
    <section>
      <div className="mb-8 rounded-[34px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-black">Gestion des utilisateurs</h1>
        <p className="mt-3 max-w-3xl text-white/55">
          L’admin peut consulter et ajouter les étudiants, enseignants et administrateurs.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-fuchsia-300">
              <Plus size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">Ajouter un utilisateur</h2>
              <p className="text-sm text-white/45">Créer un nouveau compte</p>
            </div>
          </div>

          <form onSubmit={createUser} className="space-y-4">
            <InputField label="Nom complet" value={nom} onChange={setNom} placeholder="Ex: Ayssar" />
            <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="email@gmail.com" />
            <InputField label="Mot de passe" value={password} onChange={setPassword} placeholder="123456" />

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">
                Rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-fuchsia-400"
              >
                <option className="text-black" value="etudiant">Étudiant</option>
                <option className="text-black" value="enseignant">Enseignant</option>
                <option className="text-black" value="admin">Admin</option>
              </select>
            </div>

            {message && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 font-bold text-white shadow-lg shadow-fuchsia-950/30 transition hover:scale-[1.01]"
            >
              Ajouter
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-black">Liste des utilisateurs</h2>
            <p className="text-sm text-white/45">
              Total : {users.length} utilisateur(s)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left text-sm text-white/45">
                  <th className="py-3 pr-4">ID</th>
                  <th className="py-3 pr-4">Nom</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Rôle</th>
                  <th className="py-3 pr-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 text-sm text-white/75">
                    <td className="py-4 pr-4">{user.id}</td>
                    <td className="py-4 pr-4 font-semibold text-white">{user.nom}</td>
                    <td className="py-4 pr-4">{user.email}</td>
                    <td className="py-4 pr-4">
                      <RolePill role={user.role} />
                    </td>
                    <td className="py-4 pr-4 text-white/45">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="py-10 text-center text-white/45">
                Aucun utilisateur trouvé.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function WelcomeCard({ user, getRoleLabel, title, description }) {
  return (
    <section className="mb-8 rounded-[34px] border border-white/10 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 p-8 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 mb-5">
            <Sparkles size={16} className="text-fuchsia-200" />
            <span className="text-sm text-white/80">
              Plateforme e-learning intelligente
            </span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black">{title}</h1>
          <p className="mt-3 max-w-2xl text-white/60">{description}</p>
        </div>

        <RoleBadge role={user?.role} getRoleLabel={getRoleLabel} />
      </div>
    </section>
  );
}

function StatsBlock({ stats, loading }) {
  if (loading) return <LoadingCard />;

  if (!stats) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-200">
        Impossible de charger les statistiques. Vérifie que le backend est lancé.
      </div>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={<Users size={26} />}
          title="Utilisateurs"
          value={stats.users.total}
          subtitle={`${stats.users.students} étudiants • ${stats.users.teachers} enseignants`}
        />

        <StatCard
          icon={<GraduationCap size={26} />}
          title="Étudiants"
          value={stats.users.students}
          subtitle="Comptes étudiants actifs"
        />

        <StatCard
          icon={<BookOpen size={26} />}
          title="Cours"
          value={stats.courses.total}
          subtitle="Cours disponibles"
        />

        <StatCard
          icon={<FileText size={26} />}
          title="Quiz"
          value={stats.quizzes.total}
          subtitle={`${stats.quizzes.results} résultats enregistrés`}
        />
      </section>
    </>
  );
}

function AnswerOption({ label, text, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
        selected
          ? "border-fuchsia-400 bg-fuchsia-500/15 text-white"
          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
      } ${disabled ? "cursor-default" : "cursor-pointer"}`}
    >
      <span className="font-black text-fuchsia-300">{label}.</span> {text}
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-white/70">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-fuchsia-400"
        placeholder={placeholder}
      />
    </div>
  );
}

function RolePill({ role }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        role === "admin"
          ? "bg-fuchsia-500/15 text-fuchsia-300"
          : role === "enseignant"
          ? "bg-violet-500/15 text-violet-300"
          : "bg-blue-500/15 text-blue-300"
      }`}
    >
      {role}
    </span>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-white/60">
      Chargement des statistiques...
    </div>
  );
}

function AdminSection({ title, description, buttonText }) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-3 max-w-3xl text-white/55">{description}</p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-8">
        <p className="text-white/60">
          Cette section est prête. La prochaine étape est de connecter cette page aux vraies routes backend.
        </p>

        <button className="mt-6 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-bold text-white shadow-lg shadow-fuchsia-950/30">
          {buttonText}
        </button>
      </div>
    </section>
  );
}

function SidebarItem({ icon, text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-950/30"
          : "text-white/55 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      {text}
    </button>
  );
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-950/30">
        {icon}
      </div>

      <p className="text-sm text-white/45">{title}</p>
      <h3 className="mt-2 text-4xl font-black">{value}</h3>
      <p className="mt-3 text-sm text-white/45">{subtitle}</p>
    </div>
  );
}

function ProgressRow({ label, value, total }) {
  const percent = Math.round((value / total) * 100);

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/65">{label}</span>
        <span className="font-bold">{percent}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}

function RoleBadge({ role, getRoleLabel }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl min-w-[220px]">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <ShieldCheck className="text-fuchsia-300" />
        </div>

        <div>
          <p className="text-sm text-white/45">Rôle connecté</p>
          <p className="font-black">{getRoleLabel(role)}</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, text }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl hover:bg-white/[0.07] transition">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-fuchsia-300">
        {icon}
      </div>

      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/50">{text}</p>
    </div>
  );
}

function AccessDenied() {
  return (
    <section className="rounded-[34px] border border-red-500/20 bg-red-500/10 p-8 backdrop-blur-xl">
      <h1 className="text-3xl font-black text-red-200">Accès refusé</h1>
      <p className="mt-3 max-w-3xl text-red-100/70">
        Tu n’as pas les permissions nécessaires pour accéder à cette section.
      </p>
    </section>
  );
}

export default Dashboard;