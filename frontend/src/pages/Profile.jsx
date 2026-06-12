import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Save,
  ShieldCheck,
  BookOpen,
  ClipboardList,
  BarChart3,
  Camera,
} from "lucide-react";
 
function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
 
  const [nom, setNom] = useState(user.nom || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");
 
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nom || !email) {
      setError("Nom et email sont obligatoires.");
      return;
    }

    try {
      const response = await API.put("/users/me", { nom, email });
      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccess("Profil mis à jour avec succès !");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Erreur lors de la mise à jour du profil."
      );
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword) {
      setError("Veuillez remplir les deux champs.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      await API.put("/users/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("Mot de passe modifié avec succès !");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Erreur lors du changement de mot de passe."
      );
    }
  };
 
  const stats = [
    { icon: <BookOpen size={20} />, label: "Cours suivis", value: "12" },
    { icon: <ClipboardList size={20} />, label: "Quiz complétés", value: "34" },
    { icon: <BarChart3 size={20} />, label: "Score moyen", value: "87%" },
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
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Retour au dashboard
          </Link>
        </div>
      </header>
 
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        {/* Profile header */}
        <div className="mb-10 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-3xl font-black">
                {nom ? nom.charAt(0).toUpperCase() : "U"}
              </div>
              <button className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-600 text-white hover:bg-fuchsia-500 transition">
                <Camera size={14} />
              </button>
            </div>
 
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-black">{nom || "Utilisateur"}</h2>
              <p className="mt-1 text-white/50">{email || "email@example.com"}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-200">
                <ShieldCheck size={12} />
                {user.role || "Étudiant"}
              </div>
            </div>
 
            {/* Stats */}
            <div className="ml-auto hidden md:flex gap-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-fuchsia-300 mb-1">
                    {s.icon}
                  </div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* Tabs */}
        <div className="mb-6 flex gap-3">
          <TabButton
            active={activeTab === "info"}
            onClick={() => setActiveTab("info")}
            icon={<User size={16} />}
            label="Informations"
          />
          <TabButton
            active={activeTab === "password"}
            onClick={() => setActiveTab("password")}
            icon={<Lock size={16} />}
            label="Mot de passe"
          />
        </div>
 
        {/* Tab content */}
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          {activeTab === "info" && (
            <form onSubmit={handleSave} className="space-y-5 max-w-lg">
              <h3 className="text-xl font-black mb-6">Modifier mes informations</h3>
 
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                  <User size={14} /> Nom complet
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-violet-500 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
 
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                  <Mail size={14} /> Adresse email
                </label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-violet-500 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
 
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                  {success}
                </div>
              )}
 
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-900/30 transition hover:scale-[1.02]"
              >
                <Save size={18} />
                Sauvegarder
              </button>
            </form>
          )}
 
          {activeTab === "password" && (
            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
              <h3 className="text-xl font-black mb-6">Changer le mot de passe</h3>
 
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                  <Lock size={14} /> Mot de passe actuel
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-violet-500 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
 
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                  <Lock size={14} /> Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-violet-500 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                />
              </div>
 
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                  {success}
                </div>
              )}
 
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-900/30 transition hover:scale-[1.02]"
              >
                <Save size={18} />
                Modifier le mot de passe
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
 
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
          : "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
 
export default Profile;