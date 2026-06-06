import { Link } from "react-router-dom";
import { ArrowLeft, Home, Search } from "lucide-react";
 
function NotFound() {
  return (
    <div className="min-h-screen bg-[#070B17] text-white overflow-hidden flex items-center justify-center">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-[-100px] top-[-100px] h-[320px] w-[320px] rounded-full bg-violet-600/20 blur-[120px]"></div>
        <div className="absolute right-[-100px] top-[80px] h-[320px] w-[320px] rounded-full bg-fuchsia-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-120px] left-[20%] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
      </div>
 
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-20 text-center">
        {/* 404 Number */}
        <div className="relative mb-8 inline-block">
          <p className="text-[180px] font-black leading-none select-none bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent opacity-20">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-[28px] border border-white/10 bg-white/5 px-8 py-5 backdrop-blur-xl">
              <Search size={40} className="mx-auto text-fuchsia-300" />
            </div>
          </div>
        </div>
 
        {/* Message */}
        <h1 className="text-4xl font-black sm:text-5xl">
          Page introuvable
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-white/55 leading-8">
          La page que vous cherchez n'existe pas ou a été déplacée.
          Vérifiez l'URL ou retournez à l'accueil.
        </p>
 
        {/* Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-semibold text-white shadow-xl shadow-fuchsia-950/30 transition hover:scale-[1.02]"
          >
            <Home size={18} />
            Retour à l'accueil
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Aller au dashboard
          </Link>
        </div>
 
        {/* Quick links */}
        <div className="mt-12">
          <p className="text-sm text-white/40 mb-5">Liens utiles</p>
          <div className="flex flex-wrap justify-center gap-3">
            <QuickLink to="/login" label="Connexion" />
            <QuickLink to="/signup" label="Inscription" />
            <QuickLink to="/#features" label="Fonctionnalités" />
            <QuickLink to="/about" label="À propos" />
            <QuickLink to="/contact" label="Contact" />
          </div>
        </div>
      </div>
    </div>
  );
}
 
function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition"
    >
      {label}
    </Link>
  );
}
 
export default NotFound;