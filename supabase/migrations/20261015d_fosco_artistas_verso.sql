-- O cartão de cada artista ganha um verso: as artes (até 4 fotos), o nome completo e o
-- site, além da bio e dos estilos que já existiam.
alter table public.fosco_artistas
  add column if not exists nome_completo text not null default '',
  add column if not exists site text not null default '',
  add column if not exists trabalhos text[] not null default '{}';
