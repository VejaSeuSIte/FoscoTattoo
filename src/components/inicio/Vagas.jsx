'use client';
import Link from 'next/link';
import Revelar from '../Revelar';
import { IconeSeta } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { dataCurta, reais } from '@/lib/formatos';

function SeloVagas({ vagas }) {
  const esgotou = vagas === 0;
  return (
    <div
      className="flex h-[78px] w-[78px] shrink-0 rotate-[9deg] flex-col items-center justify-center rounded-full border-[3px] border-double text-center leading-none"
      style={{ borderColor: esgotou ? '#5e5444' : '#a3382a', color: esgotou ? '#5e5444' : '#a3382a', boxShadow: 'inset 0 0 0 2px rgba(163,56,42,.15)' }}
    >
      {esgotou ? (
        <span className="font-gotica text-[19px] font-bold">esgotou</span>
      ) : (
        <>
          <span className="font-gotica text-[30px] font-bold">{vagas}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{vagas === 1 ? 'vaga' : 'vagas'}</span>
        </>
      )}
    </div>
  );
}

function Ingresso({ p, i, artista }) {
  const temVagas = p.vagas === null || p.vagas === undefined || p.vagas > 0;
  return (
    <Revelar atraso={i * 120}>
      <article
        className="papel picote flex h-full flex-col rounded-xl py-6 pl-9 pr-6 sm:pl-11 sm:pr-8"
        style={{ transform: `rotate(${i % 2 ? 0.8 : -0.9}deg)` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a6248]">
              {artista ? `com ${artista}` : 'vaga com valor fechado'}
            </div>
            <h3 className="mt-2 font-gotica text-[32px] font-bold leading-[0.95] sm:text-[36px]">{p.titulo}</h3>
          </div>
          {p.vagas !== null && p.vagas !== undefined && <SeloVagas vagas={p.vagas} />}
        </div>
        {p.descricao && <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#4a3a2c]">{p.descricao}</p>}
        <div className="mt-auto pt-6">
          <div className="flex items-end gap-3 border-t border-dashed border-[#7a6248]/50 pt-4">
            {p.preco_de && <span className="dinheiro pb-1.5 text-[17px] font-semibold text-[#7a6248] line-through decoration-selo/70 decoration-2">{reais(p.preco_de)}</span>}
            {p.preco_por && <span className="dinheiro text-[46px] leading-none text-selo-escuro">{reais(p.preco_por)}</span>}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#7a6248]">
              {p.valida_ate ? `até ${dataCurta(p.valida_ate)}` : 'enquanto durar'}
            </span>
            {temVagas ? (
              <Link
                href={`/orcamento/?vaga=${p.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-papel-tinta px-5 py-2.5 text-[14px] font-semibold text-papel transition hover:bg-[#3a2a20]"
              >
                Quero essa vaga <IconeSeta width={16} height={16} />
              </Link>
            ) : (
              <span className="text-[14px] font-medium text-[#7a6248]">Volta no mês que vem</span>
            )}
          </div>
        </div>
      </article>
    </Revelar>
  );
}

export default function Vagas() {
  const { promocoes, artistas } = useVitrine();
  if (!promocoes?.length) return null;
  const nomeDe = (id) => artistas?.find((a) => a.id === id)?.nome || '';
  return (
    <section id="vagas" className="relative scroll-mt-16 bg-noite py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="max-w-2xl">
          <p className="kicker">Nº 01 · vagas do mês</p>
          <h2 className="titulo mt-3 text-[clamp(44px,7vw,76px)]">
            Poucas vagas, <span className="brasa">valor fechado.</span>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-osso-2">
            Quando abre horário com condição especial, aparece aqui primeiro. Garantiu a vaga, a gente fecha os detalhes com você.
          </p>
        </Revelar>
        <div className={`mt-12 grid gap-8 ${promocoes.length > 1 ? 'md:grid-cols-2' : 'max-w-xl'}`}>
          {promocoes.map((p, i) => (
            <Ingresso key={p.id} p={p} i={i} artista={nomeDe(p.artista_id)} />
          ))}
        </div>
      </div>
    </section>
  );
}
