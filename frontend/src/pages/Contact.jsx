import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Phone,
  Globe,
  Link2,
} from "lucide-react";
import Footer from "../components/Footer";
 
function Contact() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
 
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
 
    if (!nom || !email || !sujet || !message) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
 
    // Simulation d'envoi
    setSuccess("Message envoyé avec succès ! On vous répondra très bientôt.");
    setNom("");
    setEmail("");
    setSujet("");
    setMessage("");
  };
 
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
            <MessageSquare size={16} />
            Contactez-nous
          </div>
          <h1 className="text-4xl font-black sm:text-5xl lg:text-6xl">
            On est là pour vous
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/55 leading-8">
            Une question, une suggestion ou un problème ? N'hésitez pas à nous écrire.
          </p>
        </section>
 
        {/* Content */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
 
            {/* Infos */}
            <div className="space-y-5">
              <InfoCard
                icon={<Mail size={22} />}
                title="Email"
                value="contact@smartlearn.ai"
              />
              <InfoCard
                icon={<Phone size={22} />}
                title="Téléphone"
                value="+213 XXX XXX XXX"
              />
              <InfoCard
                icon={<MapPin size={22} />}
                title="Localisation"
                value="Algérie"
              />
 
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <p className="font-bold mb-4">Nos réseaux</p>
                <div className="flex gap-3">
                  <a href="#" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition">
                    <Globe size={16} />
                  </a>
                  <a href="#" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition">
                    <Link2 size={16} />
                  </a>
                  <a href="#" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition">
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
 
            {/* Form */}
            <div className="lg:col-span-2 rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-black mb-6">Envoyer un message</h2>
 
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white/70">
                      Nom complet
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
                    <label className="mb-2 block text-sm font-semibold text-white/70">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-violet-500 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
 
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/70">
                    Sujet
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-violet-500 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
                    value={sujet}
                    onChange={(e) => setSujet(e.target.value)}
                    placeholder="Ex: Question sur la plateforme"
                  />
                </div>
 
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/70">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-violet-500 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20 resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message ici..."
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
                  <Send size={18} />
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
 
      <Footer />
    </div>
  );
}
 
function InfoCard({ icon, title, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">{title}</p>
        <p className="mt-1 font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
 
export default Contact;