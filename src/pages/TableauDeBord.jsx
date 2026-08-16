import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";

const CULTURES = ["mais", "niebe", "arachide", "sorgho", "sesame", "coton"];

const FORM_PRODUCTEUR_VIDE = {
  nom: "",
  telephone: "",
  commune: "",
  culture: "mais",
  superficieHa: "",
  typeSol: "",
  whatsapp: false,
};

/**
 * Petit client HTTP partagé par toutes les sections du tableau de bord.
 * Centralise l'ajout du token, le parsing JSON défensif (pour ne jamais
 * planter le rendu si le serveur renvoie autre chose que du JSON), et la
 * normalisation des erreurs.
 */
function useApi() {
  const { token } = useAuth();

  const appeler = async (url, options = {}) => {
    const reponse = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    let donnees;
    try {
      donnees = await reponse.json();
    } catch {
      throw new Error(`Réponse invalide du serveur (statut ${reponse.status}).`);
    }

    if (!reponse.ok) {
      throw new Error(donnees.erreur || `Erreur serveur (statut ${reponse.status}).`);
    }
    return donnees;
  };

  return { appeler };
}

/** Nettoie une chaîne (espaces en trop) sans jamais planter sur une valeur non-string. */
function nettoyer(valeur) {
  return typeof valeur === "string" ? valeur.trim() : valeur;
}

// ==============================================================
// Section — Producteurs
// ==============================================================

