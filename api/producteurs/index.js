// api/producteurs/index.js
import { exigerAuthentification } from "../_lib/auth.js";
import { query } from "../_lib/db.js";

export default async function handler(req, res) {
  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  if (req.method === "GET") {
    try {
      const { commune, culture } = req.query;
      const conditions = [];
      const params = [];

      if (commune) {
        params.push(commune);
        conditions.push(`commune = $${params.length}`);
      }
      if (culture) {
        params.push(culture);
        conditions.push(`culture = $${params.length}`);
      }

      const clauseWhere = conditions.length ? `where ${conditions.join(" and ")}` : "";
      const resultat = await query(
        `select id, nom, telephone, commune, culture, superficie_ha, type_sol, whatsapp, created_at
         from producteurs ${clauseWhere} order by created_at desc`,
        params
      );

      return res.status(200).json({ producteurs: resultat.rows });
    } catch (err) {
      console.error("Erreur GET producteurs:", err);
      return res.status(500).json({ erreur: "Erreur serveur." });
    }
  }

  if (req.method === "POST") {
    const { nom, telephone, commune, culture, superficieHa, typeSol, whatsapp } = req.body || {};
    if (!telephone || !commune || !culture) {
      return res.status(400).json({ erreur: "telephone, commune et culture sont requis." });
    }

    try {
      const resultat = await query(
        `insert into producteurs (nom, telephone, commune, culture, superficie_ha, type_sol, whatsapp, cree_par)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         on conflict (telephone, culture) do update set
           nom = excluded.nom, commune = excluded.commune,
           superficie_ha = excluded.superficie_ha, type_sol = excluded.type_sol,
           whatsapp = excluded.whatsapp
         returning *`,
        [nom || null, telephone, commune, culture, superficieHa || null, typeSol || null, !!whatsapp, utilisateur.id]
      );
      return res.status(201).json({ producteur: resultat.rows[0] });
    } catch (err) {
      console.error("Erreur POST producteurs:", err);
      return res.status(500).json({ erreur: "Erreur serveur lors de l'enregistrement." });
    }
  }

  return res.status(405).json({ erreur: "Méthode non autorisée." });
}
