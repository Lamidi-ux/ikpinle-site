// api/meteo.js
//
// Récupère la météo actuelle et les prévisions à 7 jours pour des
// coordonnées GPS données, via Open-Meteo (gratuit, sans clé API).
// Complète meteo_historique (données passées, par commune) avec une
// vue en temps réel, par coordonnées précises.

import { exigerAuthentification } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ erreur: "Les paramètres lat et lon sont requis." });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,relative_humidity_2m&daily=rain_sum,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const reponse = await fetch(url);
    if (!reponse.ok) throw new Error("Erreur Open-Meteo");
    const donnees = await reponse.json();
    return res.status(200).json(donnees);
  } catch (err) {
    console.error("Erreur meteo-locale:", err);
    return res.status(500).json({ erreur: "Impossible de récupérer la météo." });
  }
}
