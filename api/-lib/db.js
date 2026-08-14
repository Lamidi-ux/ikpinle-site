// api/_lib/db.js
// Connexion PostgreSQL partagée par toutes les fonctions serverless.
// Le pool est réutilisé entre les invocations quand la fonction reste "chaude",
// ce qui évite de recréer une connexion à chaque appel.

import pg from "pg";

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL n'est pas définie dans les variables d'environnement.");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = getPool();
  return client.query(text, params);
}