function SectionProducteurs() {
  const { appeler } = useApi();
  const [producteurs, setProducteurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState(FORM_PRODUCTEUR_VIDE);
  const [envoi, setEnvoi] = useState(false);

  const charger = async () => {
    setChargement(true);
    try {
      const donnees = await appeler("/api/producteurs");
      setProducteurs(Array.isArray(donnees.producteurs) ? donnees.producteurs : []);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validerAvantEnvoi = () => {
    const telephone = nettoyer(form.telephone);
    const commune = nettoyer(form.commune);

    if (!telephone) return "Le numéro de téléphone est requis.";
    if (!commune) return "La commune est requise.";
    if (form.superficieHa !== "" && Number.isNaN(Number(form.superficieHa))) {
      return "La superficie doit être un nombre (ex : 1.5), sans unité.";
    }
    return null;
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur("");

    const messageValidation = validerAvantEnvoi();
    if (messageValidation) {
      setErreur(messageValidation);
      return;
    }

    setEnvoi(true);
    try {
      await appeler("/api/producteurs", {
        method: "POST",
        body: JSON.stringify({
          nom: nettoyer(form.nom) || null,
          telephone: nettoyer(form.telephone),
          commune: nettoyer(form.commune),
          culture: form.culture,
          superficieHa: form.superficieHa === "" ? null : Number(form.superficieHa),
          typeSol: nettoyer(form.typeSol) || null,
          whatsapp: form.whatsapp,
        }),
      });
      setForm(FORM_PRODUCTEUR_VIDE);
      await charger();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="grid md:grid-cols-[1fr_1.2fr] gap-8">
      <form
        onSubmit={soumettre}
        className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl p-6 space-y-3 h-fit"
      >
        <h3 className="font-serif text-lg mb-2">Enregistrer un producteur</h3>

        {erreur && (
          <div className="text-sm text-[#B8542D] bg-[#B8542D1A] border border-[#B8542D33] rounded-sm px-3 py-2">
            {erreur}
          </div>
        )}

        <input
          placeholder="Nom (optionnel)"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        />

        <input
          placeholder="Téléphone (+229...)"
          required
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        />

        <input
          placeholder="Commune"
          required
          value={form.commune}
          onChange={(e) => setForm({ ...form, commune: e.target.value })}
          className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        />

        <select
          value={form.culture}
          onChange={(e) => setForm({ ...form, culture: e.target.value })}
          className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        >
          {CULTURES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          placeholder="Superficie en hectares (ex : 1.5) — optionnel"
          type="number"
          step="0.01"
          min="0"
          value={form.superficieHa}
          onChange={(e) => setForm({ ...form, superficieHa: e.target.value })}
          className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        />

        <label className="flex items-center gap-2 text-sm text-[#4A4033]">
          <input
            type="checkbox"
            checked={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.checked })}
          />
          Reçoit sur WhatsApp
        </label>

        <button
          type="submit"
          disabled={envoi}
          className="w-full font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-4 py-2.5 rounded-sm hover:bg-[#25392F] transition-colors disabled:opacity-60"
        >
          {envoi ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <div>
        <h3 className="font-serif text-lg mb-3">
          Producteurs enregistrés ({producteurs.length})
        </h3>
        {chargement ? (
          <p className="text-sm text-[#7A6B4F]">Chargement...</p>
        ) : (
          <div className="border border-[#D9C9A8] rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            {producteurs.map((p) => (
              <div
                key={p.id}
                className="px-4 py-3 border-b border-[#D9C9A8] last:border-0 bg-[#FBF7EE] flex justify-between items-center text-sm"
              >
                <div>
                  <div className="font-medium">{p.nom || p.telephone}</div>
                  <div className="text-[#7A6B4F] text-xs">
                    {p.commune} · {p.culture}
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase text-[#7A6B4F]">
                  {p.whatsapp ? "WhatsApp" : "SMS"}
                </span>
              </div>
            ))}
            {producteurs.length === 0 && (
              <p className="px-4 py-6 text-sm text-[#7A6B4F] text-center">
                Aucun producteur enregistré ici pour l'instant.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==============================================================
// Section — Détection IA
// ==============================================================

function SectionDetectionIA() {
  const { appeler } = useApi();
  const [commune, setCommune] = useState("");
  const [culture, setCulture] = useState("mais");
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const lancer = async (e) => {
    e.preventDefault();
    const communeNettoyee = nettoyer(commune);
    if (!communeNettoyee) {
      setErreur("Merci de renseigner une commune.");
      return;
    }

    setChargement(true);
    setErreur("");
    setResultat(null);
    try {
      await appeler("/api/ia/detecter-saison", {
        method: "POST",
        body: JSON.stringify({ commune: communeNettoyee, culture }),
      });
      const recommandation = await appeler(
        `/api/ia/recommandation?commune=${encodeURIComponent(communeNettoyee)}&culture=${culture}`
      );
      setResultat(recommandation);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl p-6">
      <h3 className="font-serif text-lg mb-4">Détection IA — début de saison</h3>
      <form onSubmit={lancer} className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Commune"
          required
          value={commune}
          onChange={(e) => setCommune(e.target.value)}
          className="flex-1 min-w-[140px] bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        />
        <select
          value={culture}
          onChange={(e) => setCulture(e.target.value)}
          className="bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        >
          {CULTURES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={chargement}
          className="font-mono text-xs uppercase tracking-widest bg-[#B8542D] text-[#F2EBDD] px-4 py-2 rounded-sm hover:bg-[#A34823] transition-colors disabled:opacity-60"
        >
          {chargement ? "Analyse..." : "Analyser"}
        </button>
      </form>

      {erreur && <p className="text-sm text-[#B8542D] mb-3">{erreur}</p>}

      {resultat && (
        <div className="border-t border-[#D9C9A8] pt-4 text-sm space-y-2">
          <p>{resultat.message}</p>
          {Array.isArray(resultat.conseilsRendement) && resultat.conseilsRendement.length > 0 && (
            <ul className="list-disc list-inside text-[#4A4033] space-y-1">
              {resultat.conseilsRendement.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ==============================================================
// Section — Assistant agronomique (chatbot)
// ==============================================================

function SectionChatbot() {
  const { appeler } = useApi();
  const [question, setQuestion] = useState("");
  const [historique, setHistorique] = useState([]);
  const [envoi, setEnvoi] = useState(false);

  const poser = async (e) => {
    e.preventDefault();
    const q = nettoyer(question);
    if (!q) return;

    setEnvoi(true);
    setQuestion("");
    try {
      const donnees = await appeler("/api/ia/chatbot", {
        method: "POST",
        body: JSON.stringify({ question: q }),
      });
      setHistorique((h) => [...h, { question: q, reponse: donnees.reponse }]);
    } catch (e) {
      setHistorique((h) => [...h, { question: q, reponse: `Erreur : ${e.message}` }]);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl p-6">
      <h3 className="font-serif text-lg mb-4">Assistant agronomique</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {historique.map((h, i) => (
          <div key={i} className="text-sm">
            <p className="font-medium">{h.question}</p>
            <p className="text-[#4A4033] whitespace-pre-line">{h.reponse}</p>
          </div>
        ))}
        {historique.length === 0 && (
          <p className="text-sm text-[#7A6B4F]">
            Posez une question sur une culture (cycle, besoin en eau, semis, rendement).
          </p>
        )}
      </div>
      <form onSubmit={poser} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Votre question..."
          className="flex-1 bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2E6B8A]"
        />
        <button
          type="submit"
          disabled={envoi}
          className="font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-4 py-2 rounded-sm hover:bg-[#25392F] transition-colors disabled:opacity-60"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}

// ==============================================================
// Page
// ==============================================================

export default function TableauDeBord() {
  const { utilisateur } = useAuth();

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-[#B8542D] mb-2">
          Tableau de bord
        </div>
        <h1 className="font-serif text-3xl">Bonjour, {utilisateur?.nom}</h1>
      </div>

      <SectionProducteurs />
      <div className="grid md:grid-cols-2 gap-8">
        <SectionDetectionIA />
        <SectionChatbot />
      </div>
    </section>
  );
}
