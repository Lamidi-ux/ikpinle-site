import React from "react";

const CANAUX = [
  {
    titre: "SMS",
    desc: "L'alerte de base, reçue par tout téléphone, même le plus simple.",
    detail: "Recommandation de semis, conseils de rendement",
  },
  {
    titre: "WhatsApp",
    desc: "Pour les producteurs équipés d'un smartphone, avec réponses possibles.",
    detail: "Messages enrichis, questions en retour",
  },
  {
    titre: "USSD",
    desc: "Un menu composé directement, sans forfait internet ni application.",
    detail: "Confirmer un semis, déclarer un rendement, situer sa parcelle",
  },
];

export default function Canaux() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-xl mb-14">
        <div className="font-mono text-xs uppercase tracking-widest text-[#B8542D] mb-3">Les canaux</div>
        <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
          Là où le producteur se trouve déjà
        </h1>
        <p className="text-[#4A4033] leading-relaxed">
          Aucune application à installer, aucune connexion internet requise pour l'essentiel.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {CANAUX.map((c) => (
          <div key={c.titre} className="rounded-2xl border border-[#D9C9A8] bg-[#FBF7EE] p-7">
            <div className="w-10 h-10 rounded-sm bg-[#2E6B8A] mb-5 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#F2EBDD]" />
            </div>
            <h2 className="font-serif text-xl mb-2">{c.titre}</h2>
            <p className="text-sm text-[#4A4033] leading-relaxed mb-4">{c.desc}</p>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#7A6B4F] border-t border-[#D9C9A8] pt-3">
              {c.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
