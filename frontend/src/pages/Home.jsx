import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  BookOpen,
  FileText,
  BarChart3,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-[#080A18] text-white overflow-hidden">
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] h-[420px] w-[420px] rounded-full bg-violet-600/30 blur-[120px]"></div>
        <div className="absolute top-[160px] right-[-140px] h-[460px] w-[460px] rounded-full bg-fuchsia-500/20 blur-[130px]"></div>
        <div className="absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[130px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-900/40">
              <Brain size={25} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                SmartLearn AI
              </h1>
              <p className="text-xs text-white/45">
                Intelligent E-Learning Platform
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-white/65 hover:text-white">
              Fonctionnalités
            </a>
            <a href="#how" className="text-sm text-white/65 hover:text-white">
              Comment ça marche
            </a>
            <a href="#roles" className="text-sm text-white/65 hover:text-white">
              Rôles
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-2xl px-5 py-3 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Connexion
            </Link>

            <Link
              to="/signup"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#080A18] shadow-xl shadow-violet-950/30 transition hover:scale-[1.02]"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-10 lg:grid-cols-2 lg:pt-20">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <Sparkles size={16} className="text-fuchsia-300" />
            <span className="text-sm font-semibold text-white/80">
              Nouvelle génération d’apprentissage intelligent
            </span>
          </div>

          <h2 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
            Apprendre plus vite avec une plateforme{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
              boostée par l’IA
            </span>
          </h2>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/60">
            SmartLearn AI transforme les cours PDF en résumés clairs, génère
            automatiquement des quiz, suit les résultats des étudiants et aide
            les enseignants à créer une expérience e-learning moderne.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-7 py-4 font-black text-white shadow-2xl shadow-fuchsia-950/40 transition hover:scale-[1.02]"
            >
              Créer un compte
              <ArrowRight size={20} />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-white backdrop-blur-xl transition hover:bg-white/10"
            >
              <PlayCircle size={20} />
              Se connecter
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-3xl font-black">AI</p>
              <p className="mt-1 text-sm text-white/50">Résumé PDF</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-3xl font-black">Quiz</p>
              <p className="mt-1 text-sm text-white/50">Auto-généré</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-3xl font-black">JWT</p>
              <p className="mt-1 text-sm text-white/50">Sécurisé</p>
            </div>
          </div>
        </div>

        {/* HERO IMAGE CARD */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-[42px] bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 blur-2xl"></div>

          <div className="relative overflow-hidden rounded-[42px] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
            <div className="rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 p-4">
              <img
                src="/images/Home.png"
                alt="SmartLearn AI"
                className="h-full w-full rounded-[28px] object-contain"
              />
            </div>

            <div className="absolute left-8 top-8 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
              <p className="text-xs text-white/50">Assistant IA</p>
              <p className="font-bold text-white">Résumé généré</p>
            </div>

            <div className="absolute bottom-8 right-8 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
              <p className="text-xs text-white/50">Progression</p>
              <p className="font-bold text-white">+82% réussite</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 font-bold text-fuchsia-300">Fonctionnalités</p>
          <h2 className="text-4xl font-black md:text-5xl">
            Tout ce qu’il faut pour un e-learning intelligent
          </h2>
          <p className="mt-4 text-white/55">
            Une plateforme complète avec gestion de cours, IA, quiz,
            statistiques et accès sécurisé par rôle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<UploadCloud />}
            title="Upload PDF"
            text="Les enseignants ajoutent leurs supports de cours facilement."
          />
          <FeatureCard
            icon={<FileText />}
            title="Résumé automatique"
            text="Extraction du contenu et résumé intelligent du cours."
          />
          <FeatureCard
            icon={<BookOpen />}
            title="Quiz intelligent"
            text="Création automatique de questions depuis le document."
          />
          <FeatureCard
            icon={<BarChart3 />}
            title="Dashboard"
            text="Suivi des cours, quiz, utilisateurs et résultats."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[40px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 font-bold text-violet-300">Processus</p>
              <h2 className="text-4xl font-black">
                Du PDF au quiz en quelques étapes
              </h2>
              <p className="mt-4 text-white/55">
                SmartLearn AI simplifie le travail de l’enseignant et améliore
                la révision de l’étudiant.
              </p>
            </div>

            <div className="space-y-5">
              <Step number="01" title="Créer un cours" text="L’enseignant ajoute le titre, la description et le support PDF." />
              <Step number="02" title="Analyser le document" text="La plateforme extrait le texte du PDF automatiquement." />
              <Step number="03" title="Générer résumé et quiz" text="L’IA prépare un résumé clair et des questions QCM." />
              <Step number="04" title="Suivre les résultats" text="L’étudiant répond au quiz et les scores sont enregistrés." />
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 font-bold text-fuchsia-300">Espaces utilisateurs</p>
          <h2 className="text-4xl font-black md:text-5xl">
            Une plateforme pour chaque rôle
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <RoleCard
            title="Admin"
            items={["Gestion utilisateurs", "Statistiques globales", "Supervision plateforme"]}
          />
          <RoleCard
            title="Enseignant"
            items={["Création de cours", "Upload PDF", "Génération de quiz"]}
          />
          <RoleCard
            title="Étudiant"
            items={["Consulter les cours", "Passer les quiz", "Voir sa progression"]}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10">
        <div className="overflow-hidden rounded-[40px] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-10 text-center shadow-2xl shadow-fuchsia-950/40 md:p-16">
          <h2 className="text-4xl font-black md:text-5xl">
            Prêt à lancer SmartLearn AI ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/75">
            Commence maintenant et découvre une expérience e-learning moderne,
            intelligente et sécurisée.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-2xl bg-white px-7 py-4 font-black text-[#080A18] transition hover:scale-[1.02]"
            >
              Créer un compte
            </Link>

            <Link
              to="/login"
              className="rounded-2xl border border-white/20 bg-white/10 px-7 py-4 font-black text-white backdrop-blur-xl transition hover:bg-white/20"
            >
              Connexion
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-white/45">
            © 2026 SmartLearn AI. Intelligent E-Learning Platform.
          </p>

          <div className="flex items-center gap-5 text-sm text-white/45">
            <span>FastAPI</span>
            <span>React</span>
            <span>JWT</span>
            <span>AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="group rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-950/30">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/50">{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="flex gap-5 rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-[#080A18]">
        {number}
      </div>
      <div>
        <h3 className="font-black">{title}</h3>
        <p className="mt-1 text-sm text-white/50">{text}</p>
      </div>
    </div>
  );
}

function RoleCard({ title, items }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
        <ShieldCheck className="text-fuchsia-300" size={28} />
      </div>

      <h3 className="text-2xl font-black">{title}</h3>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm text-white/60">
            <CheckCircle2 size={18} className="text-violet-300" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;