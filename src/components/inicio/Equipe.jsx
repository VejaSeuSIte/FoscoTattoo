'use client';
import { useEffect, useRef, useState } from 'react';
import Revelar from '../Revelar';
import { IconeExterno, IconeInsta, IconeSeta, IconeVirar, IconeVoltar } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { arroba, instagramUrl, urlFoto } from '@/lib/formatos';

// O cartão tem duas faces: na frente o retrato, no verso as artes da pessoa (como os
// compilados dos stories) e quem ela é. No computador vira com o mouse; no celular vira
// sozinho quando a equipe chega no meio da tela, e um toque desvira.
function Cartao({ artista, prioridade, virado, aoTocar, atraso = 0 }) {
  const { nome, nome_completo, funcao, estilos, bio, instagram, site, foto } = artista;
  const trabalhos = (artista.trabalhos || []).filter(Boolean).slice(0, 4);
  const temVerso = trabalhos.length > 0;
  return (
    <article
      className={`cartao-giro h-full ${temVerso ? 'com-verso' : ''}`}
      data-virado={temVerso && virado ? 'sim' : undefined}
      onClick={(e) => temVerso && !e.target.closest('a') && aoTocar?.()}
    >
      <div className="cartao-giro-miolo relative h-full" style={atraso ? { transitionDelay: `${atraso}ms` } : undefined}>
        {/* frente */}
        <div className="cartao-face cartao-frente flex h-full flex-col overflow-hidden rounded-2xl border border-osso/10 bg-carvao">
          <div className="relative aspect-[4/5] overflow-hidden bg-fuligem">
            <img
              src={urlFoto(foto)}
              alt={nome ? `Retrato de ${nome}` : 'Retrato de alguém da equipe do Fosco'}
              loading={prioridade ? 'eager' : 'lazy'}
              decoding="async"
              draggable="false"
              className="h-full w-full object-cover object-[50%_16%]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-carvao to-transparent" />
          </div>
          <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
            <h3 className="font-gotica text-[28px] font-bold leading-none text-osso">{nome || '—'}</h3>
            <p className="mt-1.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-latao">{funcao || 'Tatuagem'}</p>
            {temVerso ? (
              <p className="mt-auto flex items-center gap-2 pt-3 text-[12.5px] text-osso-3">
                <IconeVirar width={16} height={16} className="shrink-0 text-ambar" />
                <span className="hidden [@media(hover:hover)]:inline">Passe o mouse pra ver os trabalhos</span>
                <span className="[@media(hover:hover)]:hidden">Toque pra ver os trabalhos</span>
              </p>
            ) : (
              <span className="mt-auto block h-[30px]" aria-hidden="true" />
            )}
          </div>
        </div>

        {/* verso */}
        {temVerso && (
          <div className="cartao-face cartao-verso absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-ambar/40 bg-carvao">
            <div className="relative grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-[3px] bg-noite">
              {trabalhos.map((t, i) => (
                <img
                  key={t + i}
                  src={urlFoto(t)}
                  alt={`Trabalho de ${nome}`}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  className={`h-full w-full object-cover ${trabalhos.length === 3 && i === 2 ? 'col-span-2' : ''} ${trabalhos.length < 3 ? 'row-span-2' : ''}`}
                />
              ))}
              {instagram && (
                <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-noite px-3 py-1.5 text-[12.5px] font-semibold text-osso underline decoration-osso/40 underline-offset-[3px]">
                  {arroba(instagram)}
                </span>
              )}
            </div>
            <div className="px-4 pb-4 pt-3">
              <h3 className="font-gotica text-[23px] font-bold leading-none text-osso">{nome_completo || nome}</h3>
              {estilos && <p className="mt-1.5 text-[11.5px] leading-snug font-semibold uppercase tracking-[0.12em] text-latao">{estilos}</p>}
              {bio && <p className="mt-2 line-clamp-3 text-[13.5px] leading-snug text-osso-2">{bio}</p>}
              <div className="mt-3 flex gap-2">
                {instagram && (
                  <a href={instagramUrl(instagram)} target="_blank" rel="noopener noreferrer" className="botao-mini" aria-label={`Instagram de ${nome}`}>
                    <IconeInsta width={15} height={15} className="shrink-0" /> Instagram
                  </a>
                )}
                {site && (
                  <a href={site} target="_blank" rel="noopener noreferrer" className="botao-mini" aria-label={`Portfólio de ${nome}`}>
                    <IconeExterno width={15} height={15} className="shrink-0" /> Portfólio
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// a equipe passa sozinha para o lado; o dedo (ou as setas) assume quando quiser
export function CarrosselEquipe({ artistas, intervalo = 3200 }) {
  const trilho = useRef(null);
  const parado = useRef(false);
  const ate = useRef(0);
  const [toque, setToque] = useState(false);
  const [virados, setVirados] = useState(false);
  const [trocados, setTrocados] = useState({});

  // no celular (sem mouse), os cartões viram quando a equipe passa do meio da tela e
  // desviram quando ela volta para baixo; o toque troca um cartão só
  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return;
    setToque(true);
    const el = trilho.current;
    let quadro = 0;
    const ver = () => {
      quadro = 0;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const meio = (r.top + r.height / 2) / window.innerHeight;
      setVirados((v) => (v ? meio < 0.64 : meio < 0.5));
    };
    const rolou = () => {
      if (!quadro) quadro = requestAnimationFrame(ver);
    };
    window.addEventListener('scroll', rolou, { passive: true });
    ver();
    return () => {
      window.removeEventListener('scroll', rolou);
      cancelAnimationFrame(quadro);
    };
  }, []);
  useEffect(() => setTrocados({}), [virados]);

  const passo = () => {
    const el = trilho.current;
    const card = el?.firstElementChild;
    if (!card) return 0;
    return card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0');
  };
  const andar = (dir) => {
    const el = trilho.current;
    if (!el) return;
    const fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir > 0 && fim) el.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    else el.scrollBy({ left: dir * passo(), behavior: 'smooth' });
  };
  const segurar = () => {
    ate.current = Date.now() + 7000;
  };

  useEffect(() => {
    const el = trilho.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visivel = false;
    const olho = new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { threshold: 0.35 });
    olho.observe(el);
    const t = setInterval(() => {
      if (visivel && !parado.current && Date.now() > ate.current && !document.hidden) andar(1);
    }, intervalo);
    return () => {
      clearInterval(t);
      olho.disconnect();
    };
  }, [intervalo]);

  return (
    <div className="relative">
      <div
        ref={trilho}
        className="trilho flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 sm:gap-5"
        onPointerDown={segurar}
        onWheel={segurar}
        onMouseEnter={() => (parado.current = true)}
        onMouseLeave={() => (parado.current = false)}
        onFocus={() => (parado.current = true)}
        onBlur={() => (parado.current = false)}
        aria-label="Equipe do Fosco"
      >
        {artistas.map((a, i) => (
          <div key={a.id} className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[23.4%]">
            <Cartao
              artista={a}
              prioridade={i < 4}
              virado={toque && (trocados[a.id] ?? virados)}
              atraso={toque ? (i % 3) * 110 : 0}
              aoTocar={() => toque && (segurar(), setTrocados((t) => ({ ...t, [a.id]: !(t[a.id] ?? virados) })))}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" className="botao-seta" aria-label="Artista anterior" onClick={() => (segurar(), andar(-1))}>
          <IconeVoltar width={18} height={18} />
        </button>
        <button type="button" className="botao-seta" aria-label="Próximo artista" onClick={() => (segurar(), andar(1))}>
          <IconeSeta width={18} height={18} />
        </button>
      </div>
    </div>
  );
}

export function useListaEquipe() {
  const { artistas } = useVitrine();
  if (artistas && artistas.length === 0) return [];
  return artistas ?? Array.from({ length: 8 }, (_, i) => ({ id: i, foto: `equipe/0${i + 1}.webp`, nome: '', funcao: '' }));
}

export default function Equipe() {
  const lista = useListaEquipe();
  if (lista.length === 0) return null;
  return (
    <section id="equipe" className="relative scroll-mt-16 bg-noite py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="mx-auto max-w-2xl text-center">
          <h2 className="titulo text-[clamp(30px,4.4vw,46px)]">Nossa equipe</h2>
          <span className="linha-ambar mx-auto" />
          <p className="subtitulo">Cada artista com o seu traço. Na conversa do orçamento você escolhe com quem quer fazer, ou deixa que a gente indica.</p>
        </Revelar>
        <div className="mt-12">
          <CarrosselEquipe artistas={lista} />
        </div>
      </div>
    </section>
  );
}
