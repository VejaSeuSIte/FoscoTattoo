'use client';
import { useId } from 'react';

// Padronagens tom sobre tom tiradas do repertório do flash de tatuagem:
// pontilhismo (dotwork), hachura, estrelinhas, losangos, ondas e teia.
const DESENHOS = {
  pontilhado: (t) => (
    <>
      <circle cx={t * 0.25} cy={t * 0.25} r={t * 0.09} />
      <circle cx={t * 0.75} cy={t * 0.75} r={t * 0.09} />
    </>
  ),
  hachura: (t) => <path d={`M0 ${t} L${t} 0 M${-t / 2} ${t / 2} L${t / 2} ${-t / 2} M${t / 2} ${t * 1.5} L${t * 1.5} ${t / 2}`} strokeWidth={t * 0.08} stroke="currentColor" fill="none" />,
  estrelas: (t) => (
    <path
      d={`M${t / 2} ${t * 0.18} Q${t * 0.53} ${t * 0.47} ${t * 0.82} ${t / 2} Q${t * 0.53} ${t * 0.53} ${t / 2} ${t * 0.82} Q${t * 0.47} ${t * 0.53} ${t * 0.18} ${t / 2} Q${t * 0.47} ${t * 0.47} ${t / 2} ${t * 0.18}Z`}
    />
  ),
  losangos: (t) => <path d={`M${t / 2} ${t * 0.1} L${t * 0.9} ${t / 2} L${t / 2} ${t * 0.9} L${t * 0.1} ${t / 2}Z`} fill="none" stroke="currentColor" strokeWidth={t * 0.07} />,
  ondas: (t) => (
    <path
      d={`M0 ${t * 0.35} Q${t / 4} ${t * 0.15} ${t / 2} ${t * 0.35} T${t} ${t * 0.35} M0 ${t * 0.8} Q${t / 4} ${t * 0.6} ${t / 2} ${t * 0.8} T${t} ${t * 0.8}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={t * 0.07}
    />
  ),
  teia: (t) => (
    <path
      d={`M0 0 L${t} ${t} M${t} 0 L0 ${t} M${t / 2} 0 V${t} M0 ${t / 2} H${t} M${t * 0.2} ${t / 2} Q${t / 2} ${t * 0.35} ${t * 0.8} ${t / 2} Q${t / 2} ${t * 0.65} ${t * 0.2} ${t / 2}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={t * 0.04}
    />
  ),
};

const DEGRADE = 'linear-gradient(90deg, transparent 34%, #000 100%)';

export default function Padrao({ nome = 'pontilhado', cor = 'currentColor', opacidade = 0.16, tam = 22, degrade = true, className = '' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const desenho = DESENHOS[nome] || DESENHOS.pontilhado;
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ color: cor, opacity: opacidade, ...(degrade ? { maskImage: DEGRADE, WebkitMaskImage: DEGRADE } : {}) }}
    >
      <defs>
        <pattern id={`p-${id}`} width={tam} height={tam} patternUnits="userSpaceOnUse">
          <g fill="currentColor">{desenho(tam)}</g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#p-${id})`} />
    </svg>
  );
}
