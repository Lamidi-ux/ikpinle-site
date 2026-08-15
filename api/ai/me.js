// api/auth/me.js
import { exigerAuthentification } from "../_lib/auth.js";
import { query } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const utilisateurToken = exigerAuthentification(req, res);
  if (!utilisateurToken) return; // exigerAuthentification a déjà répondu 401

  try {
    const resultat = await query(
      "select id, email, nom, role, created_at from utilisateurs where id = $1",
      [utilisateurToken.id]
    );
    if (resultat.rows.length === 0) {
      return res.status(404).json({ erreur: "Utilisateur introuvable." });
    }
    return res.status(200).json({ utilisateur: resultat.rows[0] });
  } catch (err) {
    console.error("Erreur me:", err);
    return res.status(500).json({ erreur: "Erreur serveur." });
  }
}
