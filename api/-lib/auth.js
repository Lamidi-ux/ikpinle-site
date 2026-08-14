// api/_lib/auth.js
// Utilitaires d'authentification : hachage de mot de passe (bcryptjs, pure JS —
// pas de dépendance native, compatible serverless) et JSON Web Tokens.

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_EXPIRATION = "7d";

export async function hacherMotDePasse(motDePasse) {
  const sel = await bcrypt.genSalt(12);
  return bcrypt.hash(motDePasse, sel);
}

export async function verifierMotDePasse(motDePasse, hash) {
  return bcrypt.compare(motDePasse, hash);
}

export function genererToken(utilisateur) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET n'est pas défini dans les variables d'environnement.");
  }
  return jwt.sign(
    { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}

export function verifierToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extrait et vérifie le token depuis l'en-tête Authorization d'une requête.
 * Retourne le payload décodé, ou null si absent/invalide.
 */
export function utilisateurDepuisRequete(req) {
  const entete = req.headers.authorization || "";
  const token = entete.startsWith("Bearer ") ? entete.slice(7) : null;
  if (!token) return null;
  return verifierToken(token);
}

/**
 * Middleware simple : renvoie 401 si la requête n'est pas authentifiée,
 * sinon retourne le payload utilisateur. À utiliser en tête de chaque
 * fonction serverless protégée.
 */
export function exigerAuthentification(req, res) {
  const utilisateur = utilisateurDepuisRequete(req);
  if (!utilisateur) {
    res.status(401).json({ erreur: "Authentification requise." });
    return null;
  }
  return utilisateur;
}
