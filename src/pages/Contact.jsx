import React from "react";

export default function Contact() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-[1fr_1fr] gap-14 items-start">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#B8542D] mb-3">Contact</div>
          <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-5">
            Vous accompagnez des producteurs ?
          </h1>
          <p className="text-[#4A4033] leading-relaxed mb-8 max-w-md">
            Coopératives, ONG, agents de terrain : Ikpinlè s'intègre à votre suivi
            existant. Écrivez-nous pour une démonstration ou une inscription en lot.
          </p>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex gap-3">
              <span className="text-[#7A6B4F] w-20 shrink-0">Porteur</span>
              <span>MOUSSILIOU Lamidi</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[#7A6B4F] w-20 shrink-0">Projet</span>
              <span>Ikpinlè — Bénin</span>
            </div>
          </div>
        </div>
        <form className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl p-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">Nom</label>
            <input type="text" className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]" placeholder="Votre nom" />
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">Téléphone</label>
            <input type="tel" className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]" placeholder="+229 01 XX XX XX XX" />
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-widest text-[#7A6B4F] block mb-1.5">Message</label>
            <textarea rows={3} className="w-full bg-transparent border border-[#D9C9A8] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E6B8A]" placeholder="Votre organisation, nombre de producteurs..." />
          </div>
          <button type="submit" className="w-full font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-6 py-3.5 rounded-sm hover:bg-[#25392F] transition-colors">
            Envoyer
          </button>
        </form>
      </div>
    </section>
  );
}
