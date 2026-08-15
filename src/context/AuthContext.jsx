import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("ikpinle_token"));
  const [chargement, setChargement] = useState(true);

  const chargerProfil = useCallback(async (tokenActuel) => {
    if (!tokenActuel) {
      setUtilisateur(null);
      setChargement(false);
      return;
    }
    try {
      const reponse = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${tokenActuel}` },
      });
      if (!reponse.ok) throw new Error("Session invalide");
      const donnees = await reponse.json();
      setUtilisateur(donnees.utilisateur);
    } catch {
      localStorage.removeItem("ikpinle_token");
      setToken(null);
      setUtilisateur(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerProfil(token);
  }, [token, chargerProfil]);

  const connecter = (nouveauToken, nouvelUtilisateur) => {
    localStorage.setItem("ikpinle_token", nouveauToken);
    setToken(nouveauToken);
    setUtilisateur(nouvelUtilisateur);
  };

  const deconnecter = () => {
    localStorage.removeItem("ikpinle_token");
    setToken(null);
    setUtilisateur(null);
  };

  return (
    <AuthContext.Provider value={{ utilisateur, token, chargement, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}
