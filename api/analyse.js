// api/analyse.js
//
// Analyse rapide basée sur les PRÉVISIONS à venir (7 jours), à ne pas
// confondre avec api/detectersaison.js qui analyse l'HISTORIQUE pour
// confirmer un vrai début de saison (avec protection contre les faux
// départs). Celle-ci est un indicateur complémentaire, plus simple et
// plus réactif, mais sans la même rigueur — à présenter comme tel.

import { exigerAuthentification } from "./_lib/auth.js";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  const { culture, latitude, longitude } = req.body || {};
  if (!culture) {
    return res.status(400).json({ erreur: "Culture requise." });
  }

  try {
    const cropsPath = path.join(process.cwd(), "data", "crops.json");
    const cropsData = JSON.parse(fs.readFileSync(cropsPath, "utf-8"));
    const crop = cropsData[culture.toLowerCase()];
    if (!crop) {
      return res.status(404).json({ erreur: `Culture "${culture}" inconnue.` });
    }

    let meteo = null;
    if (latitude && longitude) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=rain_sum&timezone=auto`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        const rainNext7 = data.daily.rain_sum.slice(0, 7).reduce((a, b) => a + b, 0);
        meteo = { pluie_7j: rainNext7, seuil_pluie: 20 };
      }
    }

    const analyse = {
      culture,
      cycle: crop.cycle,
      saisonDebutee: false,
      recommandation: "",
    };

    if (meteo && meteo.pluie_7j >= meteo.seuil_pluie) {
      analyse.saisonDebutee = true;
      analyse.recommandation = `Les prévisions annoncent des pluies suffisantes (${meteo.pluie_7j} mm sur 7 jours). Semis du ${culture} envisageable : ${crop.conseils}`;
    } else {
      analyse.recommandation = `Attendez des prévisions de pluie plus abondantes (seuil indicatif : ${meteo?.seuil_pluie || 20} mm sur 7 jours). En attendant, préparez le sol et les semences.`;
    }

    return res.status(200).json(analyse);
  } catch (err) {
    console.error("Erreur analyse-semis:", err);
    return res.status(500).json({ erreur: "Erreur lors de l'analyse." });
  }
}
