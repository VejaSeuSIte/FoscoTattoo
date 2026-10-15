'use client';
import Revelar from '../Revelar';
import { IconeInsta } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { arroba, instagramUrl, urlFoto } from '@/lib/formatos';

function Cartao({ artista, prioridade }) {
  const { nome, funcao, estilos, instagram, foto } = artista;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-osso/10 bg-carvao transition-colors duration-300 hover:border-ambar/40">
      <div className="relative aspect-[4/5] overflow-hidden bg-fuligem">
        <img
          src={urlFoto(foto)}
          alt={nome ? `Retrato de ${nome}` : 'Retrato de alguém da equipe do Fosco'}
          loading={prioridade ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover object-[50%_16%] transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-carvao to-transparent" />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <h3 className="font-gotica text-[28px] font-bold leading-none text-osso">{nome || '—'}</h3>
        <p className="mt-1.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-latao">{estilos || funcao || 'Tatuagem'}</p>
        {instagram ? (
          <a
            href={instagramUrl(instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-mini mt-4 max-w-full self-start"
            aria-label={`Instagram de ${nome}`}
          >
            <IconeInsta width={15} height={15} className="shrink-0" /> <span className="truncate">{arroba(instagram)}</span>
          </a>
        ) : (
          <span className="mt-4 block h-[34px]" aria-hidden="true" />
        )}
      </div>
    </article>
  );
}

export default function Equipe() {
  const { artistas } = useVitrine();
  if (artistas && artistas.length === 0) return null;
  const lista = artistas ?? Array.from({ length: 8 }, (_, i) => ({ id: i, foto: `equipe/0${i + 1}.webp`, nome: '', funcao: '' }));
  return (
    <section id="equipe" className="relative scroll-mt-16 bg-noite py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="mx-auto max-w-2xl text-center">
          <h2 className="titulo text-[clamp(34px,5vw,52px)]">Nossa equipe</h2>
          <span className="linha-ambar mx-auto" />
          <p className="subtitulo">Cada artista com o seu traço. Na conversa do orçamento você escolhe com quem quer fazer, ou deixa que a gente indica.</p>
        </Revelar>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((a, i) => (
            <Revelar key={a.id} atraso={(i % 4) * 70}>
              <Cartao artista={a} prioridade={i < 4} />
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
