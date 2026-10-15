'use client';
import { useEffect, useRef } from 'react';
import Revelar from '../Revelar';
import { IconeExterno, IconeSeta, IconeVoltar } from '../Icones';
import { haQuanto, urlFoto } from '@/lib/formatos';
import dados from '@/data/avaliacoes.json';

// o «G» colorido do Google, nas cores oficiais
export function LogoGoogle({ className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FBBC05" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#EA4335" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#34A853" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#4285F4" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function Estrelas({ nota = 5, tamanho = 16 }) {
  return (
    <span className="inline-flex gap-[2px]" role="img" aria-label={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true">
          <path fill={i <= Math.round(nota) ? '#FBBC04' : 'rgba(235,223,199,.2)'} d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

function Cartao({ a }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-osso/10 bg-carvao p-5">
      <div className="flex items-center gap-3">
        {a.foto ? (
          <img src={urlFoto(a.foto)} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-full bg-fuligem object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fuligem font-bold text-osso">{a.nome.charAt(0)}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-osso">{a.nome}</div>
          <div className="text-[12.5px] text-osso-3">{haQuanto(a.quando)}</div>
        </div>
        <LogoGoogle className="h-5 w-5 shrink-0" />
      </div>
      <div className="mt-3">
        <Estrelas nota={a.nota} />
      </div>
      <p className="mt-2 line-clamp-6 text-[15px] leading-relaxed text-osso-2">{a.texto}</p>
      {a.fotos?.length > 0 && (
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          {a.fotos.slice(0, 2).map((f) => (
            <img key={f} src={urlFoto(f)} alt={`Foto da avaliação de ${a.nome}`} loading="lazy" className="aspect-[4/3] w-full rounded-lg bg-fuligem object-cover" />
          ))}
        </div>
      )}
    </article>
  );
}

// as avaliações passam sozinhas para o lado; o dedo, o mouse ou as setas assumem
export default function Avaliacoes({ intervalo = 4800 }) {
  const trilho = useRef(null);
  const parado = useRef(false);
  const ate = useRef(0);
  const lista = (dados.avaliacoes || []).filter((a) => a.texto && a.nota >= 4);

  const andar = (dir) => {
    const el = trilho.current;
    const card = el?.firstElementChild;
    if (!card) return;
    const passo = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0');
    const fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir > 0 && fim) el.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    else el.scrollBy({ left: dir * passo, behavior: 'smooth' });
  };
  const segurar = () => (ate.current = Date.now() + 8000);

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

  if (!lista.length) return null;
  const nota = (dados.nota || 5).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <section id="avaliacoes" className="relative scroll-mt-16 border-t border-osso/10 bg-noite py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="titulo text-[clamp(30px,4.4vw,46px)]">O que dizem do Fosco</h2>
            <span className="linha-ambar" />
          </div>
          <a
            href={dados.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-osso/10 bg-carvao px-5 py-4 transition-colors hover:border-ambar/40"
            aria-label={`Nota ${nota} no Google, ${dados.total} avaliações. Ver no Google`}
          >
            <LogoGoogle className="h-9 w-9 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[26px] font-bold leading-none text-osso">{nota}</span>
                <Estrelas nota={dados.nota || 5} tamanho={18} />
              </div>
              <div className="mt-1 text-[13px] text-osso-3">{dados.total} avaliações no Google</div>
            </div>
            <IconeExterno width={17} height={17} className="ml-1 shrink-0 text-osso-3" />
          </a>
        </Revelar>

        <div className="mt-10">
          <div
            ref={trilho}
            className="trilho flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 sm:gap-5"
            onPointerDown={segurar}
            onWheel={segurar}
            onMouseEnter={() => (parado.current = true)}
            onMouseLeave={() => (parado.current = false)}
            aria-label="Avaliações do Google"
          >
            {lista.map((a) => (
              <div key={a.nome + a.quando} className="w-[86%] shrink-0 snap-start sm:w-[47%] lg:w-[31.8%]">
                <Cartao a={a} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button type="button" className="botao-seta" aria-label="Avaliação anterior" onClick={() => (segurar(), andar(-1))}>
              <IconeVoltar width={18} height={18} />
            </button>
            <button type="button" className="botao-seta" aria-label="Próxima avaliação" onClick={() => (segurar(), andar(1))}>
              <IconeSeta width={18} height={18} />
            </button>
          </div>
          <p className="mt-6 text-center">
            <a href={dados.url} target="_blank" rel="noopener noreferrer" className="text-[14.5px] font-semibold text-ambar-claro underline decoration-ambar/40 underline-offset-[6px] hover:text-osso">
              Ver todas as {dados.total} avaliações no Google
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
