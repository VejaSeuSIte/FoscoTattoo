'use client';
import { useEffect, useRef } from 'react';
import Revelar from '../Revelar';
import { IconeInsta, IconeSeta, IconeVoltar } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { arroba, instagramUrl, urlFoto } from '@/lib/formatos';

function Cartao({ artista, prioridade }) {
  const { nome, funcao, estilos, instagram, foto } = artista;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-osso/10 bg-carvao transition-colors duration-300 hover:border-ambar/40">
      <div className="relative aspect-[4/5] overflow-hidden bg-fuligem">
        <img
          src={urlFoto(foto)}
          alt={nome ? `Retrato de ${nome}` : 'Retrato de alguém da equipe do Fosco'}
          loading={prioridade ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
          className="h-full w-full object-cover object-[50%_16%] transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-carvao to-transparent" />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <h3 className="font-gotica text-[28px] font-bold leading-none text-osso">{nome || '—'}</h3>
        <p className="mt-1.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-latao">{estilos || funcao || 'Tatuagem'}</p>
        {instagram ? (
          <a
            href={instagramUrl(instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-mini mt-4 max-w-full self-start"
            aria-label={`Instagram de ${nome}`}
          >
            <IconeInsta width={15} height={15} className="shrink-0" /> <span className="truncate">{arroba(instagram)}</span>
          </a>
        ) : (
          <span className="mt-4 block h-[34px]" aria-hidden="true" />
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
            <Cartao artista={a} prioridade={i < 4} />
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
