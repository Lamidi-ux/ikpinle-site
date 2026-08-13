import React from "react";

const ETAPES = [
  {
    n: "01",
    titre: "Inscription",
    texte: "Le producteur s'inscrit avec son numéro, sa commune et sa culture — par SMS, USSD ou auprès d'un agent.",
  },
  {
    n: "02",
    titre: "Surveillance quotidienne",
    texte: "Chaque jour, le système interroge les données météo (NASA POWER, Open-Meteo) pour les 77 communes suivies.",
  },
  {
    n: "03",
    titre: "Détection du vrai départ",
    texte: "20mm de pluie cumulés sur 3 jours, puis vérification qu'aucune séquence sèche de 7 jours ne suit — pour écarter les faux départs de saison.",
  },
  {
    n: "04",
    titre: "Recommandation envoyée",
    texte: "Le producteur reçoit sa fenêtre de semis par SMS, WhatsApp ou USSD, avec des conseils pour augmenter son rendement.",
  },
];

export default function Methode() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-xl mb-14">
        <div className="font-mono text-xs uppercase tracking-widest text-[#B8542D] mb-3">La méthode</div>
        <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
          Du premier orage au vrai début de saison
        </h1>
        <p className="text-[#4A4033] leading-relaxed">
          Un faux départ de saison — pluie précoce suivie d'une longue sécheresse — peut
          détruire un semis. La méthode d'Ikpinlè distingue les deux, jour après jour.
        </p>
      </div>
      <div className="grid md:grid-cols-4 gap-px bg-[#D9C9A8] rounded-2xl overflow-hidden">
        {ETAPES.map((e) => (
          <div key={e.n} className="bg-[#EBE1CB] p-7 flex flex-col">
            <span className="font-serif text-4xl text-[#D9C9A8] mb-4">{e.n}</span>
            <h2 className="font-serif text-lg mb-2">{e.titre}</h2>
            <p className="text-sm text-[#4A4033] leading-relaxed">{e.texte}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
