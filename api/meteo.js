// api/meteo.js
//
// Deux usages combinés dans un seul fichier, pour rester sous la limite de
// 12 fonctions serverless du plan gratuit Vercel :
//
//   GET  → météo actuelle + prévisions 7 jours par coordonnées GPS
//          (Open-Meteo, gratuit, sans clé API). Accessible à tout
//          utilisateur connecté.
//
//   POST → import de l'historique météo NASA POWER pour une commune donnée,
//          stocké dans meteo_historique. Réservé aux administrateurs.

import { exigerAuthentification } from "./_lib/auth.js";
import { query } from "./_lib/db.js";

const COMMUNES = {
  'Abomey': { lat: 7.1833, lon: 1.9917 },
  'Abomey-Calavi': { lat: 6.4485, lon: 2.3557 },
  'Adja-Ouèrè': { lat: 6.8500, lon: 2.7833 },
  'Adjarra': { lat: 6.4667, lon: 2.6333 },
  'Adjohoun': { lat: 6.7333, lon: 2.6833 },
  'Agbangnizoun': { lat: 7.0667, lon: 2.0333 },
  'Aguégués': { lat: 6.4500, lon: 2.7167 },
  'Akpro-Missérété': { lat: 6.5667, lon: 2.6833 },
  'Allada': { lat: 6.6500, lon: 2.1500 },
  'Aplahoué': { lat: 6.9333, lon: 1.6833 },
  'Athiémé': { lat: 6.5833, lon: 1.9000 },
  'Avrankou': { lat: 6.5500, lon: 2.6500 },
  'Banikoara': { lat: 11.3000, lon: 2.4333 },
  'Bantè': { lat: 8.4167, lon: 1.8833 },
  'Bassila': { lat: 9.0167, lon: 1.6667 },
  'Bembèrèkè': { lat: 10.2167, lon: 2.6667 },
  'Bohicon': { lat: 7.1833, lon: 2.0667 },
  'Bonou': { lat: 6.9000, lon: 2.4500 },
  'Bopa': { lat: 6.5833, lon: 1.9000 },
  'Boukoumbé': { lat: 10.2333, lon: 1.1000 },
  'Cobly': { lat: 10.5000, lon: 0.9500 },
  'Comè': { lat: 6.4167, lon: 1.8833 },
  'Copargo': { lat: 9.6667, lon: 1.5833 },
  'Cotonou': { lat: 6.3667, lon: 2.4333 },
  'Covè': { lat: 7.2167, lon: 2.3333 },
  'Dangbo': { lat: 6.5000, lon: 2.6500 },
  'Dassa-Zoumè': { lat: 7.7500, lon: 2.1833 },
  'Djakotomey': { lat: 6.9000, lon: 1.7167 },
  'Djidja': { lat: 7.3333, lon: 2.1833 },
  'Djougou': { lat: 9.7000, lon: 1.6667 },
  'Dogbo': { lat: 6.8000, lon: 1.7833 },
  'Glazoué': { lat: 7.9833, lon: 2.2333 },
  'Gogounou': { lat: 10.8333, lon: 2.8333 },
  'Grand-Popo': { lat: 6.2833, lon: 1.8333 },
  'Houéyogbé': { lat: 6.4667, lon: 1.9667 },
  'Ifangni': { lat: 6.6500, lon: 2.7000 },
  'Kalalé': { lat: 10.3000, lon: 3.0667 },
  'Kandi': { lat: 11.1333, lon: 2.9333 },
  'Karimama': { lat: 12.0667, lon: 3.1833 },
  'Klouékanmè': { lat: 7.0167, lon: 1.8833 },
  'Kouandé': { lat: 10.3333, lon: 1.7000 },
  'Kpomassè': { lat: 6.4500, lon: 2.1167 },
  'Kérou': { lat: 10.8333, lon: 2.1000 },
  'Kétou': { lat: 7.3667, lon: 2.6000 },
  'Lalo': { lat: 6.9167, lon: 1.8833 },
  'Lokossa': { lat: 6.6333, lon: 1.7167 },
  'Malanville': { lat: 11.8667, lon: 3.3833 },
  'Matéri': { lat: 10.7000, lon: 1.0833 },
  "N'Dali": { lat: 9.8667, lon: 2.7167 },
  'Natitingou': { lat: 10.3000, lon: 1.3667 },
  'Nikki': { lat: 9.9333, lon: 3.2000 },
  'Ouaké': { lat: 9.6333, lon: 1.3667 },
  'Ouassa-Péhunco': { lat: 10.0667, lon: 1.7000 },
  'Ouidah': { lat: 6.3667, lon: 2.0833 },
  'Ouinhi': { lat: 7.2333, lon: 2.5000 },
  'Ouèssè': { lat: 8.4833, lon: 2.4333 },
  'Parakou': { lat: 9.3500, lon: 2.6167 },
  'Pobè': { lat: 6.9833, lon: 2.6667 },
  'Porto-Novo': { lat: 6.4833, lon: 2.6167 },
  'Pèrèrè': { lat: 10.2500, lon: 2.7500 },
  'Sakété': { lat: 6.7333, lon: 2.6667 },
  'Savalou': { lat: 7.9333, lon: 1.9667 },
  'Savè': { lat: 8.0333, lon: 2.4833 },
  'Sinendé': { lat: 10.2833, lon: 2.3667 },
  'So-Ava': { lat: 6.4833, lon: 2.4167 },
  'Sèmè-Podji': { lat: 6.3667, lon: 2.6500 },
  'Ségbana': { lat: 10.9333, lon: 3.7000 },
  'Tanguiéta': { lat: 10.6167, lon: 1.2667 },
  'Tchaourou': { lat: 8.8833, lon: 2.6000 },
  'Toffo': { lat: 6.8500, lon: 2.0833 },
  'Tori-Bossito': { lat: 6.5667, lon: 2.1500 },
  'Toukountouna': { lat: 10.5000, lon: 1.3667 },
  'Toviklin': { lat: 6.9000, lon: 1.7000 },
  'Za-Kpota': { lat: 7.2667, lon: 2.1833 },
  'Zagnanado': { lat: 7.2667, lon: 2.3500 },
  'Zè': { lat: 6.8500, lon: 2.2500 },
  'Zogbodomey': { lat: 6.6500, lon: 2.5500 },
};

