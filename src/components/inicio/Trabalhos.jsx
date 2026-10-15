'use client';
import { useEffect, useState } from 'react';
import Revelar from '../Revelar';
import { IconeFechar, IconeInsta } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { arroba, instagramUrl, urlFoto } from '@/lib/formatos';

function Ampliada({ foto, artista, aoFechar }) {
  useEffect(() => {
    const f = (e) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [aoFechar]);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={aoFechar}>
      <button type="button" className="absolute right-4 top-4 rounded-full bg-noite/80 p-2 text-osso" aria-label="Fechar" onClick={aoFechar}>
        <IconeFechar width={26} height={26} />
      </button>
      <figure className="max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <img src={urlFoto(foto.imagem)} alt={foto.legenda || 'Tatuagem feita no Fosco'} className="max-h-[80svh] w-auto rounded-lg object-contain" />
        {(foto.legenda || artista) && (
          <figcaption className="mt-3 text-center text-[14px] text-osso-2">
            {foto.legenda}
            {artista ? ` · ${artista}` : ''}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

export default function Trabalhos() {
  const { trabalhos, artistas, estudio, carregado } = useVitrine();
  const [filtro, setFiltro] = useState('');
  const [aberta, setAberta] = useState(null);
  if (!carregado) return null;

  const nomeDe = (id) => artistas?.find((a) => a.id === id)?.nome || '';
  const comFoto = artistas?.filter((a) => a.nome && trabalhos.some((t) => t.artista_id === a.id)) ?? [];
  const lista = filtro ? trabalhos.filter((t) => t.artista_id === filtro) : trabalhos;

  return (
    <section id="trabalhos" className="relative scroll-mt-16 bg-noite py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="kicker">Nº 03 · trabalhos</p>
            <h2 className="titulo mt-3 text-[clamp(44px,7vw,76px)]">Tinta na pele</h2>
          </div>
          {estudio.instagram && (
            <a href={instagramUrl(estudio.instagram)} target="_blank" rel="noopener noreferrer" className="botao-linha">
              <IconeInsta /> {arroba(estudio.instagram)}
            </a>
          )}
        </Revelar>

        {trabalhos.length === 0 ? (
          <Revelar className="mt-10">
            <a
              href={instagramUrl(estudio.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-osso/10 bg-carvao p-8 transition hover:border-ambar/40 sm:p-12"
            >
              <p className="max-w-xl font-gotica text-[30px] font-semibold leading-tight text-osso sm:text-[38px]">
                Os trabalhos mais novos saem primeiro no nosso Instagram.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-ambar-claro">
                Ver o portfólio no {arroba(estudio.instagram)} →
              </span>
            </a>
          </Revelar>
        ) : (
          <>
            {comFoto.length > 1 && (
              <div className="mt-8 flex flex-wrap gap-2">
                <button type="button" onClick={() => setFiltro('')} className={`botao-mini ${!filtro ? 'border-ambar text-ambar-claro' : ''}`}>
                  Todos
                </button>
                {comFoto.map((a) => (
                  <button key={a.id} type="button" onClick={() => setFiltro(a.id)} className={`botao-mini ${filtro === a.id ? 'border-ambar text-ambar-claro' : ''}`}>
                    {a.nome}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-8 columns-2 gap-3 sm:gap-4 md:columns-3">
              {lista.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAberta(t)}
                  className="group relative mb-3 block w-full overflow-hidden rounded-lg bg-carvao sm:mb-4"
                >
                  <img
                    src={urlFoto(t.imagem)}
                    alt={t.legenda || 'Tatuagem feita no Fosco'}
                    loading="lazy"
                    className="w-full transition duration-500 group-hover:scale-[1.03] group-hover:brightness-110"
                  />
                  {nomeDe(t.artista_id) && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-noite/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-osso-2">
                      {nomeDe(t.artista_id)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {aberta && <Ampliada foto={aberta} artista={nomeDe(aberta.artista_id)} aoFechar={() => setAberta(null)} />}
    </section>
  );
}
