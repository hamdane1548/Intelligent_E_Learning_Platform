import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#070B17] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="SmartLearn AI"
                className="h-12 w-12 rounded-2xl bg-white p-1 object-contain"
              />

              <div>
                <h2 className="text-xl font-extrabold">SmartLearn AI</h2>
                <p className="text-sm text-white/50">
                  Learn smarter with AI
                </p>
              </div>
            </div>

            <p className="text-sm leading-7 text-white/60">
              Une plateforme e-learning moderne qui combine cours, quiz,
              intelligence artificielle et suivi pédagogique pour offrir une
              expérience d’apprentissage innovante.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold">Navigation</h3>

            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link to="/" className="hover:text-fuchsia-400 transition">
                  Accueil
                </Link>
              </li>

              <li>
                <Link to="/login" className="hover:text-fuchsia-400 transition">
                  Connexion
                </Link>
              </li>

              <li>
                <Link to="/signup" className="hover:text-fuchsia-400 transition">
                  Inscription
                </Link>
              </li>

              <li>
                <a href="#features" className="hover:text-fuchsia-400 transition">
                  Fonctionnalités
                </a>
              </li>

              <li>
                <a href="#about" className="hover:text-fuchsia-400 transition">
                  À propos
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold">Fonctionnalités</h3>

            <ul className="space-y-3 text-sm text-white/60">
              <li>Quiz intelligents</li>
              <li>Gestion des cours</li>
              <li>Résumés automatiques</li>
              <li>Suivi étudiant</li>
              <li>Dashboard par rôle</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold">Contact</h3>

            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-fuchsia-400" />
                contact@smartlearnai.com
              </li>

              <li className="flex items-center gap-3">
                <Phone size={16} className="text-fuchsia-400" />
                +212 6 00 00 00 00
              </li>

              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-fuchsia-400" />
                Casablanca, Maroc
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-fuchsia-400"
              >
                GH
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-fuchsia-400"
              >
                IN
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-fuchsia-400"
              >
                <ExternalLink size={17} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row">
          <p>© 2026 SmartLearn AI. Tous droits réservés.</p>

          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-fuchsia-400 transition">
              Confidentialité
            </a>

            <a href="#" className="hover:text-fuchsia-400 transition">
              Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;