import React from "react";

const COMMUNES_ECHANTILLON = [
  "Pobè", "Sakété", "Cotonou", "Parakou", "Djougou", "Natitingou",
  "Abomey", "Kandi", "Abomey-Calavi", "Porto-Novo",
];

const CULTURES = [
  { nom: "Maïs", cycle: "90 jours", besoin: "500mm" },
  { nom: "Niébé", cycle: "70 jours", besoin: "350mm" },
  { nom: "Arachide", cycle: "100 jours", besoin: "450mm" },
  { nom: "Sorgho", cycle: "110 jours", besoin: "450mm" },
  { nom: "Sésame", cycle: "90 jours", besoin: "350mm" },
  { nom: "Coton", cycle: "160 jours", besoin: "650mm" },
];

export default function Cultures() {
  return (
    <>
      <section className="bg-[#2A2420] text-[#F2EBDD]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-14">
            <div className="font-mono text-xs uppercase tracking-widest text-[#D4A94C] mb-3">Les cultures</div>
            <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
              Une fenêtre de semis par culture, pas une date unique
            </h1>
            <p className="text-[#C9BEA8] leading-relaxed">
              Chaque culture a son propre cycle et son propre besoin en eau — la
              recommandation s'ajuste en conséquence, jamais générique.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-[#4A4033] rounded-2xl overflow-hidden">
            {CULTURES.map((c) => (
              <div key={c.nom} className="bg-[#2A2420] p-6">
                <h2 className="font-serif text-xl mb-3">{c.nom}</h2>
                <div className="flex justify-between font-mono text-[11px] uppercase tracking-wide text-[#8A7F68]">
                  <span>Cycle</span><span className="text-[#F2EBDD]">{c.cycle}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] uppercase tracking-wide text-[#8A7F68] mt-1.5">
                  <span>Besoin en eau</span><span className="text-[#F2EBDD]">{c.besoin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-xl mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-[#B8542D] mb-3">Couverture</div>
          <h2 className="font-serif text-3xl md:text-4xl leading-tight">Déjà présent dans tout le pays</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {COMMUNES_ECHANTILLON.map((c) => (
            <span key={c} className="font-mono text-xs uppercase tracking-wide border border-[#D9C9A8] rounded-full px-4 py-2 text-[#4A4033]">
              {c}
            </span>
          ))}
          <span className="font-mono text-xs uppercase tracking-wide rounded-full px-4 py-2 text-[#B8542D]">
            + 67 autres communes
          </span>
        </div>
      </section>
    </>
  );
}
