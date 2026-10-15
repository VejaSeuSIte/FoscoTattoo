'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconePino, IconeSeta, IconeZap } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { BASE } from '@/lib/config';
import { linkOrcamento } from '@/lib/formatos';

// o vídeo do salão entra por cima do primeiro quadro quando começa a tocar; quem pede
// menos movimento ou economia de dados fica só com o quadro parado
function Fundo() {
  const [video, setVideo] = useState(null);
  const [tocando, setTocando] = useState(false);
  useEffect(() => {
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calmo || navigator.connection?.saveData) return;
    setVideo(window.matchMedia('(min-width: 768px)').matches ? 'abertura-larga.mp4' : 'abertura-alta.mp4');
  }, []);
  return (
    <div className="abertura-foto absolute inset-0">
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

// a abertura é o próprio salão do estúdio: as máscaras, a fita de luz e o tijolo no fundo
export default function Abertura() {
  const { estudio, programa } = useVitrine();
  const max = Number(programa.desconto_maximo) || 50;

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-noite">
      {/* no celular o vídeo fica em cima e o texto embaixo; no computador ele ocupa tudo */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[68%] overflow-hidden md:inset-0 md:h-full">
        <Fundo />
        <div className="abertura-veu absolute inset-0" aria-hidden="true" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-16 pt-[120px] sm:px-6 md:justify-center md:pb-24">
        <div className="abertura-texto max-w-[34rem]">
          <h1 className="font-gotica text-[clamp(88px,15vw,156px)] font-bold leading-[0.86] text-osso [text-shadow:0_6px_30px_rgba(0,0,0,.55)]">
            {estudio.nome_curto || 'Fosco'}
          </h1>
          <p className="mt-4 font-corpo text-[clamp(15px,2vw,19px)] font-extrabold uppercase tracking-[0.2em] text-ambar-claro">
            Tattoo &amp; piercing · Recife
          </p>
          <span className="linha-ambar" />
          <p className="mt-6 max-w-[30rem] text-[17px] leading-relaxed text-osso-2">
            Estúdio privado, com hora marcada e uma equipe de artistas de estilos diferentes. Conta sua ideia que a gente responde com o orçamento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {programa.indicacao_ativa !== false && (
              <Link href="/cadastro/" className="botao">
                Indique e ganhe até {max}% <IconeSeta width={17} height={17} />
              </Link>
            )}
            <a href={linkOrcamento(estudio)} target="_blank" rel="noopener noreferrer" className="botao-linha bg-noite/40">
              <IconeZap width={17} height={17} /> Pedir orçamento
            </a>
          </div>
          <p className="mt-6 text-[14px] text-osso-3">
            Já é cliente?{' '}
            <Link href="/entrar/" className="text-osso underline decoration-ambar/60 underline-offset-4 hover:text-ambar-claro">
              Veja seus pontos e seu cartão
            </Link>
          </p>
        </div>
      </div>

      {estudio.endereco && (
        <div className="pointer-events-none absolute inset-x-0 bottom-7 hidden md:block">
          <div className="mx-auto max-w-6xl px-6">
            <a
              href={estudio.mapa || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-osso-3 transition hover:text-ambar-claro"
            >
              <IconePino width={15} height={15} className="text-ambar" /> {estudio.endereco}
            </a>
          </div>
        </div>
      )}
      <div className="led" />
    </section>
  );
}
