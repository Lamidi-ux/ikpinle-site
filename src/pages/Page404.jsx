import React from "react";
import { Link } from "react-router-dom";

export default function Page404() {
  return (
    <section className="max-w-md mx-auto px-6 py-32 text-center">
      <div className="font-serif text-6xl text-[#D9C9A8] mb-4">404</div>
      <h1 className="font-serif text-2xl mb-4">Page introuvable</h1>
      <p className="text-[#4A4033] mb-8">Cette page n'existe pas ou a été déplacée.</p>
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-6 py-3.5 rounded-sm hover:bg-[#25392F] transition-colors"
      >
        Retour à l'accueil
      </Link>
    </section>
  );
}
