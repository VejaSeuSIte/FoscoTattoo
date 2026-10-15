'use client';
import Link from 'next/link';
import Revelar from '../Revelar';
import Marca from '../Marca';
import { IconeGota, IconeSeta, IconeZap } from '../Icones';
import { useVitrine } from '@/lib/vitrine';

export function ChamadaOrcamento() {
  return (
    <section className="relative overflow-hidden bg-noite py-24 sm:py-32">
      <Marca className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-auto -translate-x-1/2 -translate-y-1/2 rotate-[24deg] text-osso/[0.04]" titulo="" />
      <Revelar className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="titulo text-[clamp(56px,10vw,120px)]">Tem uma ideia?</h2>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-osso-2">
          Conta onde vai ser, o tamanho e manda uma referência. A gente responde pelo WhatsApp com o valor.
        </p>
        <Link href="/orcamento/" className="botao mt-9 px-8 py-4 text-[16px]">
          Pedir orçamento <IconeSeta width={18} height={18} />
        </Link>
      </Revelar>
    </section>
  );
}

// faixa de papel chamando para a página de cuidados
export function ChamadaCuidados() {
  return (
    <section className="relative bg-noite px-4 py-16 sm:px-6">
      <Revelar className="mx-auto max-w-4xl">
        <Link
          href="/cuidados/"
          className="papel group flex flex-col items-start gap-5 rounded-xl px-6 py-6 transition-transform duration-300 hover:-rotate-0 sm:flex-row sm:items-center sm:px-9"
          style={{ transform: 'rotate(-0.8deg)' }}
        >
          <span className="flex h-16 w-16 shrink-0 -rotate-6 items-center justify-center rounded-full bg-selo text-[#fbeee0] transition-transform group-hover:rotate-0">
            <IconeGota width={30} height={30} />
          </span>
          <span className="flex-1">
            <span className="block font-gotica text-[34px] font-bold leading-none text-papel-tinta">Tattoo nova?</span>
            <span className="mt-1.5 block text-[15.5px] leading-relaxed text-[#4a3a2c]">
              O passo a passo do Fosco pra cicatrizar bonito: o que fazer e o que evitar nos primeiros dias.
            </span>
          </span>
          <span className="botao-tinta shrink-0">
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
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-[0_0_40px_-6px_rgba(37,211,102,.6)]">
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
