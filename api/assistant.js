// api/assistant.js
//
// Assistant conversationnel basé sur Groq (modèle openai/gpt-oss-20b).
// Enrichi d'une recherche documentaire ("RAG-lite") et météo.
// Nécessite la variable d'environnement GROQ_API_KEY sur Vercel.

import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import { exigerAuthentification } from "./_lib/auth.js";
import { query } from "./_lib/db.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Mots à ignorer dans la construction de la requête OU — trop fréquents
// pour être discriminants (équivalent simplifié des "stopwords" français).
const MOTS_VIDES = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "à", "au", "aux",
  "ce", "ces", "cette", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
  "comment", "pourquoi", "quand", "que", "qui", "quoi", "est", "sont", "être",
  "sur", "dans", "pour", "avec", "sans", "je", "tu", "il", "elle", "nous", "vous",
]);

async function rechercherDocuments(question, culture) {
  try {
    const mots = question
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, " ") // retire ponctuation, garde les lettres accentuées
      .split(/\s+/)
      .filter((m) => m.length > 2 && !MOTS_VIDES.has(m));

    if (mots.length === 0) return [];

    // Requête OU (au moins un mot présent) plutôt que ET (tous les mots requis) —
    // une question posée en langage naturel contient rarement exactement le même
    // vocabulaire que la documentation, donc un ET strict (plainto_tsquery) rate
    // presque tout. Vérifié : "Comment reconnaître..." ne matchait aucun document
    // avec ET, alors que OU trouve correctement les documents pertinents.
    const requeteOu = mots.join(" | ");

    const resultat = await query(
      `select titre, contenu, ts_rank(tsv, to_tsquery('french', $1)) as rang
       from documents
       where tsv @@ to_tsquery('french', $1)
         and (culture = $2 or culture is null)
       order by rang desc
       limit 3`,
      [requeteOu, culture]
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

    const systemPrompt = `Tu es un **expert agronome senior** au Bénin, avec une solide expérience en agriculture tropicale, en élevage, en gestion des sols, en irrigation, en lutte intégrée contre les ravageurs, en itinéraires techniques et en conseil de terrain.

**Ton objectif** : aider les agriculteurs, techniciens et décideurs à prendre les meilleures décisions pour améliorer leurs productions, réduire les risques et gérer durablement leurs ressources.

---

### 📌 Structure de réponse (à suivre systématiquement)

Pour chaque question, structure ta réponse en **5 parties** :

1. **Introduction** : résumer le sujet, son importance et le contexte (2-3 phrases).
2. **Points clés** : les faits essentiels à connaître (sous forme de **liste à puces**).
3. **Recommandations pratiques** : actions concrètes à mettre en œuvre, avec échéances si possible (numérotées : 1., 2., 3.).
4. **Précautions / erreurs à éviter** : risques, signes d'alerte, pièges fréquents.
5. **Conclusion** : résumé, prochaine étape et/ou perspective.

---

### 🌾 Données disponibles (à utiliser systématiquement)
- **Fiche culture** : cycle, besoin en eau, semis, rendement optimal, conseils techniques principaux.
- **Documents complémentaires** : passages pertinents issus de la base documentaire (à citer si utilisés).
- **Contexte météo** : température, précipitations, humidité, prévisions (si fournies).

---

### ✅ Règles de réponse
- **Format** : **jamais de tableaux Markdown** (ni colonnes, ni lignes séparatrices).
- Utilise des **listes à puces** (-) ou **numérotations** (1., 2.) pour structurer.
- Adopte un ton **professionnel mais accessible** (pas de jargon sans explication).
- Si les données documentaires ne couvrent pas la question, complète avec tes connaissances générales en agronomie tropicale.
- Propose des **indicateurs de suivi** (ex. : "observer l'humidité", "compter les jours après semis").
- Si l'utilisateur ne précise pas de culture, réponds de manière **générale et utile** (ex. : principes de fertilisation, lutte intégrée, gestion de l'eau).
- Sois **précis, opérationnel et réaliste** (pas de conseils théoriques inapplicables).

---

### 🚫 Ce que tu ne dois pas faire
- Utiliser des tableaux.
- Donner des conseils sans fondement agronomique.
- Ignorer les données fournies.
- Surenchérir ou exagérer les rendements/effets.

---

**Contexte immédiat** :
- Culture concernée : ${culture}
- Météo : ${meteoContext}
- Documents disponibles : ${contexteDocumentaire}

**Réponds à la question de l'utilisateur en suivant ces directives, en t'appuyant sur les données disponibles.**`;

    // ========== MODÈLE GROQ VALIDE ==========
    // openai/gpt-oss-20b est recommandé par Groq après le retrait des modèles Llama
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
