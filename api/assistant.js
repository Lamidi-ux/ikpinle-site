// api/assistant.js
//
// Assistant conversationnel basé sur Groq (openai/gpt-oss-20b — Llama 3.1 8B
// a été retiré par Groq le 17 juin 2026, voir console.groq.com/docs/deprecations).
// Enrichi d'une recherche documentaire ("RAG-lite") et météo.
//
// Nécessite la variable d'environnement GROQ_API_KEY sur Vercel.

import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import { exigerAuthentification } from "./_lib/auth.js";
import { query } from "./_lib/db.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function rechercherDocuments(question, culture) {
  try {
    const resultat = await query(
      `select titre, contenu, ts_rank(tsv, plainto_tsquery('french', $1)) as rang
       from documents
       where tsv @@ plainto_tsquery('french', $1)
         and (culture = $2 or culture is null)
       order by rang desc
       limit 3`,
      [question, culture]
    );
    return resultat.rows;
  } catch (err) {
    console.error("Erreur recherche documents (non bloquant):", err);
    return [];
  }
}

export default async function handler(req, res) {
  // ========== GESTION CORS ==========
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // =================================

  if (req.method !== "POST") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  try {
    const { question, culture, latitude, longitude } = req.body || {};

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({ erreur: "La question est requise." });
    }
    if (!culture || typeof culture !== "string") {
      return res.status(400).json({ erreur: "Le nom de la culture est requis." });
    }

    const cropsPath = path.join(process.cwd(), "data", "crops.json");
    const cropsData = JSON.parse(fs.readFileSync(cropsPath, "utf-8"));
    const cropInfo = cropsData[culture.toLowerCase()];

    if (!cropInfo) {
      return res.status(404).json({ erreur: `Aucune donnée pour la culture "${culture}".` });
    }

    let meteoContext = "Aucune donnée météo fournie (coordonnées manquantes).";
    if (latitude && longitude) {
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,relative_humidity_2m&daily=rain_sum,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const meteoRes = await fetch(meteoUrl);
      if (meteoRes.ok) {
        const meteoData = await meteoRes.json();
        const current = meteoData.current;
        const daily = meteoData.daily;
        meteoContext = `Conditions actuelles : température ${current.temperature_2m}°C, précipitations ${current.precipitation} mm, humidité ${current.relative_humidity_2m}%. Prévisions sur 7 jours : pluie totale ${daily.rain_sum.reduce((a, b) => a + b, 0)} mm, températures max ${Math.max(...daily.temperature_2m_max)}°C, min ${Math.min(...daily.temperature_2m_min)}°C.`;
      } else {
        meteoContext = "Données météo non disponibles pour le moment.";
      }
    }

    const documents = await rechercherDocuments(question, culture.toLowerCase());
    const contexteDocumentaire = documents.length
      ? documents.map((d) => `[${d.titre}]\n${d.contenu}`).join("\n\n")
      : "Aucun document complémentaire trouvé pour cette question.";

    const systemPrompt = `Tu es un expert agronome au Bénin, spécialiste des cultures tropicales.

Fiche culture pour "${culture}" :
- Cycle : ${cropInfo.cycle} jours
- Besoin en eau : ${cropInfo.besoin_eau_mm} mm
- Période de semis : ${cropInfo.semis}
- Rendement optimal : ${cropInfo.rendement_optimal}
- Conseils techniques : ${cropInfo.conseils}

Documentation complémentaire pertinente pour cette question :
${contexteDocumentaire}

Contexte météo (si disponible) : ${meteoContext}

Réponds à la question de l'agriculteur de manière claire, précise et utile, en t'appuyant sur ces informations. Si la documentation complémentaire ne couvre pas la question, réponds avec tes connaissances générales d'agronomie tropicale, sans l'inventer comme si elle venait de la documentation fournie.`;

    // ========== MODÈLE GROQ VALIDE ==========
    // llama-3.1-8b-instant et llama-3.3-70b-versatile ont été retirés par Groq
    // le 17 juin 2026. Remplacement recommandé par Groq : openai/gpt-oss-20b.
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.6,
      max_tokens: 800,
    });

    const reponse = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

    return res.status(200).json({
      reponse,
      sourcesUtilisees: documents.map((d) => d.titre),
    });
  } catch (err) {
    console.error("Erreur assistant:", err);

    // Messages d'erreur explicites pour l'utilisateur
    let messageErreur = "Une erreur interne est survenue.";
    if (err.status === 400 && err.error?.error?.code === "model_decommissioned") {
      messageErreur = "Le modèle IA a été retiré. Veuillez contacter l'administrateur.";
    } else if (err.status === 404 && err.error?.error?.code === "model_not_found") {
      messageErreur = "Le modèle IA n'est pas accessible. Vérifiez votre clé API Groq.";
    } else if (err.status === 401) {
      messageErreur = "Clé API Groq invalide ou manquante.";
    }

    return res.status(500).json({ erreur: messageErreur });
  }
}
