// api/auth/login.js
import { query } from "../_lib/db.js";
import { verifierMotDePasse, genererToken } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  const { email, motDePasse } = req.body || {};
  if (!email || !motDePasse) {
    return res.status(400).json({ erreur: "email et motDePasse sont requis." });
  }

  try {
    const resultat = await query(
      "select id, email, nom, role, mot_de_passe_hash from utilisateurs where email = $1",
      [email]
    );

    if (resultat.rows.length === 0) {
      return res.status(401).json({ erreur: "Email ou mot de passe incorrect." });
    }

    const ligne = resultat.rows[0];
    const motDePasseValide = await verifierMotDePasse(motDePasse, ligne.mot_de_passe_hash);
    if (!motDePasseValide) {
      return res.status(401).json({ erreur: "Email ou mot de passe incorrect." });
    }

    const utilisateur = { id: ligne.id, email: ligne.email, nom: ligne.nom, role: ligne.role };
    const token = genererToken(utilisateur);

    return res.status(200).json({ utilisateur, token });
  } catch (err) {
    console.error("Erreur login:", err);
    return res.status(500).json({ erreur: "Erreur serveur lors de la connexion." });
  }
}
