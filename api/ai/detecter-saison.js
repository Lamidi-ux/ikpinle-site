// api/ia/detecter-saison.js
//
// Port JavaScript de la logique de détection présente dans moteur_agricole.py
// (dépôt Python principal). Même méthode : cumul de pluie sur une fenêtre
// glissante >= seuil, confirmé par l'absence de séquence sèche prolongée
// dans les jours qui suivent — pour distinguer un vrai début de saison
// d'un faux départ.

import { exigerAuthentification } from "../_lib/auth.js";
import { query } from "../_lib/db.js";

const SEUIL_CUMUL_MM = 20;
const FENETRE_JOURS = 3;
const JOURS_SEQUENCE_SECHE = 7;
const JOURS_CONFIRMATION = 30;

function detecterDebutSaison(observationsTriees, anneeRecherche) {
  const debutRecherche = new Date(`${anneeRecherche}-01-01`);
  const donnees = observationsTriees.filter((o) => new Date(o.date) >= debutRecherche);

  for (let i = 0; i < donnees.length; i++) {
    const fenetre = donnees.slice(Math.max(0, i - FENETRE_JOURS + 1), i + 1);
    const cumul = fenetre.reduce((s, d) => s + (d.pluie_mm || 0), 0);

    if (cumul >= SEUIL_CUMUL_MM) {
      const fenetreConfirmation = donnees.slice(i, Math.min(i + JOURS_CONFIRMATION, donnees.length));
      let joursSecsConsecutifs = 0;
      let fauxDepart = false;

      for (const jour of fenetreConfirmation) {
        if ((jour.pluie_mm || 0) < 1.0) {
          joursSecsConsecutifs++;
          if (joursSecsConsecutifs >= JOURS_SEQUENCE_SECHE) {
            fauxDepart = true;
            break;
          }
        } else {
          joursSecsConsecutifs = 0;
        }
      }

      if (!fauxDepart) {
        return donnees[i].date;
      }
    }
  }
  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ erreur: "Méthode non autorisée." });
    }

    const utilisateur = exigerAuthentification(req, res);
    if (!utilisateur) return;

    const { commune, culture, annee } = req.body || {};
    if (!commune || !culture) {
      return res.status(400).json({ erreur: "commune et culture sont requis." });
    }
    const anneeRecherche = annee || new Date().getFullYear();

    const meteo = await query(
      "select date, pluie_mm from meteo_historique where commune = $1 order by date",
      [commune]
    );

    if (meteo.rows.length === 0) {
      return res.status(404).json({
        erreur: `Aucune donnée météo pour ${commune}. Importer l'historique d'abord.`,
      });
    }

    const dateOnset = detecterDebutSaison(meteo.rows, anneeRecherche);

    if (dateOnset) {
      await query(
        `insert into detections_saison (commune, culture, annee, date_debut_saison, detecte_par)
         values ($1, $2, $3, $4, $5)
         on conflict (commune, culture, annee)
         do update set date_debut_saison = excluded.date_debut_saison`,
        [commune, culture, anneeRecherche, dateOnset, utilisateur.id]
      );
    }

    return res.status(200).json({
      commune,
      culture,
      annee: anneeRecherche,
      dateDebutSaison: dateOnset,
      confirme: dateOnset !== null,
    });
  } catch (err) {
    console.error("Erreur detecter-saison:", err);
    return res.status(500).json({
      erreur: "Erreur serveur lors de la détection.",
      diagnostic: String(err && err.message ? err.message : err),
    });
  }
}
