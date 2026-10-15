'use client';
import Link from 'next/link';
import Quadro from '../Quadro';
import Marca from '../Marca';
import { IconeSeta } from '../Icones';
import { useVitrine } from '@/lib/vitrine';

// três retratos de reserva, para a abertura não piscar enquanto o banco responde
const RESERVA = [
  { id: 'a', foto: 'equipe/02.webp', nome: '', funcao: '' },
  { id: 'b', foto: 'equipe/01.webp', nome: '', funcao: '' },
  { id: 'c', foto: 'equipe/04.webp', nome: '', funcao: '' },
];

// luminária pendente que acende a parede
function Luminaria({ className = '' }) {
  return (
    <svg viewBox="0 0 120 260" className={className} overflow="visible" aria-hidden="true">
      <defs>
        <radialGradient id="lum-luz" cx="50%" cy="0%" r="100%">
          <stop offset="0" stopColor="#ffe2b0" />
          <stop offset=".35" stopColor="#f2a556" stopOpacity=".55" />
          <stop offset="1" stopColor="#f2a556" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lum-cupula" x1="0" x2="1">
          <stop offset="0" stopColor="#0d0907" />
          <stop offset=".45" stopColor="#2a1d14" />
          <stop offset=".7" stopColor="#3a291c" />
          <stop offset="1" stopColor="#120c08" />
        </linearGradient>
      </defs>
      <line x1="60" y1="-1200" x2="60" y2="150" stroke="#2a1f17" strokeWidth="1.6" />
      <rect x="55" y="146" width="10" height="16" rx="2" fill="#1d150f" />
      <path d="M60 160 L22 214 Q60 224 98 214 Z" fill="url(#lum-cupula)" />
      <path d="M22 214 Q60 224 98 214" fill="none" stroke="#c99a5c" strokeOpacity=".55" strokeWidth="1.2" />
      <ellipse cx="60" cy="219" rx="22" ry="6" fill="#ffe6bd" />
      <ellipse cx="60" cy="236" rx="56" ry="26" fill="url(#lum-luz)" />
    </svg>
  );
}

export default function Abertura() {
  const { estudio, programa, artistas } = useVitrine();
  const lista = artistas && artistas.length >= 3 ? artistas : RESERVA;
  const [a, b, c] = [lista[1] ?? lista[0], lista[0], lista[3] ?? lista[2]];
  const max = Number(programa.desconto_maximo) || 50;

  return (
    <section
      className="parede relative overflow-hidden pt-[68px]"
      style={{ '--luz-x': '70%', '--luz-y': '30%', '--luz-abre': '85%' }}
    >
      <div className="mx-auto grid min-h-[calc(100svh-68px)] max-w-6xl items-center gap-6 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-16">
        <div className="relative z-10 order-2 lg:order-1">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ambar-claro">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-selo" />
            {estudio.cidade}
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-selo" />
          </p>
          <h1 className="titulo mt-4 text-[clamp(88px,19vw,184px)] drop-shadow-[0_6px_30px_rgba(0,0,0,.6)]">
            {estudio.nome_curto || 'Fosco'}
          </h1>
          <p className="mt-1 font-gotica text-[clamp(22px,3.4vw,32px)] font-medium text-osso-2">arte · tattoo · piercing</p>
          <p className="mt-6 max-w-[30rem] text-[17px] leading-relaxed text-osso-2">
            {estudio.chamada} Manda sua ideia que a gente responde com o orçamento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/orcamento/" className="botao">
              Pedir orçamento <IconeSeta width={17} height={17} />
            </Link>
            {programa.indicacao_ativa !== false && (
              <Link href="/#indique" className="botao-linha">
                Indique e ganhe até {max}%
              </Link>
            )}
          </div>
          <p className="mt-6 text-[14px] text-osso-3">
            Já é cliente?{' '}
            <Link href="/entrar/" className="text-osso underline decoration-ambar/60 underline-offset-4 hover:text-ambar-claro">
              Veja seus pontos e seu cartão
            </Link>
          </p>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[520px] lg:order-2">
          <Luminaria className="pointer-events-none absolute -top-[68px] left-1/2 z-20 h-[150px] w-auto -translate-x-1/2 sm:h-[190px] lg:h-[230px]" />
          <div className="relative grid grid-cols-[1fr_1.18fr_1fr] items-start gap-3 pt-16 sm:gap-5 sm:pt-24 lg:pt-32">
            <Quadro artista={a} giro={-3.5} placa={false} prioridade className="mt-10" />
            <Quadro artista={b} giro={1.5} placa={false} prioridade />
            <Quadro artista={c} giro={4} placa={false} prioridade className="mt-14" />
          </div>
        </div>
      </div>

      <Link
        href="/#equipe"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-osso-3 transition hover:text-ambar-claro sm:flex"
        aria-label="Descer para a equipe"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">role</span>
        <Marca className="boiar h-9 w-auto" titulo="" />
      </Link>
      <div className="led" />
    </section>
  );
}
