// api/ia/recommandation.js
//
// Port JS des règles agronomiques de moteur_agricole.py — combine la date
// de début de saison détectée avec le cycle et les besoins de la culture
// pour produire une fenêtre de semis recommandée.

import { exigerAuthentification } from "../_lib/auth.js";
import { query } from "../_lib/db.js";

export const REGLES_AGRONOMIQUES = {
  mais: { nom: "Maïs", cycleJours: 90, besoinEauMm: 500, semisMin: 0, semisMax: 10 },
  niebe: { nom: "Niébé", cycleJours: 70, besoinEauMm: 350, semisMin: 0, semisMax: 14 },
  arachide: { nom: "Arachide", cycleJours: 100, besoinEauMm: 450, semisMin: 3, semisMax: 14 },
  sorgho: { nom: "Sorgho", cycleJours: 110, besoinEauMm: 450, semisMin: 0, semisMax: 15 },
  sesame: { nom: "Sésame", cycleJours: 90, besoinEauMm: 350, semisMin: 0, semisMax: 10 },
  coton: { nom: "Coton", cycleJours: 160, besoinEauMm: 650, semisMin: 0, semisMax: 14 },
};

export const CONSEILS_RENDEMENT = {
  mais: [
    "Respecter un écartement d'environ 80cm entre les lignes et 40cm entre les poquets.",
    "Apporter un engrais de fond (NPK) au semis, puis un complément azoté vers 30 jours.",
    "Sarcler tôt pour limiter la concurrence des adventices.",
    "Surveiller la chenille légionnaire d'automne.",
  ],
  niebe: [
    "Éviter les excès d'azote, qui favorisent le feuillage au détriment des gousses.",
    "Pratiquer la rotation avec une céréale pour limiter les maladies du sol.",
    "Surveiller pucerons et thrips en début de floraison.",
  ],
  arachide: [
    "Privilégier un sol léger et bien drainé.",
    "Éviter de semer sur une parcelle ayant porté de l'arachide l'année précédente.",
    "Semer en ligne pour faciliter le sarclage et l'arrachage.",
  ],
  sorgho: [
    "Culture tolérante à la sécheresse, adaptée aux zones à pluviométrie irrégulière.",
    "Désherber tôt.",
    "Protéger contre les oiseaux granivores à l'approche de la maturité.",
  ],
  sesame: [
    "Semer peu profond (1-2cm).",
    "Choisir une parcelle bien drainée.",
    "Récolter avant déhiscence complète des capsules.",
  ],
  coton: [
    "Respecter le calendrier de traitement phytosanitaire local.",
    "Fractionner l'apport d'engrais NPK.",
    "Démarier tôt pour ajuster la densité de plants.",
  ],
};

function ajouterJours(dateStr, jours) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + jours);
  return d.toISOString().slice(0, 10);
}

function formaterDateFr(dateStr) {
  const [an, mois, jour] = dateStr.split("-");
  return `${jour}/${mois}/${an}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  const { commune, culture, annee } = req.query;
  if (!commune || !culture) {
    return res.status(400).json({ erreur: "commune et culture sont requis." });
  }
  if (!REGLES_AGRONOMIQUES[culture]) {
    return res.status(400).json({
      erreur: `Culture inconnue. Options : ${Object.keys(REGLES_AGRONOMIQUES).join(", ")}`,
    });
  }

  const anneeRecherche = annee || new Date().getFullYear();
  const regle = REGLES_AGRONOMIQUES[culture];

  try {
    const resultat = await query(
      `select date_debut_saison from detections_saison
       where commune = $1 and culture = $2 and annee = $3`,
      [commune, culture, anneeRecherche]
    );

    if (resultat.rows.length === 0 || !resultat.rows[0].date_debut_saison) {
      return res.status(200).json({
        commune,
        culture: regle.nom,
        confirme: false,
        message: `Aucun début de saison confirmé pour l'instant. Attendre avant de semer le ${regle.nom.toLowerCase()}.`,
        conseilsRendement: CONSEILS_RENDEMENT[culture] || [],
      });
    }

    const dateOnsetStr = resultat.rows[0].date_debut_saison.toISOString().slice(0, 10);
    const debutFenetre = ajouterJours(dateOnsetStr, regle.semisMin);
    const finFenetre = ajouterJours(dateOnsetStr, regle.semisMax);

    const message =
      `Semis ${regle.nom.toLowerCase()} recommandé entre le ${formaterDateFr(debutFenetre)} ` +
      `et le ${formaterDateFr(finFenetre)} (saison des pluies confirmée le ${formaterDateFr(dateOnsetStr)}).`;

    return res.status(200).json({
      commune,
      culture: regle.nom,
      confirme: true,
      dateDebutSaison: dateOnsetStr,
      fenetreSemis: { debut: debutFenetre, fin: finFenetre },
      cycleJours: regle.cycleJours,
      besoinEauMm: regle.besoinEauMm,
      message,
      conseilsRendement: CONSEILS_RENDEMENT[culture] || [],
    });
  } catch (err) {
    console.error("Erreur recommandation:", err);
    return res.status(500).json({ erreur: "Erreur serveur lors du calcul de la recommandation." });
  }
}
