// api/auth/register.js
import { query } from "../_lib/db.js";
import { hacherMotDePasse, genererToken } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const { email, motDePasse, nom, role } = req.body || {};

  if (!email || !motDePasse || !nom) {
    return res.status(400).json({ erreur: "email, motDePasse et nom sont requis." });
  }
  if (motDePasse.length < 8) {
    return res.status(400).json({ erreur: "Le mot de passe doit contenir au moins 8 caractères." });
  }

  const roleFinal = role === "admin" ? "admin" : "agent";

  try {
    const existant = await query("select id from utilisateurs where email = $1", [email]);
    if (existant.rows.length > 0) {
      return res.status(409).json({ erreur: "Un compte existe déjà avec cet email." });
    }

    const hash = await hacherMotDePasse(motDePasse);
    const resultat = await query(
      `insert into utilisateurs (email, mot_de_passe_hash, nom, role)
       values ($1, $2, $3, $4) returning id, email, nom, role`,
      [email, hash, nom, roleFinal]
    );

    const utilisateur = resultat.rows[0];
    const token = genererToken(utilisateur);

    return res.status(201).json({ utilisateur, token });
  } catch (err) {
    console.error("Erreur register:", err);
    return res.status(500).json({ erreur: "Erreur serveur lors de l'inscription." });
  }
}
