import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

function Navbar() {
  const [ouvert, setOuvert] = useState(false);

  const lienClasse = ({ isActive }) =>
    `hover:text-[#B8542D] transition-colors ${isActive ? "text-[#B8542D]" : ""}`;

  return (
    <header className="sticky top-0 z-50 bg-[#F2EBDD]/95 backdrop-blur border-b border-[#D9C9A8]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#2F4A3C] flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4A94C]" />
          </div>
          <span className="font-serif text-lg tracking-tight text-[#2A2420]">Ikpinlè</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest text-[#5A4F3C]">
          <NavLink to="/methode" className={lienClasse}>Méthode</NavLink>
          <NavLink to="/canaux" className={lienClasse}>Canaux</NavLink>
          <NavLink to="/cultures" className={lienClasse}>Cultures</NavLink>
          <NavLink to="/contact" className={lienClasse}>Contact</NavLink>
        </nav>
        <Link
          to="/contact"
          className="hidden md:inline-block font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-4 py-2 rounded-sm hover:bg-[#25392F] transition-colors"
        >
          Nous contacter
        </Link>
        <button className="md:hidden text-[#2A2420]" onClick={() => setOuvert(!ouvert)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {ouvert ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {ouvert && (
        <div className="md:hidden border-t border-[#D9C9A8] px-6 py-4 flex flex-col gap-4 font-mono text-xs uppercase tracking-widest text-[#5A4F3C]">
          <NavLink to="/methode" className={lienClasse} onClick={() => setOuvert(false)}>Méthode</NavLink>
          <NavLink to="/canaux" className={lienClasse} onClick={() => setOuvert(false)}>Canaux</NavLink>
          <NavLink to="/cultures" className={lienClasse} onClick={() => setOuvert(false)}>Cultures</NavLink>
          <NavLink to="/contact" className={lienClasse} onClick={() => setOuvert(false)}>Contact</NavLink>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-sm bg-[#2F4A3C] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#D4A94C]" />
        </div>
        <span className="font-serif text-sm">Ikpinlè</span>
      </div>
      <span className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F]">
        Conseil agricole IA — Bénin
      </span>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F2EBDD] text-[#2A2420]" style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Source+Sans+3:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
