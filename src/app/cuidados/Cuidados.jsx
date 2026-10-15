'use client';
import { useId, useState } from 'react';
import {
  IconeCamarao, IconeCasquinha, IconeCheck, IconeCompartilhar, IconeHaltere, IconeImprimir, IconeOndas, IconePata, IconeSol, IconeZap,
} from '@/components/Icones';
import { useVitrine } from '@/lib/vitrine';
import { Marcado } from '@/components/Emprestimos';
import { BASE } from '@/lib/config';
import { linkZap, urlSite } from '@/lib/formatos';

// o texto é o do cartão de cuidados que o estúdio entrega
const PASSOS = [
  'A partir do 1º dia pós-tattoo, lave a região com água corrente e passe sabão neutro ou antisséptico com movimentos leves. Enxugue a área com papel toalha, pressionando levemente até secar.',
  'Passe uma camada fina do reparador dérmico.',
  'Repita esse processo ao menos duas vezes ao dia, até completar toda a cicatrização da tattoo.',
];

const EVITAR = [
  [IconeSol, 'Exposição ao sol durante toda a cicatrização'],
  [IconeOndas, 'Banho de piscina, rio, mar, entre outros'],
  [IconeHaltere, 'Exercício físico localizado e suor por 7 dias'],
  [IconeCamarao, 'Frutos do mar, carne de porco e seus derivados'],
  [IconePata, 'Contato da região tatuada com animais'],
  [IconeCasquinha, 'Atrito na região e arrancar as casquinhas'],
];

// desenhinhos de cada passo, no traço dos ícones do site
const DESENHOS = [
  <svg key="t" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 16h18a6 6 0 0 1 6 6v4" />
    <path d="M14 16v-5h6v5M12 11h10" />
    <path d="M32 31c0 2-1.5 3.5-3 3.5S26 33 26 31c0-2 3-5 3-5s3 3 3 5zM30 40c0 1.2-.9 2-2 2s-2-.8-2-2c0-1.2 2-3.2 2-3.2s2 2 2 3.2z" />
  </svg>,
  <svg key="p" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h24l6 4v4l-6 4H9a2 2 0 0 1-2-2V20a2 2 0 0 1 2-2z" />
    <path d="M39 22h4v4h-4M11 18v12M14 18v12M20 23h8" />
    <path d="M43 24c2 0 3 1.5 3 3" />
  </svg>,
  <svg key="r" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="26" r="15" />
    <path d="M24 17v9l6 4M18 6h12M24 6v5" />
    <text x="36" y="44" fontSize="11" fontWeight="700" fill="currentColor" stroke="none" fontFamily="var(--fonte-corpo)">2x</text>
  </svg>,
];

