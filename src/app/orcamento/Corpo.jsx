'use client';
import { useState } from 'react';

// cada pedaço do boneco é um botão; o nome bate com as opções de «onde no corpo»
const BRACO = 'M62 78 q-14 4 -18 18 l-6 52 q8 5 16 0 l8 -50z M138 78 q14 4 18 18 l6 52 q-8 5 -16 0 l-8 -50z';
const ANTEBRACO = 'M38 150 q8 5 16 0 l-4 70 q-5 3 -10 0z M162 150 q-8 5 -16 0 l4 70 q5 3 10 0z';
const MAO = 'M40 222 q5 3 10 0 l4 18 q-8 11 -17 2z M160 222 q-5 3 -10 0 l-4 18 q8 11 17 2z';
const PERNA = 'M70 202 q14 7 28 0 l-3 98 q-10 5 -20 0z M102 202 q14 7 28 0 l-5 98 q-10 5 -20 0z';
const PANTURRILHA = 'M75 304 q10 5 20 0 l-3 80 q-6 3 -12 0z M105 304 q10 5 20 0 l-5 80 q-6 3 -12 0z';
const PESCOCO = 'M91 54 q9 5 18 0 l2 17 q-11 5 -22 0z';

// cada pedaço do boneco é um botão; o nome bate com as opções de «onde no corpo»
const FRENTE = [
  ['Pescoço', PESCOCO],
  ['Peito', 'M64 76 q36 -14 72 0 q4 18 2 38 q-38 10 -76 0 q-2 -20 2 -38z'],
  ['Costela', 'M64 116 q-4 30 4 56 l9 0 q-5 -28 -1 -54z M136 116 q4 30 -4 56 l-9 0 q5 -28 1 -54z'],
  ['Braço', BRACO],
  ['Antebraço', ANTEBRACO],
  ['Mão', MAO],
  ['Perna', PERNA],
  ['Panturrilha', PANTURRILHA],
];
const COSTAS = [
  ['Pescoço', PESCOCO],
  ['Costas', 'M64 76 q36 -14 72 0 q8 50 0 96 q-36 11 -72 0 q-8 -46 0 -96z'],
  ['Braço', BRACO],
  ['Antebraço', ANTEBRACO],
  ['Mão', MAO],
  ['Perna', PERNA],
  ['Panturrilha', PANTURRILHA],
];

