import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  BookOpen,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-[#070B17] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-[-100px] top-[-100px] h-[320px] w-[320px] rounded-full bg-violet-600/20 blur-[120px]"></div>
        <div className="absolute right-[-100px] top-[80px] h-[320px] w-[320px] rounded-full bg-fuchsia-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-120px] left-[20%] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
      </div>

      <header className="relative z-20 border-b border-white/10 bg-[#070B17]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="SmartLearn AI"
              className="h-12 w-12 rounded-2xl bg-white p-1 object-contain"
            />
            <div>
              <h1 className="text-xl font-extrabold">SmartLearn AI</h1>
              <p className="text-xs text-white/45">
                Plateforme e-learning intelligente
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-white/65 hover:text-white transition">
              Fonctionnalités
            </a>
            <a href="#about" className="text-sm text-white/65 hover:text-white transition">
              À propos
            </a>
            <a href="#contact" className="text-sm text-white/65 hover:text-white transition">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Connexion
            </Link>
            <Link
              to="/signup"
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-900/30 transition hover:scale-[1.02]"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200">
              <Sparkles size={16} />
              Nouvelle génération d’apprentissage intelligent
            </div>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Apprendre plus vite avec{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                SmartLearn AI
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              Une plateforme moderne pour gérer les cours, générer des quiz,
              résumer les contenus avec l’intelligence artificielle et suivre la
              progression des étudiants en temps réel.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-semibold text-white shadow-xl shadow-fuchsia-950/30 transition hover:scale-[1.02]"
              >
                Créer un compte
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Se connecter
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-3xl font-black">+100</p>
                <p className="mt-2 text-sm text-white/50">Cours gérés</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-3xl font-black">+1K</p>
                <p className="mt-2 text-sm text-white/50">Quiz générés</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-3xl font-black">98%</p>
                <p className="mt-2 text-sm text-white/50">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-violet-600/20 blur-3xl"></div>
            <div className="absolute -right-10 bottom-10 h-32 w-32 rounded-full bg-fuchsia-600/20 blur-3xl"></div>

            <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl">
              <img
                src="/images/hero-home.png"
                alt="SmartLearn AI interface"
                className="h-full w-full rounded-[24px] object-cover"
              />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
              Fonctionnalités
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Tout ce qu’il faut pour une plateforme moderne
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/55">
              Une expérience complète pour les admins, les enseignants et les
              étudiants.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              icon={<BookOpen size={26} />}
              title="Gestion des cours"
              text="Ajout de cours, upload PDF et organisation des contenus."
            />
            <FeatureCard
              icon={<Brain size={26} />}
              title="IA intégrée"
              text="Résumés automatiques et assistance intelligente pour l’apprentissage."
            />
            <FeatureCard
              icon={<ClipboardList size={26} />}
              title="Quiz intelligents"
              text="Génération et soumission de quiz adaptés aux cours."
            />
            <FeatureCard
              icon={<BarChart3 size={26} />}
              title="Suivi et résultats"
              text="Tableaux de bord, progression et résultats détaillés."
            />
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-3xl font-black">Pourquoi SmartLearn AI ?</h2>
              <p className="mt-5 text-white/60 leading-8">
                SmartLearn AI modernise l’expérience e-learning en combinant
                design moderne, automatisation et intelligence artificielle pour
                rendre l’apprentissage plus simple, plus rapide et plus
                interactif.
              </p>

              <div className="mt-8 space-y-4">
                <CheckItem text="Interface moderne et intuitive" />
                <CheckItem text="Gestion des rôles : admin, enseignant, étudiant" />
                <CheckItem text="Résumés automatiques par IA" />
                <CheckItem text="Quiz et résultats en temps réel" />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 p-8 backdrop-blur-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
                <ShieldCheck size={30} className="text-fuchsia-300" />
              </div>

              <h3 className="text-2xl font-black">Sécurité & performance</h3>
              <p className="mt-4 text-white/60 leading-8">
                Authentification sécurisée, séparation des rôles, dashboards
                personnalisés et structure évolutive pour faire grandir la
                plateforme dans le temps.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <MiniInfo title="JWT Auth" />
                <MiniInfo title="Dashboards par rôle" />
                <MiniInfo title="IA + quiz" />
                <MiniInfo title="Architecture scalable" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-[36px] border border-white/10 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 p-10 text-center backdrop-blur-xl">
            <h2 className="text-3xl font-black sm:text-4xl">
              Prêt à commencer avec SmartLearn AI ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              Rejoins une nouvelle façon d’apprendre avec une plateforme
              intelligente, élégante et performante.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-2xl bg-white px-6 py-4 font-bold text-[#070B17] transition hover:scale-[1.02]"
              >
                Créer un compte
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Connexion
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/55">{text}</p>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-3 text-white/70">
      <CheckCircle2 size={20} className="text-fuchsia-400" />
      <span>{text}</span>
    </div>
  );
}

function MiniInfo({ title }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/75">
      {title}
    </div>
  );
}

export default Home;