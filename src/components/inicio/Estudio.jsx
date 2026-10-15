'use client';
import Revelar from '../Revelar';
import { Marcado, SombraBambu } from '../Emprestimos';
import { IconePino, IconeZap } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { BASE } from '@/lib/config';
import { linkZap } from '@/lib/formatos';

const FOTOS = [
  ['estudio/01.webp', 'a recepção', -5, ''],
  ['estudio/02.webp', 'o salão', 3, 'lg:mt-16'],
  ['estudio/03.webp', 'mão na massa', -2, 'lg:mt-4'],
];

function Fita({ className = '', giro = -6 }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-10 h-6 w-20 ${className}`}
      style={{
        transform: `rotate(${giro}deg)`,
        background: 'rgba(214, 196, 150, 0.75)',
        clipPath: 'polygon(3% 8%, 0 30%, 4% 52%, 0 74%, 3% 96%, 97% 92%, 100% 70%, 96% 48%, 100% 26%, 97% 4%)',
      }}
    />
  );
}

function Polaroide({ foto, legenda, giro, className }) {
  return (
    <figure
      className={`relative bg-[#f1eadc] p-2.5 pb-10 shadow-[0_22px_30px_-14px_rgba(0,0,0,.85)] transition-transform duration-500 hover:rotate-0 ${className}`}
      style={{ transform: `rotate(${giro}deg)` }}
    >
      <Fita className="-top-3 left-1/2 -translate-x-1/2" giro={giro * -1.5} />
      <img src={`${BASE}/${foto}`} alt={`Foto do estúdio: ${legenda}`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
      <figcaption className="absolute inset-x-0 bottom-2.5 text-center font-corpo text-[14px] font-semibold italic text-[#4a3a2c]">{legenda}</figcaption>
    </figure>
  );
}

export default function Estudio() {
  const { estudio } = useVitrine();
  return (
    <section id="estudio" className="parede relative scroll-mt-16 overflow-hidden py-20 sm:py-28" style={{ '--luz-x': '60%', '--luz-y': '20%', '--luz-abre': '95%' }}>
      <SombraBambu className="-left-[4%] top-0 h-full -skew-x-6" opacidade={0.32} />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="max-w-2xl">
          <h2 className="titulo text-[clamp(48px,8vw,84px)]">
            O <Marcado gesto="sublinhado_ondulado" cor="ambar">estúdio</Marcado>
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-osso-2">Um lugar reservado, com hora marcada, pra fazer a tattoo com calma.</p>
        </Revelar>
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Revelar className="grid grid-cols-3 gap-3 sm:gap-6">
            {FOTOS.map(([foto, legenda, giro, extra]) => (
              <Polaroide key={foto} foto={foto} legenda={legenda} giro={giro} className={extra} />
            ))}
          </Revelar>
          <Revelar atraso={150}>
            <div className="papel relative rounded-[4px] px-6 py-7" style={{ transform: 'rotate(1.2deg)' }}>
              <Fita className="-top-3 left-8" giro={-8} />
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b5640]">onde fica</p>
              <p className="mt-2 font-gotica text-[34px] font-bold leading-[1] text-papel-tinta">{estudio.endereco || 'Recife · PE'}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#4a3a2c]">{estudio.horario}. Antes de vir, combina o horário com a gente pelo WhatsApp.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {estudio.mapa && (
                  <a href={estudio.mapa} target="_blank" rel="noopener noreferrer" className="botao-tinta">
                    <IconePino width={16} height={16} /> Como chegar
                  </a>
                )}
                {estudio.whatsapp && (
                  <a
                    href={linkZap(estudio.whatsapp, 'Oi! Queria marcar um horário no Fosco.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="botao-tinta"
                    style={{ '--b-fundo': 'transparent', '--b-texto': '#261a14', '--b-borda': 'rgba(38,26,20,.45)' }}
                  >
                    <IconeZap width={16} height={16} /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