// faixa de pincel com o texto por cima, como no cartão impresso
function Pincelada({ children, cor = '#1c120c', texto = '#efe3c9', className = '' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <span className={`relative inline-block px-6 py-2 ${className}`}>
      <svg viewBox="0 0 400 70" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id={`pincel-${id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.6" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="9" />
          </filter>
        </defs>
        <g fill={cor} filter={`url(#pincel-${id})`}>
          <path d="M8 16C44 7 126 12 204 8s156-4 188 7l-3 17c7 9 3 21-3 26-86 6-188 4-274 8S20 62 10 56C3 45 12 31 8 16Z" />
          <path d="M370 9l26 3-2 5zM12 60l-10 2 6-6zM380 58l18 4-14 1z" />
        </g>
      </svg>
      <span className="relative" style={{ color: texto }}>
        {children}
      </span>
    </span>
  );
}

function Proibido({ icone: Icone }) {
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center text-osso">
      <Icone width={28} height={28} />
      <svg viewBox="0 0 56 56" className="absolute inset-0" aria-hidden="true">
        <circle cx="28" cy="28" r="25" fill="none" stroke="#c4503c" strokeWidth="3.2" />
        <path d="M10.5 10.5l35 35" stroke="#c4503c" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Fita({ className = '', giro = -6 }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-7 w-24 ${className}`}
      style={{
        transform: `rotate(${giro}deg)`,
        background: 'rgba(214, 196, 150, 0.72)',
        clipPath: 'polygon(3% 8%, 0 30%, 4% 52%, 0 74%, 3% 96%, 97% 92%, 100% 70%, 96% 48%, 100% 26%, 97% 4%)',
      }}
    />
  );
}

export default function Cuidados() {
  const { estudio } = useVitrine();
  const [copiou, setCopiou] = useState(false);

  async function compartilhar() {
    const url = urlSite('/cuidados/');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Como cuidar da sua tattoo · Fosco', url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiou(true);
      setTimeout(() => setCopiou(false), 2200);
    } catch {}
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="titulo text-[clamp(50px,10vw,92px)]">Tattoo nova pede cuidado</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-osso-2">
          O passo a passo do Fosco pra sua tattoo cicatrizar bonita. Salva esse link: você vai voltar aqui nos próximos dias.
        </p>
      </div>

      {/* folha 1: como cuidar */}
      <article className="papel relative mt-12 rounded-[4px] px-6 pb-10 pt-12 sm:px-12 print:shadow-none" style={{ transform: 'rotate(-0.6deg)' }}>
        <Fita className="-top-3 left-8" giro={-7} />
        <Fita className="-top-3 right-10" giro={6} />
        <div className="grid gap-8 md:grid-cols-[1.25fr_1fr] md:items-start">
          <header>
            <h2 className="font-gotica text-[clamp(64px,11vw,96px)] font-bold leading-[0.8] text-papel-tinta">Como cuidar</h2>
            <Pincelada className="-ml-2 mt-3 font-corpo text-[clamp(18px,3vw,24px)] font-extrabold uppercase tracking-wide">da sua tattoo</Pincelada>
          </header>
          <aside className="relative rotate-[2.5deg] rounded-[3px] bg-[#f4ead4] px-5 py-4 shadow-[0_8px_18px_-10px_rgba(0,0,0,.6)]">
            <Fita className="-top-3 left-1/2 -translate-x-1/2" giro={-3} />
            <p className="font-corpo text-[15.5px] font-semibold italic leading-snug text-[#3e2f24]">
              No estúdio a gente aplica uma película protetora na sua tattoo, que pode durar até <Marcado gesto="sublinhado" cor="selo"><b className="text-selo-escuro">3 dias</b></Marcado>.
            </p>
          </aside>
        </div>

        <ol className="mt-10 space-y-7">
          {PASSOS.map((p, i) => (
            <li key={i} className="flex gap-5">
              <span className="w-10 shrink-0 text-center font-gotica text-[56px] font-bold leading-[0.8] text-selo-escuro">{i + 1}</span>
              <p className="flex-1 pt-1 text-[17px] font-medium leading-relaxed text-[#2e221a]">{p}</p>
              <span className="hidden h-14 w-14 shrink-0 text-[#6b5640] sm:block" aria-hidden="true">
                {DESENHOS[i]}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex gap-4 rounded-xl border-2 border-dashed border-selo-escuro/60 px-5 py-4">
          <IconeSol width={30} height={30} className="mt-0.5 shrink-0 text-selo-escuro" />
          <p className="text-[16px] font-semibold leading-relaxed text-[#3e2f24]">
            Depois da cicatrização total, é imprescindível hidratar a pele pra fortalecer a região e usar protetor solar sempre que pegar sol.
          </p>
        </div>
      </article>

      {/* folha 2: o que evitar */}
      <article className="relative mt-14 rounded-[4px] border-2 border-osso/15 bg-[#120d0a] px-6 pb-10 pt-12 sm:px-12" style={{ transform: 'rotate(0.5deg)', boxShadow: '6px 6px 0 #d8954c' }}>
        <header className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <h2 className="font-gotica text-[clamp(60px,10vw,92px)] font-bold leading-[0.8] text-osso">O que evitar</h2>
          <Pincelada cor="#d8954c" texto="#170e08" className="mb-1 font-corpo text-[clamp(16px,2.6vw,21px)] font-extrabold uppercase tracking-wide">
            no pós-tattoo
          </Pincelada>
        </header>
        <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {EVITAR.map(([Icone, t]) => (
            <li key={t} className="flex items-center gap-4">
              <Proibido icone={Icone} />
              <span className="text-[16.5px] font-medium leading-snug text-osso">{t}</span>
            </li>
          ))}
        </ul>
        {/* o recurso do UmRabiscoPsi: o errado riscado, o certo embaixo */}
        <p className="mt-10 border-t border-osso/10 pt-6 text-[17px] text-osso-2">
          <span className="relative inline-block">
            <img src={`${BASE}/gestos/sublinhado-selo.webp`} alt="" aria-hidden="true" className="pointer-events-none absolute -left-[2%] top-[38%] h-[0.5em] w-[104%] max-w-none" />
            <span className="relative">Arrancar a casquinha</span>
          </span>
          <span className="mt-1 block font-gotica text-[30px] font-semibold leading-tight text-osso">Deixa ela cair sozinha.</span>
        </p>
      </article>

      <div className="mt-14 flex flex-col items-start gap-5 print:hidden sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="font-gotica text-[30px] font-semibold leading-tight">Ficou com dúvida?</p>
          <p className="text-[15px] text-osso-2">Se alguma coisa parecer estranha na cicatrização, chama a gente.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {estudio.whatsapp && (
            <a href={linkZap(estudio.whatsapp, 'Oi! Fiz uma tattoo no Fosco e fiquei com uma dúvida sobre os cuidados.')} target="_blank" rel="noopener noreferrer" className="botao">
              <IconeZap width={17} height={17} /> Falar no WhatsApp
            </a>
          )}
          <button type="button" onClick={compartilhar} className="botao-linha">
            {copiou ? <IconeCheck width={16} height={16} /> : <IconeCompartilhar width={16} height={16} />}
            {copiou ? 'Link copiado' : 'Compartilhar'}
          </button>
          <button type="button" onClick={() => window.print()} className="botao-linha">
            <IconeImprimir width={16} height={16} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
