import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const { connecter } = useAuth();
  const navigate = useNavigate();

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur("");

    if (motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setEnvoi(true);
    try {
      const reponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, motDePasse }),
      });
      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur || "Échec de l'inscription.");
        return;
      }

      connecter(donnees.token, donnees.utilisateur);
      navigate("/tableau-de-bord");
    } catch {
      setErreur("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-serif text-3xl mb-2">Créer un compte</h1>
      <p className="text-[#4A4033] mb-8">Réservé aux agents et administrateurs d'Ikpinlè.</p>

      <form onSubmit={soumettre} className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl p-7 space-y-4">
        {erreur && (
          <div className="text-sm text-[#B8542D] bg-[#B8542D1A] border border-[#B8542D33] rounded-sm px-3 py-2">
            {erreur}
          </div>
        )}
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">
            Nom complet
          </label>
          <input
            type="text"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]"
            placeholder="vous@ikpinle.bj"
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">
            Mot de passe (8 caractères minimum)
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={envoi}
          className="w-full font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-6 py-3.5 rounded-sm hover:bg-[#25392F] transition-colors disabled:opacity-60"
        >
          {envoi ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="text-sm text-[#7A6B4F] mt-6 text-center">
        Déjà un compte ?{" "}
        <Link to="/connexion" className="text-[#2E6B8A] hover:underline">
          Se connecter
        </Link>
      </p>
    </section>
  );
}
