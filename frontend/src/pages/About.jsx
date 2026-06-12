import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  BookOpen,
  ClipboardList,
  BarChart3,
  Github,
  Linkedin,
  Mail,
  Code2,
  Layers,
  Cpu,
} from "lucide-react";
import Footer from "../components/Footer";
 
function About() {
  const team = [
    {
      name: "Oussama Hamdane",
      role: "Fullstack Developer",
      description: "Architecture backend, API REST et intégration IA.",
      icon: <Code2 size={22} />,
      gradient: "from-violet-600 to-fuchsia-600",
    },
    {
      name: "Aymen Benbouhia",
      role: "Frontend Developer",
      description: "Interface utilisateur, design système et expérience.",
      icon: <Layers size={22} />,
      gradient: "from-fuchsia-600 to-pink-600",
    },
    {
      name: "Hamza Kharbouch",
      role: "AI / RAG Engineer",
      description: "Système RAG, génération de quiz et modèles LLM.",
      icon: <Cpu size={22} />,
      gradient: "from-cyan-600 to-violet-600",
    },
  ];
 
  const techStack = [
    { label: "React", category: "Frontend" },
    { label: "TailwindCSS", category: "Frontend" },
    { label: "Spring Boot", category: "Backend" },
    { label: "FastAPI", category: "AI Services" },
    { label: "PostgreSQL", category: "Database" },
    { label: "LangChain", category: "AI / RAG" },
    { label: "Docker", category: "DevOps" },
    { label: "GitHub Actions", category: "CI/CD" },
  ];
 
  return (
    <div className="min-h-screen bg-[#070B17] text-white overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-[-100px] top-[-100px] h-[320px] w-[320px] rounded-full bg-violet-600/20 blur-[120px]"></div>
        <div className="absolute right-[-100px] top-[80px] h-[320px] w-[320px] rounded-full bg-fuchsia-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-120px] left-[20%] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
      </div>
 
      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-[#070B17]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="SmartLearn AI"
              className="h-12 w-12 rounded-2xl bg-white p-1 object-contain"
            />
            <div>
              <h1 className="text-xl font-extrabold">SmartLearn AI</h1>
              <p className="text-xs text-white/45">Plateforme e-learning intelligente</p>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </header>
 
      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200">
            <Brain size={16} />
            À propos du projet
          </div>
          <h1 className="text-4xl font-black sm:text-5xl lg:text-6xl">
            Qui sommes-nous ?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/55 leading-8">
            SmartLearn AI est un projet académique développé par une équipe passionnée,
            visant à moderniser l'enseignement grâce à l'intelligence artificielle.
          </p>
        </section>
 
        {/* Mission */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <MissionCard
              icon={<BookOpen size={26} />}
              title="Notre mission"
              text="Rendre l'apprentissage accessible, intelligent et interactif pour tous les étudiants et enseignants."
            />
            <MissionCard
              icon={<Brain size={26} />}
              title="Notre vision"
              text="Un futur où chaque étudiant bénéficie d'un tuteur IA personnalisé disponible à tout moment."
            />
            <MissionCard
              icon={<ClipboardList size={26} />}
              title="Notre approche"
              text="Combiner les meilleures technologies IA avec un design moderne pour une expérience optimale."
            />
          </div>
        </section>
 
        {/* Team */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
              Équipe
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Les développeurs du projet
            </h2>
          </div>
 
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {team.map((member, i) => (
              <div
                key={i}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10"
              >
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${member.gradient} text-white`}>
                  {member.icon}
                </div>
                <h3 className="text-xl font-black">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold text-fuchsia-300">{member.role}</p>
                <p className="mt-3 text-sm leading-7 text-white/55">{member.description}</p>
                <div className="mt-5 flex gap-3">
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition">
                    <Github size={16} />
                  </a>
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition">
                    <Linkedin size={16} />
                  </a>
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition">
                    <Mail size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
 
        {/* Tech Stack */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
              Technologies
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Stack technique utilisée
            </h2>
          </div>
 
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl"
              >
                <p className="font-bold text-white">{tech.label}</p>
                <p className="text-xs text-fuchsia-300 mt-1">{tech.category}</p>
              </div>
            ))}
          </div>
        </section>
 
        {/* Stats */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-[36px] border border-white/10 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 p-10 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
              <StatItem value="4" label="Développeurs" />
              <StatItem value="3" label="Modules IA" />
              <StatItem value="8+" label="Semaines de dev" />
              <StatItem value="100%" label="Open source" />
            </div>
          </div>
        </section>
      </main>
 
      <Footer />
    </div>
  );
}
 
function MissionCard({ icon, title, text }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/55">{text}</p>
    </div>
  );
}
 
function StatItem({ value, label }) {
  return (
    <div>
      <p className="text-4xl font-black">{value}</p>
      <p className="mt-2 text-sm text-white/50">{label}</p>
    </div>
  );
}
 
export default About;