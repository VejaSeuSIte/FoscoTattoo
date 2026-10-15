'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logotipo } from '../Marca';
import { IconeSeta, IconeZap } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { BASE } from '@/lib/config';
import { linkOrcamento } from '@/lib/formatos';

// o vídeo do salão entra por cima do primeiro quadro quando começa a tocar; quem pede
// menos movimento ou economia de dados fica só com o quadro parado
export function Fundo({ className = '' }) {
  const [video, setVideo] = useState(null);
  const [tocando, setTocando] = useState(false);
  useEffect(() => {
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calmo || navigator.connection?.saveData) return;
    setVideo(window.matchMedia('(min-width: 768px)').matches ? 'abertura-larga.mp4' : 'abertura-alta.mp4');
  }, []);
  return (
    <div className={`abertura-foto absolute inset-0 ${className}`}>
      <picture>
        <source media="(min-width: 768px)" srcSet={`${BASE}/estudio/video-larga.webp`} />
        <img
          src={`${BASE}/estudio/video-alta.webp`}
          alt="O salão do Fosco: máscaras na parede, as poltronas, a fita de luz no teto e o tijolo no fundo"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>
      {video && (
        <video
          ref={(el) => {
            if (!el) return;
            el.muted = true;
            el.play().catch(() => {});
          }}
          src={`${BASE}/estudio/${video}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlaying={() => setTocando(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${tocando ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}

// o logo por extenso com o texto encaixado ao lado da lâmina do «f»
export function LogoComTexto({ children, className = '', largura = 'min(72vw, 360px)', Tag = 'h1' }) {
  return (
    <div className={className} style={{ '--logo': largura }}>
      <Tag className="m-0 w-[var(--logo)] text-osso [filter:drop-shadow(0_6px_24px_rgba(0,0,0,.55))]">
        <Logotipo className="block h-auto w-full" />
      </Tag>
      <div className="relative pl-[calc(var(--logo)*0.17)]" style={{ marginTop: 'calc(var(--logo) * -0.27)' }}>
        {children}
      </div>
    </div>
  );
}

export default function Abertura() {
  const { estudio, programa } = useVitrine();
  const max = Number(programa.desconto_maximo) || 50;

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-noite">
      {/* no celular o vídeo fica em cima e o texto embaixo, no escuro; no computador ele ocupa tudo */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[58%] overflow-hidden md:inset-0 md:h-full">
        <Fundo />
        <div className="abertura-veu absolute inset-0" aria-hidden="true" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-14 pt-[110px] sm:px-6 md:justify-center md:pb-20">
        <LogoComTexto className="abertura-texto" largura="clamp(230px, 30vw, 380px)">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.32em] text-osso-3">Tattoo &amp; piercing · Recife</p>
          <p className="mt-4 max-w-[24rem] text-[18px] leading-relaxed text-osso sm:text-[19px]">
            Uma equipe de artistas de estilos diferentes. <span className="text-ambar-claro">Conta sua ideia.</span>
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            {programa.indicacao_ativa !== false && (
              <Link href="/cadastro/" className="botao">
                Indique e ganhe até {max}% <IconeSeta width={17} height={17} />
              </Link>
            )}
            <a
              href={linkOrcamento(estudio)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-osso-2 underline decoration-osso/30 underline-offset-[6px] transition hover:text-ambar-claro hover:decoration-ambar"
            >
              <IconeZap width={16} height={16} /> Pedir orçamento
            </a>
          </div>
        </LogoComTexto>
      </div>
      <div className="led" />
    </section>
  );
}
