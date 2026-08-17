// api/assistant.js
//
// Assistant conversationnel basé sur un vrai modèle de langage (Groq/Llama),
// en complément du chatbot à base de règles (api/chatbot.js). Utile pour des
// questions plus ouvertes que le chatbot à mots-clés ne peut pas couvrir.
// Nécessite la variable d'environnement GROQ_API_KEY sur Vercel.

import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import { exigerAuthentification } from "./_lib/auth.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
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

    const systemPrompt = `Tu es un expert agronome au Bénin, spécialiste des cultures tropicales.
Voici les informations précises pour la culture "${culture}" :
- Cycle : ${cropInfo.cycle} jours
- Besoin en eau : ${cropInfo.besoin_eau_mm} mm
- Période de semis : ${cropInfo.semis}
- Rendement optimal : ${cropInfo.rendement_optimal}
- Conseils techniques : ${cropInfo.conseils}

Contexte météo (si disponible) : ${meteoContext}

Réponds à la question de l'agriculteur de manière claire, précise et utile, en te basant sur ces données. Si la météo est fournie, donne des recommandations adaptées aux conditions actuelles.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      model: "llama3-8b-8192",
      temperature: 0.6,
      max_tokens: 800,
    });

    const reponse = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

    return res.status(200).json({ reponse });
  } catch (err) {
    console.error("Erreur assistant:", err);
    return res.status(500).json({ erreur: "Une erreur interne est survenue." });
  }
}
