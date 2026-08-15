import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Videos() {
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch("/api/videos", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setVideos(d.videos || []))
      .catch(() => setErreur("Impossible de charger les vidéos."))
      .finally(() => setChargement(false));
  }, [token]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#B8542D] mb-2">Formation</div>
          <h1 className="font-serif text-3xl">Vidéos</h1>
        </div>
        <Link
          to="/videos/nouvelle"
          className="font-mono text-xs uppercase tracking-widest bg-[#2F4A3C] text-[#F2EBDD] px-4 py-2.5 rounded-sm hover:bg-[#25392F] transition-colors"
        >
          + Ajouter une vidéo
        </Link>
      </div>

      {chargement && <p className="text-sm text-[#7A6B4F]">Chargement...</p>}
      {erreur && <p className="text-sm text-[#B8542D]">{erreur}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {videos.map((v) => (
          <div key={v.id} className="bg-[#FBF7EE] border border-[#D9C9A8] rounded-2xl p-6">
            <h2 className="font-serif text-lg mb-1">{v.titre}</h2>
            {v.culture && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A6B4F]">{v.culture}</span>
            )}
            {v.description && <p className="text-sm text-[#4A4033] mt-2">{v.description}</p>}
            <a
              href={v.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 font-mono text-xs uppercase tracking-widest text-[#2E6B8A] hover:underline"
            >
              Voir la vidéo →
            </a>
          </div>
        ))}
        {!chargement && videos.length === 0 && (
          <p className="text-sm text-[#7A6B4F]">Aucune vidéo ajoutée pour l'instant.</p>
        )}
      </div>
    </section>
  );
}
