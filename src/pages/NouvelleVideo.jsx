import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const CULTURES = ["mais", "niebe", "arachide", "sorgho", "sesame", "coton"];

export default function NouvelleVideo() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [culture, setCulture] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      const reponse = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ titre, description, url, culture: culture || null }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur || "Échec de l'ajout.");
      navigate("/videos");
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <section className="max-w-lg mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl mb-6">Ajouter une vidéo</h1>
      <form onSubmit={soumettre} className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl p-7 space-y-4">
        {erreur && <div className="text-sm text-[#B8542D]">{erreur}</div>}
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">Titre</label>
          <input required value={titre} onChange={(e) => setTitre(e.target.value)}
            className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]" />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">URL de la vidéo</label>
          <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
            className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]" />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">Culture concernée (optionnel)</label>
          <select value={culture} onChange={(e) => setCulture(e.target.value)}
            className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]">
            <option value="">— Toutes cultures —</option>
            {CULTURES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">Description (optionnel)</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]" />
        </div>
        <button type="submit" disabled={envoi}
          className="w-full font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-6 py-3.5 rounded-sm hover:bg-[#25392F] transition-colors disabled:opacity-60">
          {envoi ? "Ajout..." : "Ajouter la vidéo"}
        </button>
      </form>
    </section>
  );
}
