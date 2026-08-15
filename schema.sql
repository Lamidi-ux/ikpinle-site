-- ============================================================
-- Schéma de base de données — Ikpinlè Platform (admin/agents)
-- Base PostgreSQL indépendante (Vercel Postgres / Neon)
-- ============================================================

create table utilisateurs (
    id bigserial primary key,
    email text not null unique,
    mot_de_passe_hash text not null,
    nom text not null,
    role text not null default 'agent' check (role in ('admin', 'agent')),
    created_at timestamptz not null default now()
);

create table producteurs (
    id bigserial primary key,
    nom text,
    telephone text not null,
    commune text not null,
    culture text not null,
    superficie_ha numeric,
    type_sol text,
    whatsapp boolean not null default false,
    cree_par bigint references utilisateurs(id),
    created_at timestamptz not null default now(),
    unique (telephone, culture)
);

create table meteo_historique (
    id bigserial primary key,
    commune text not null,
    date date not null,
    pluie_mm numeric,
    source text default 'nasa_power',
    created_at timestamptz not null default now(),
    unique (commune, date)
);

create table detections_saison (
    id bigserial primary key,
    commune text not null,
    culture text not null,
    annee int not null,
    date_debut_saison date,
    message_recommandation text,
    detecte_par bigint references utilisateurs(id),
    created_at timestamptz not null default now(),
    unique (commune, culture, annee)
);

create table videos (
    id bigserial primary key,
    titre text not null,
    description text,
    url text not null,
    culture text,
    ajoute_par bigint references utilisateurs(id),
    created_at timestamptz not null default now()
);

create table messages (
    id bigserial primary key,
    expediteur_id bigint references utilisateurs(id),
    destinataire_id bigint references utilisateurs(id),
    contenu text not null,
    lu boolean not null default false,
    created_at timestamptz not null default now()
);

create table conversations_chatbot (
    id bigserial primary key,
    utilisateur_id bigint references utilisateurs(id),
    question text not null,
    reponse text not null,
    created_at timestamptz not null default now()
);

create index idx_producteurs_commune on producteurs(commune);
create index idx_meteo_commune_date on meteo_historique(commune, date);
create index idx_messages_destinataire on messages(destinataire_id, lu);
