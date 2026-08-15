// api/videos/index.js
import { exigerAuthentification } from "../_lib/auth.js";
import { query } from "../_lib/db.js";

export default async function handler(req, res) {
  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  if (req.method === "GET") {
    try {
      const { culture } = req.query;
      const params = [];
      let clauseWhere = "";
      if (culture) {
        params.push(culture);
        clauseWhere = "where culture = $1";
      }

      const resultat = await query(
        `select v.id, v.titre, v.description, v.url, v.culture, v.created_at, u.nom as ajoute_par_nom
         from videos v left join utilisateurs u on u.id = v.ajoute_par
         ${clauseWhere} order by v.created_at desc`,
        params
      );
      return res.status(200).json({ videos: resultat.rows });
    } catch (err) {
      console.error("Erreur GET videos:", err);
      return res.status(500).json({ erreur: "Erreur serveur." });
    }
  }

  if (req.method === "POST") {
    const { titre, description, url, culture } = req.body || {};
    if (!titre || !url) {
      return res.status(400).json({ erreur: "titre et url sont requis." });
    }

    try {
      const resultat = await query(
        `insert into videos (titre, description, url, culture, ajoute_par)
         values ($1, $2, $3, $4, $5) returning *`,
        [titre, description || null, url, culture || null, utilisateur.id]
      );
      return res.status(201).json({ video: resultat.rows[0] });
    } catch (err) {
      console.error("Erreur POST videos:", err);
      return res.status(500).json({ erreur: "Erreur serveur lors de l'ajout." });
    }
  }

  return res.status(405).json({ erreur: "Méthode non autorisée." });
}
