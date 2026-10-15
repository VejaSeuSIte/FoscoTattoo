'use client';
import Link from 'next/link';
import Revelar from '../Revelar';
import Padrao from '../Padrao';
import { Marcado } from '../Emprestimos';
import { IconeSeta } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { BASE } from '@/lib/config';
import { numero } from '@/lib/formatos';

// borda de papel rasgado (em cima ou embaixo da faixa clara)
export function BordaRasgada({ lado = 'cima', cor = '#e4d5b6' }) {
  const pontos = [0, 4, 2, 7, 3, 9, 5, 2, 6, 8, 3, 6, 1, 7, 4, 9, 2, 5, 8, 3, 6, 2, 7, 4, 9, 3, 5, 1, 6, 8, 2];
  const passo = 1200 / (pontos.length - 1);
  const linha = pontos.map((p, i) => `${(i * passo).toFixed(1)},${p * 1.4 + 2}`).join(' L');
  return (
    <svg
      viewBox="0 0 1200 18"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`absolute inset-x-0 z-10 h-[14px] w-full sm:h-[18px] ${lado === 'cima' ? '-top-[13px] sm:-top-[17px]' : '-bottom-[13px] rotate-180 sm:-bottom-[17px]'}`}
    >
      <path d={`M0,18 L${linha} L1200,18 Z`} fill={cor} />
    </svg>
  );
}

// balão de fala do UmRabiscoPsi: o octógono chanfrado, com rabicho
function Balao({ children, rabicho = 'cima-esq', className = '' }) {
  const caminhos = {
    'cima-esq': 'M14 18 L58 18 L44 2 L76 18 L186 18 L198 30 L198 88 L186 100 L14 100 L2 88 L2 30 Z',
    'cima-dir': 'M14 18 L124 18 L156 2 L142 18 L186 18 L198 30 L198 88 L186 100 L14 100 L2 88 L2 30 Z',
  };
  return (
    <div className={`absolute ${className}`}>
      <svg viewBox="0 0 200 102" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={caminhos[rabicho]} fill="#fbf6ea" stroke="#1c120c" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <p className="relative px-4 pb-3 pt-[22px] font-corpo text-[14.5px] font-bold leading-snug text-[#1c120c] sm:text-[15px]">{children}</p>
    </div>
  );
}

function Quadro({ n, titulo, imagem, posicao = '50% 16%', foto = false, children }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden border-[3px] border-[#1c120c] bg-[#1a1410] shadow-[5px_5px_0_#1c120c]">
      <img
        src={`${BASE}/${imagem}`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: posicao, filter: foto ? 'sepia(.35) contrast(1.05) brightness(.92)' : undefined }}
      />
      {/* retícula de mangá no canto */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 100% 100%, rgba(0,0,0,.0) 40%, rgba(0,0,0,.35))' }} />
      <Padrao nome="pontilhado" cor="#000" opacidade={0.28} tam={7} degrade={false} className="[mask-image:linear-gradient(200deg,transparent_45%,#000)]" />
      <span className="absolute left-2 top-2 border-2 border-[#1c120c] bg-[#f3e2b8] px-2 py-1 font-corpo text-[11px] font-extrabold uppercase tracking-wide text-[#1c120c]">
        {n} · {titulo}
      </span>
      {children}
    </div>
  );
}

export default function Quadrinhos() {
  const { programa } = useVitrine();
  const sinal = numero(programa.sinal_percentual || 30);
  return (
    <section
      className="relative"
      style={{ backgroundColor: '#e8dabd', backgroundImage: `url(${BASE}/textura/papel.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <BordaRasgada lado="cima" />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Revelar className="max-w-2xl">
          <h2 className="font-gotica text-[clamp(52px,9vw,92px)] font-bold leading-[0.9] text-papel-tinta">
            Do rascunho à <Marcado gesto="sublinhado_ondulado" cor="selo">pele</Marcado>
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#4a3a2c]">Como funciona, em quatro quadrinhos.</p>
        </Revelar>
        <Revelar className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Quadro n="1" titulo="A ideia" imagem="equipe/02.webp">
            <Balao className="inset-x-3 bottom-3">Manda pelo site o que você quer, onde vai ser e uma referência.</Balao>
          </Quadro>
          <Quadro n="2" titulo="O valor" imagem="equipe/01.webp">
            <Balao rabicho="cima-dir" className="inset-x-3 bottom-3">A gente responde no WhatsApp com o valor certinho.</Balao>
          </Quadro>
          <Quadro n="3" titulo="O horário" imagem="equipe/04.webp">
            <Balao className="inset-x-3 bottom-3">Fechou? Um sinal de {sinal}% no Pix e o horário é seu.</Balao>
          </Quadro>
          <Quadro n="4" titulo="A sessão" imagem="estudio/03.webp" posicao="50% 40%" foto>
            <span className="absolute inset-x-3 bottom-3 border-2 border-[#1c120c] bg-[#f3e2b8] px-3 py-2 font-corpo text-[14px] font-bold leading-snug text-[#1c120c]">
              Agulha na pele. Depois, os cuidados vão direto pro seu WhatsApp.
            </span>
          </Quadro>
        </Revelar>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/orcamento/" className="botao-tinta">
            Mandar minha ideia <IconeSeta width={16} height={16} />
          </Link>
          <Link href="/cuidados/" className="font-semibold text-[#5c3a22] underline decoration-selo/60 underline-offset-4 hover:text-selo-escuro">
            Ver os cuidados depois da tattoo
          </Link>
        </div>
      </div>
      <BordaRasgada lado="baixo" />
    </section>
  );
}
