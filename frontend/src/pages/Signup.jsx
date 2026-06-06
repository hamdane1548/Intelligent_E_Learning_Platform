import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("etudiant");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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

      setSuccess("Compte créé avec succès. Redirection vers la connexion...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080A18] flex items-center justify-center px-6 py-8 relative overflow-hidden">
      <div className="absolute top-[-120px] right-[-120px] h-[420px] w-[420px] rounded-full bg-violet-600/30 blur-[120px]"></div>
      <div className="absolute bottom-[-120px] left-[-120px] h-[420px] w-[420px] rounded-full bg-fuchsia-500/25 blur-[120px]"></div>

      <div className="relative w-full max-w-6xl min-h-[720px] bg-white rounded-[36px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-10">
          <img
            src="/images/Signup.png"
            alt="Signup illustration"
            className="w-full max-w-[520px] object-contain drop-shadow-xl"
          />
        </div>

        <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="absolute top-12 right-12 h-40 w-40 rounded-full bg-violet-100 blur-3xl opacity-80"></div>
          <div className="absolute bottom-12 left-12 h-40 w-40 rounded-full bg-fuchsia-100 blur-3xl opacity-80"></div>

          <div className="relative z-10 w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-600 mb-8"
            >
              <ArrowLeft size={18} />
              Retour à l’accueil
            </Link>

            <div className="mb-8">
              <img
                src="/images/logo.png"
                alt="SmartLearn AI Logo"
                className="mb-6 h-20 w-20 object-contain"
              />

              <h2 className="text-4xl font-extrabold text-slate-900">
                Inscription
              </h2>

              <p className="mt-3 text-slate-500">
                Crée ton compte SmartLearn AI
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Ayssar"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Adresse email
                </label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@gmail.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rôle
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                </select>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
              >
                Créer mon compte
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Tu as déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-semibold text-violet-600 hover:text-fuchsia-600"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;