// api/messages/index.js
import { exigerAuthentification } from "../_lib/auth.js";
import { query } from "../_lib/db.js";

export default async function handler(req, res) {
  const utilisateur = exigerAuthentification(req, res);
  if (!utilisateur) return;

  if (req.method === "GET") {
    try {
      const resultat = await query(
        `select m.id, m.contenu, m.lu, m.created_at,
                e.id as expediteur_id, e.nom as expediteur_nom,
                d.id as destinataire_id, d.nom as destinataire_nom
         from messages m
         join utilisateurs e on e.id = m.expediteur_id
         join utilisateurs d on d.id = m.destinataire_id
         where m.expediteur_id = $1 or m.destinataire_id = $1
         order by m.created_at desc
         limit 100`,
        [utilisateur.id]
      );
      return res.status(200).json({ messages: resultat.rows });
    } catch (err) {
      console.error("Erreur GET messages:", err);
      return res.status(500).json({ erreur: "Erreur serveur." });
    }
  }

  if (req.method === "POST") {
    const { destinataireId, contenu } = req.body || {};
    if (!destinataireId || !contenu || !contenu.trim()) {
      return res.status(400).json({ erreur: "destinataireId et contenu sont requis." });
    }

    try {
      const resultat = await query(
        `insert into messages (expediteur_id, destinataire_id, contenu)
         values ($1, $2, $3) returning *`,
        [utilisateur.id, destinataireId, contenu.trim()]
      );
      return res.status(201).json({ message: resultat.rows[0] });
    } catch (err) {
      console.error("Erreur POST messages:", err);
      return res.status(500).json({ erreur: "Erreur serveur lors de l'envoi." });
    }
  }

  if (req.method === "PATCH") {
    const { messageId } = req.body || {};
    if (!messageId) {
      return res.status(400).json({ erreur: "messageId est requis." });
    }
    try {
      await query(
        "update messages set lu = true where id = $1 and destinataire_id = $2",
        [messageId, utilisateur.id]
      );
      return res.status(200).json({ succes: true });
    } catch (err) {
      console.error("Erreur PATCH messages:", err);
      return res.status(500).json({ erreur: "Erreur serveur." });
    }
  }

  return res.status(405).json({ erreur: "Méthode non autorisée." });
}
