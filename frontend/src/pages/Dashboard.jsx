import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    API.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard SmartLearn AI
          </h1>
          <p className="text-slate-600 mt-2">
            Connecté : <strong>{user?.nom}</strong> — rôle :{" "}
            <strong>{user?.role}</strong>
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>

      {!stats ? (
        <p>Chargement des statistiques...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Utilisateurs</h2>
            <p>Total : {stats.users.total}</p>
            <p>Étudiants : {stats.users.students}</p>
            <p>Enseignants : {stats.users.teachers}</p>
            <p>Admins : {stats.users.admins}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Cours</h2>
            <p>Total : {stats.courses.total}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Quiz</h2>
            <p>Total : {stats.quizzes.total}</p>
            <p>Résultats : {stats.quizzes.results}</p>
            <p>Moyenne : {stats.quizzes.average_score_percent}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;