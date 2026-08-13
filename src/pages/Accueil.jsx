import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function useJaugePluie() {
  const [jour, setJour] = useState(0);
  const sequence = [0, 6, 14, 22, 22, 22, 22];
  useEffect(() => {
    const id = setInterval(() => {
      setJour((j) => (j + 1) % (sequence.length + 2));
    }, 1400);
    return () => clearInterval(id);
  }, []);
  const cumulActuel = sequence[Math.min(jour, sequence.length - 1)];
  const confirme = jour >= sequence.length;
  return { jour: Math.min(jour, sequence.length - 1), cumulActuel, confirme, sequence };
}

function JaugePluie() {
  const { jour, cumulActuel, confirme, sequence } = useJaugePluie();
  const seuil = 20;

  return (
    <div className="relative rounded-2xl border border-[#D9C9A8] bg-[#FBF7EE] p-8 shadow-[0_2px_0_#D9C9A8]">
      <div className="flex items-baseline justify-between mb-6">
        <span className="font-mono text-xs tracking-widest text-[#7A6B4F] uppercase">
          Simulation — Pobè, saison en cours
        </span>
        <span
          className={`font-mono text-xs tracking-widest uppercase transition-colors duration-500 ${
            confirme ? "text-[#2F4A3C]" : "text-[#B8542D]"
          }`}
        >
          {confirme ? "● Début de saison confirmé" : "○ En observation"}
        </span>
      </div>

      <div className="flex items-end gap-2 h-40 mb-4">
        {sequence.map((cumul, i) => {
          const h = Math.min((cumul / seuil) * 100, 100);
          const actif = i <= jour;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <div className="relative w-full h-full flex items-end">
                <div
                  className="w-full rounded-t-sm transition-all duration-700 ease-out"
                  style={{
                    height: actif ? `${h}%` : "2%",
                    background: actif
                      ? i === sequence.length - 1 && confirme
                        ? "#2F4A3C"
                        : "#2E6B8A"
                      : "#E3D8BE",
                    opacity: actif ? 1 : 0.5,
                  }}
                />
                <div
                  className="absolute w-full border-t border-dashed"
                  style={{ bottom: "100%", borderColor: "#B8542D33" }}
                />
              </div>
              <span className="font-mono text-[10px] text-[#7A6B4F]">J{i + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-[#D9C9A8] pt-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#7A6B4F]">Cumul 3 jours</div>
          <div className="font-serif text-2xl text-[#2A2420]">{cumulActuel}mm</div>
        </div>
        <div className="h-8 w-px bg-[#D9C9A8]" />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#7A6B4F]">Seuil de détection</div>
          <div className="font-serif text-2xl text-[#2A2420]">{seuil}mm</div>
        </div>
        <div className="h-8 w-px bg-[#D9C9A8]" />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#7A6B4F]">Période sèche</div>
          <div className="font-serif text-2xl text-[#2A2420]">0 / 7j</div>
        </div>
      </div>
    </div>
  );
}

export default function Accueil() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#B8542D] mb-5">
            Conseil agricole par intelligence artificielle — Bénin
          </div>
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight mb-6">
            Savoir exactement<br />quand semer,<br />
            <span className="text-[#2E6B8A]">commune par commune.</span>
          </h1>
          <p className="text-lg text-[#4A4033] leading-relaxed max-w-md mb-8">
            Ikpinlè surveille la pluviométrie réelle de 77 communes du Bénin et alerte
            chaque producteur, par SMS, WhatsApp ou USSD, dès que le vrai début de la
            saison des pluies est confirmé — pas au premier orage.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="font-mono text-xs uppercase tracking-widest bg-[#B8542D] text-[#F2EBDD] px-6 py-3.5 rounded-sm hover:bg-[#A34823] transition-colors">
              Inscrire des producteurs
            </Link>
            <Link to="/methode" className="font-mono text-xs uppercase tracking-widest border border-[#2A2420] px-6 py-3.5 rounded-sm hover:bg-[#2A2420] hover:text-[#F2EBDD] transition-colors">
              Voir la méthode
            </Link>
          </div>
          <div className="flex gap-8 mt-12 pt-8 border-t border-[#D9C9A8]">
            <div>
              <div className="font-serif text-3xl text-[#2A2420]">77</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#7A6B4F] mt-1">Communes couvertes</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-[#2A2420]">6</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#7A6B4F] mt-1">Cultures suivies</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-[#2A2420]">3</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#7A6B4F] mt-1">Canaux d'alerte</div>
            </div>
          </div>
        </div>
        <JaugePluie />
      </div>
    </section>
  );
}
