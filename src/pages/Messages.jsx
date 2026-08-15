import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";

export default function Messages() {
  const { token, utilisateur } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [destinataireId, setDestinataireId] = useState("");
  const [contenu, setContenu] = useState("");
  const [erreur, setErreur] = useState("");

  const charger = async () => {
    setChargement(true);
    try {
      const reponse = await fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } });
      const donnees = await reponse.json();
      setMessages(donnees.messages || []);
    } catch {
      setErreur("Impossible de charger les messages.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []); // eslint-disable-line

  const envoyer = async (e) => {
    e.preventDefault();
    if (!destinataireId || !contenu.trim()) return;
    setErreur("");
    try {
      const reponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ destinataireId: Number(destinataireId), contenu }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.erreur || "Échec de l'envoi.");
      setContenu("");
      charger();
    } catch (e) {
      setErreur(e.message);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <div className="font-mono text-xs uppercase tracking-widest text-[#B8542D] mb-2">Communication interne</div>
      <h1 className="font-serif text-3xl mb-8">Messages</h1>

      <form onSubmit={envoyer} className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl p-6 mb-8 space-y-3">
        {erreur && <div className="text-sm text-[#B8542D]">{erreur}</div>}
        <input
          placeholder="ID du destinataire"
          value={destinataireId}
          onChange={(e) => setDestinataireId(e.target.value)}
          className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        />
        <textarea
          rows={3}
          placeholder="Votre message..."
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        />
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-4 py-2.5 rounded-sm hover:bg-[#25392F] transition-colors"
        >
          Envoyer
        </button>
      </form>

      {chargement ? (
        <p className="text-sm text-[#7A6B4F]">Chargement...</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const envoye = m.expediteur_id === utilisateur.id;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border text-sm max-w-[80%] ${
                  envoye
                    ? "ml-auto bg-[#2F4A3C] text-[#F2EBDD] border-[#2F4A3C]"
                    : "bg-[#FBF7EE] border-[#D9C9A8]"
                }`}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-70 mb-1">
                  {envoye ? `À ${m.destinataire_nom}` : `De ${m.expediteur_nom}`}
                </div>
                <p>{m.contenu}</p>
              </div>
            );
          })}
          {messages.length === 0 && <p className="text-sm text-[#7A6B4F]">Aucun message pour l'instant.</p>}
        </div>
      )}
    </section>
  );
}
