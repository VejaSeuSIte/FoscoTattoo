'use client';
import { useId } from 'react';
import { CAMINHOS_MARCA } from './Marca';

// carimbo vermelho (hanko) com o «f» do estúdio; borda de tinta irregular
export default function Selo({ tamanho = 64, giro = -8, entrar = false, atraso = 0, cor = '#b5402e', className = '' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const semente = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 97;
  return (
    <svg
      viewBox="0 0 120 120"
      width={tamanho}
      height={tamanho}
      className={`${entrar ? 'carimbo-entra' : ''} ${className}`}
      style={{ '--giro': `${giro}deg`, transform: `rotate(${giro}deg)`, animationDelay: `${atraso}ms` }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`tinta-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={semente} result="r" />
          <feDisplacementMap in="SourceGraphic" in2="r" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed={semente + 3} result="falha" />
          <feColorMatrix in="falha" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 2.55" result="m" />
          <feComposite in="d" in2="m" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#tinta-${id})`} fill={cor} opacity="0.92">
        <path fillRule="evenodd" d="M60 4a56 56 0 1 0 0.01 0ZM60 12a48 48 0 1 1-0.01 0Z" />
        <circle cx="60" cy="60" r="42" />
        <g transform="translate(51.7 25.5) scale(0.166)" fill="#efe3c9">
          {CAMINHOS_MARCA.map((d, i) => (
            <path key={i} fillRule="evenodd" d={d} />
          ))}
        </g>
      </g>
    </svg>
  );
}
