import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";

const CULTURES = ["mais", "niebe", "arachide", "sorgho", "sesame", "coton"];

export default function Assistant() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [culture, setCulture] = useState("mais");
  const [statutPosition, setStatutPosition] = useState("");
  const messagesEndRef = useRef(null);

  const obtenirPosition = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve({ latitude: null, longitude: null })
      );
    });

  const envoyerMessage = async () => {
    const question = input.trim();
    if (!question) return;

    const messageUtilisateur = { role: "user", content: question };
    setMessages((prev) => [...prev, messageUtilisateur]);
    setInput("");
    setLoading(true);

    try {
      setStatutPosition("Localisation...");
      const position = await obtenirPosition();
      setStatutPosition(
        position.latitude ? "Météo locale prise en compte." : "Position indisponible — réponse sans contexte météo."
      );

      const reponse = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          culture,
          latitude: position.latitude,
          longitude: position.longitude,
        }),
      });

      const donnees = await reponse.json();
      const contenu = reponse.ok
        ? donnees.reponse || "Désolé, je n'ai pas pu générer de réponse."
        : donnees.erreur || "Erreur lors de la génération de la réponse.";

      setMessages((prev) => [...prev, { role: "assistant", content: contenu }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erreur de connexion." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] bg-[#F2EBDD] text-[#2A2420]">
      {/* Barre de sélection de culture */}
      <div className="px-6 py-3 border-b border-[#D9C9A8] bg-[#FBF7EE] flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-[#7A6B4F]">Assistant IA — Groq</div>
        <select
          value={culture}
          onChange={(e) => setCulture(e.target.value)}
          className="bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#2E6B8A]"
        >
          {CULTURES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {statutPosition && (
        <p className="px-6 py-1.5 text-xs text-[#7A6B4F] bg-[#FBF7EE] border-b border-[#D9C9A8]">{statutPosition}</p>
      )}

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-[#7A6B4F] text-center mt-8">
            Posez une question sur la culture sélectionnée — cycle, ravageurs, semis, rendement...
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-[#2F4A3C] text-[#F2EBDD]"
                  : "bg-[#FBF7EE] border border-[#D9C9A8] text-[#2A2420]"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl px-4 py-2.5 text-sm text-[#7A6B4F]">
              L'assistant réfléchit...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barre de saisie */}
      <div className="border-t border-[#D9C9A8] p-4 bg-[#FBF7EE]">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && envoyerMessage()}
            placeholder="Posez votre question..."
            className="flex-1 bg-[#F2EBDD] border border-[#D9C9A8] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]"
          />
          <button
            onClick={envoyerMessage}
            disabled={loading}
            className="font-mono text-xs uppercase tracking-widest bg-[#B8542D] text-[#F2EBDD] px-6 py-2.5 rounded-full hover:bg-[#A34823] transition-colors disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
