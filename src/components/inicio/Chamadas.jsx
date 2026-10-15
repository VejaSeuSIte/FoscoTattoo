'use client';
import Link from 'next/link';
import Revelar from '../Revelar';
import { IconeGota, IconeSeta, IconeZap } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { linkOrcamento } from '@/lib/formatos';

export function ChamadaOrcamento() {
  const { estudio } = useVitrine();
  return (
    <section className="parede relative overflow-hidden py-24 sm:py-32" style={{ '--luz-x': '50%', '--luz-y': '100%', '--luz-abre': '90%' }}>
      <Revelar className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="titulo text-[clamp(30px,4.6vw,48px)]">
          Pronto pra sua próxima <span className="text-ambar">tattoo?</span>
        </h2>
        <span className="linha-ambar mx-auto" />
        <p className="subtitulo mx-auto max-w-xl">
          Conta onde vai ser, o tamanho e manda uma referência. A gente responde pelo WhatsApp com um orçamento feito pra sua ideia.
        </p>
        <a href={linkOrcamento(estudio)} target="_blank" rel="noopener noreferrer" className="botao mt-9 px-8 py-4 text-[16px]">
          <IconeZap width={18} height={18} /> Pedir orçamento no WhatsApp
        </a>
      </Revelar>
      <div className="led" />
    </section>
  );
}

// faixa chamando para a página de cuidados
export function ChamadaCuidados() {
  return (
    <section className="relative bg-noite px-4 py-14 sm:px-6">
      <Revelar className="mx-auto max-w-5xl">
        <Link
          href="/cuidados/"
          className="group flex flex-col items-start gap-5 rounded-2xl border border-osso/10 bg-carvao px-6 py-6 transition-colors hover:border-ambar/40 sm:flex-row sm:items-center sm:px-8"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-selo text-[#fbeee0]">
            <IconeGota width={26} height={26} />
          </span>
          <span className="flex-1">
            <span className="block font-corpo text-[19px] font-extrabold uppercase tracking-[0.06em] text-osso">Como cuidar da sua tattoo</span>
            <span className="mt-1 block text-[15px] leading-relaxed text-osso-2">O passo a passo do Fosco pra cicatrizar bonito: o que fazer e o que evitar nos primeiros dias.</span>
          </span>
          <span className="botao-linha shrink-0">
            Ver os cuidados <IconeSeta width={16} height={16} />
          </span>
        </Link>
      </Revelar>
    </section>
  );
}

export function Comunidade() {
  const { estudio } = useVitrine();
  if (!estudio.grupo_whatsapp) return null;
  return (
    <section className="parede parede-topo relative py-16" style={{ '--luz-abre': '60%' }}>
      <Revelar className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1f7a4d] text-white">
          <IconeZap width={32} height={32} />
        </div>
        <div className="flex-1">
          <h2 className="font-gotica text-[34px] font-bold leading-tight">Entra no grupo do Fosco</h2>
          <p className="mt-1 text-[15px] text-osso-2">Vaga que abre de última hora, flash do dia e novidade do estúdio caem lá primeiro.</p>
        </div>
        <a href={estudio.grupo_whatsapp} target="_blank" rel="noopener noreferrer" className="botao">
          Entrar no grupo
        </a>
      </Revelar>
    </section>
  );
}