// ==============================================================
// GET — météo en direct par coordonnées
// ==============================================================

async function gererMeteoEnDirect(req, res) {
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
    console.error("Erreur meteo (GET):", err);
    return res.status(500).json({ erreur: "Impossible de récupérer la météo." });
  }
}

// ==============================================================
// POST — import historique NASA POWER (admin uniquement)
// ==============================================================

async function importerDonneesNASA(commune, annee) {
  const coords = COMMUNES[commune];
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR&community=AG&start=${annee}0101&end=${annee}1231&latitude=${coords.lat}&longitude=${coords.lon}&format=JSON`;

  const reponse = await fetch(url);
  if (!reponse.ok) {
    throw new Error(`HTTP ${reponse.status}: ${reponse.statusText}`);
  }

  const data = await reponse.json();
  const pluies = data.properties?.parameter?.PRECTOTCORR;
  if (!pluies) {
    throw new Error("Format de données NASA POWER inattendu");
  }

  let compteur = 0;
  for (const [dateStr, pluie] of Object.entries(pluies)) {
    const pluieMm = parseFloat(pluie);
    if (!Number.isNaN(pluieMm) && pluieMm >= 0) {
      const dateFormatee = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      await query(
        `insert into meteo_historique (commune, date, pluie_mm, source)
         values ($1, $2, $3, 'nasa_power')
         on conflict (commune, date)
         do update set pluie_mm = excluded.pluie_mm, source = 'nasa_power'`,
        [commune, dateFormatee, pluieMm]
      );
      compteur++;
    }
  }

  return { success: true, jours: compteur };
}

async function gererImportMeteo(req, res, utilisateur) {
  if (utilisateur.role !== "admin") {
    return res.status(403).json({
      erreur: "Accès refusé. Seuls les administrateurs peuvent importer des données météo.",
    });
  }

  const { commune, annee = new Date().getFullYear() } = req.body || {};

  if (!commune) {
    return res.status(400).json({
      erreur: "commune est requise.",
      communesDisponibles: Object.keys(COMMUNES),
    });
  }

  if (!COMMUNES[commune]) {
    return res.status(404).json({
      erreur: `Commune "${commune}" introuvable dans la liste.`,
      communesDisponibles: Object.keys(COMMUNES),
    });
  }

  try {
    const resultat = await importerDonneesNASA(commune, annee);
    return res.status(200).json({
      message: `Données importées pour ${commune}`,
      commune,
      annee,
      ...resultat,
    });
  } catch (err) {
    console.error("Erreur meteo (POST import):", err);
    return res.status(500).json({
      erreur: "Erreur serveur lors de l'importation des données.",
      diagnostic: String(err && err.message ? err.message : err),
    });
  }
}

// ==============================================================
// Point d'entrée unique
// ==============================================================

export default async function handler(req, res) {
  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  if (req.method === "GET") {
    return gererMeteoEnDirect(req, res);
  }

  if (req.method === "POST") {
    return gererImportMeteo(req, res, utilisateur);
  }

  return res.status(405).json({ erreur: "Méthode non autorisée." });
}
