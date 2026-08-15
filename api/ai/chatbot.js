// api/ia/chatbot.js
//
// Chatbot agronomique simple à base de règles/mots-clés — répond aux
// questions fréquentes des agents sur les cultures suivies, sans dépendre
// d'un service IA externe payant. Peut être remplacé plus tard par un vrai
// modèle de langage si le besoin de réponses plus ouvertes se confirme.

import { exigerAuthentification } from "../_lib/auth.js";
import { query } from "../_lib/db.js";
import { REGLES_AGRONOMIQUES, CONSEILS_RENDEMENT } from "./recommandation.js";

function trouverCultureMentionnee(question) {
  const q = question.toLowerCase();
  const alias = {
    mais: ["mais", "maïs"],
    niebe: ["niebe", "niébé", "niebé"],
    arachide: ["arachide", "cacahuète", "cacahouete"],
    sorgho: ["sorgho"],
    sesame: ["sesame", "sésame"],
    coton: ["coton"],
  };
  for (const [cle, mots] of Object.entries(alias)) {
    if (mots.some((m) => q.includes(m))) return cle;
  }
  return null;
}

function repondre(question) {
  const q = question.toLowerCase();
  const culture = trouverCultureMentionnee(question);

  if (culture) {
    const regle = REGLES_AGRONOMIQUES[culture];
    const conseils = CONSEILS_RENDEMENT[culture] || [];

    if (q.includes("cycle") || q.includes("durée") || q.includes("duree")) {
      return `Le cycle du ${regle.nom.toLowerCase()} est d'environ ${regle.cycleJours} jours.`;
    }
    if (q.includes("eau") || q.includes("besoin") || q.includes("arros")) {
      return `Le ${regle.nom.toLowerCase()} nécessite environ ${regle.besoinEauMm}mm d'eau sur son cycle complet.`;
    }
    if (q.includes("rendement") || q.includes("conseil") || q.includes("augmenter")) {
      return `Conseils pour le ${regle.nom.toLowerCase()} :\n` + conseils.map((c) => `• ${c}`).join("\n");
    }
    if (q.includes("semis") || q.includes("semer") || q.includes("quand")) {
      return (
        `Pour le ${regle.nom.toLowerCase()}, le semis est recommandé entre ${regle.semisMin} et ` +
        `${regle.semisMax} jours après la confirmation du début de saison des pluies dans la commune concernée.`
      );
    }
    return (
      `${regle.nom} — cycle : ${regle.cycleJours}j, besoin en eau : ${regle.besoinEauMm}mm. ` +
      `Demandez-moi le rendement, le semis ou le besoin en eau pour plus de détails.`
    );
  }

  if (q.includes("bonjour") || q.includes("salut")) {
    return "Bonjour ! Posez-moi une question sur une culture (maïs, niébé, arachide, sorgho, sésame, coton) : cycle, besoin en eau, semis, ou conseils de rendement.";
  }

  return (
    "Je peux répondre aux questions sur le cycle, le besoin en eau, la période de semis et les " +
    "conseils de rendement des 6 cultures suivies (maïs, niébé, arachide, sorgho, sésame, coton). " +
    "Précisez la culture dans votre question."
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  const { question } = req.body || {};
  if (!question || !question.trim()) {
    return res.status(400).json({ erreur: "question est requise." });
  }

  const reponse = repondre(question.trim());

  try {
    await query(
      "insert into conversations_chatbot (utilisateur_id, question, reponse) values ($1, $2, $3)",
      [utilisateur.id, question.trim(), reponse]
    );
  } catch (err) {
    console.error("Erreur sauvegarde chatbot (non bloquant):", err);
  }

  return res.status(200).json({ question: question.trim(), reponse });
}