export function MapaCorpo({ valor, aoMudar }) {
  const [lado, setLado] = useState(valor === 'Costas' ? 'costas' : 'frente');
  const zonas = lado === 'frente' ? FRENTE : COSTAS;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative w-[190px] shrink-0">
        <svg viewBox="0 0 200 400" className="w-full" role="group" aria-label={`Boneco ${lado === 'frente' ? 'de frente' : 'de costas'}`}>
          {/* a silhueta em traço de nanquim */}
          <g fill="none" stroke="#cdbd9b" strokeWidth="1.4" opacity=".55">
            <ellipse cx="100" cy="32" rx="19" ry="23" />
            <path d="M68 172 q32 11 64 0 l2 30 q-34 9 -68 0z" />
            {lado === 'frente' && <path d="M77 118 q23 6 46 0 q3 28 -1 54 q-22 6 -44 0 q-4 -26 -1 -54z" />}
            <path d="M80 386 h12 l4 10 h-20z M108 386 h12 l6 10 h-20z" />
          </g>
          {lado === 'costas' && <path d="M100 80 v86" stroke="#cdbd9b" strokeWidth="1" opacity=".35" />}
          {zonas.map(([nome, d]) => {
            const ativo = valor === nome;
            return (
              <path
                key={nome}
                d={d}
                role="button"
                tabIndex={0}
                aria-pressed={ativo}
                aria-label={nome}
                onClick={() => aoMudar(ativo ? '' : nome)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), aoMudar(ativo ? '' : nome))}
                className="cursor-pointer outline-none transition-colors duration-200"
                fill={ativo ? '#d8954c' : 'rgba(235,223,199,.07)'}
                stroke={ativo ? '#ffd08f' : '#cdbd9b'}
                strokeWidth="1.4"
                strokeLinejoin="round"
                onMouseEnter={(e) => !ativo && e.currentTarget.setAttribute('fill', 'rgba(216,149,76,.28)')}
                onMouseLeave={(e) => !ativo && e.currentTarget.setAttribute('fill', 'rgba(235,223,199,.07)')}
              >
                <title>{nome}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-col items-center gap-3 sm:items-start sm:pt-6">
        <div className="flex rounded-full border border-osso/20 p-1">
          {['frente', 'costas'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLado(l)}
              className={`rounded-full px-4 py-1.5 text-[13.5px] font-semibold capitalize transition ${lado === l ? 'bg-osso text-noite' : 'text-osso-2'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="text-center text-[14px] text-osso-3 sm:text-left">Toque no lugar onde vai a tattoo.</p>
        <p className="font-gotica text-[30px] font-semibold leading-none text-ambar-claro">{valor || '—'}</p>
        <button type="button" onClick={() => aoMudar(valor === 'Outro lugar' ? '' : 'Outro lugar')} className="botao-mini">
          {valor === 'Outro lugar' ? 'Outro lugar ✓' : 'É em outro lugar'}
        </button>
      </div>
    </div>
  );
}

// a régua de tamanho em cima do antebraço
const FAIXAS = [
  ['Até 5 cm', 0, 5],
  ['5 a 10 cm', 5, 10],
  ['10 a 15 cm', 10, 15],
  ['15 a 25 cm', 15, 25],
];

export function ReguaTamanho({ valor, aoMudar }) {
  const x = (cm) => 20 + (cm / 25) * 360;
  return (
    <div>
      <svg viewBox="0 0 400 120" className="w-full max-w-[520px]" aria-hidden="true">
        {/* o antebraço, do punho ao cotovelo */}
        <path d="M20 36 q110 -8 200 -14 q90 -6 170 -10 l0 70 q-80 -6 -170 -14 q-90 -8 -200 -10z" fill="rgba(235,223,199,.06)" stroke="#cdbd9b" strokeWidth="1.2" opacity=".75" />
        <path d="M20 36 q-12 -2 -16 8 q-2 8 4 14 q-4 4 0 8 q6 4 12 2z" fill="rgba(235,223,199,.06)" stroke="#cdbd9b" strokeWidth="1.2" opacity=".75" />
        {FAIXAS.map(([nome, de, ate]) =>
          valor === nome ? <rect key={nome} x={x(de)} y="24" width={x(ate) - x(de)} height="58" rx="4" fill="#d8954c" opacity=".35" /> : null,
        )}
        {valor === 'Fechamento' && <rect x="14" y="22" width="376" height="62" rx="6" fill="#d8954c" opacity=".3" />}
        <line x1={x(0)} y1="96" x2={x(25)} y2="96" stroke="#cdbd9b" strokeWidth="1.2" />
        {Array.from({ length: 26 }, (_, cm) => (
          <line key={cm} x1={x(cm)} y1="96" x2={x(cm)} y2={cm % 5 === 0 ? 106 : 101} stroke="#cdbd9b" strokeWidth="1" />
        ))}
        {[0, 5, 10, 15, 20, 25].map((cm) => (
          <text key={cm} x={x(cm)} y="118" textAnchor="middle" fill="#a59479" fontSize="10" fontFamily="var(--fonte-mono)">
            {cm}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-2">
        {[...FAIXAS.map((f) => f[0]), 'Fechamento'].map((nome) => {
          const ativo = valor === nome;
          return (
            <button
              key={nome}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoMudar(ativo ? '' : nome)}
              className={`rounded-full border px-3.5 py-2 text-[14px] transition ${ativo ? 'border-ambar bg-ambar/15 text-ambar-claro' : 'border-osso/15 text-osso-2 hover:border-osso/35'}`}
            >
              {nome}
            </button>
          );
        })}
      </div>
    </div>
  );
}
