'use client';
import Revelar from '../Revelar';
import Marca from '../Marca';
import { IconeExterno, IconeInsta } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { arroba, instagramUrl, urlFoto } from '@/lib/formatos';

// a prévia do Instagram do estúdio, montada como a grade do perfil
function Grade({ itens, usuario }) {
  return (
    <div className="grid grid-cols-3 gap-[3px] sm:grid-cols-4 lg:grid-cols-6">
      {itens.map((p) => (
        <a
          key={p.chave}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-square overflow-hidden bg-fuligem"
          aria-label={p.legenda ? `Postagem de ${p.legenda} no Instagram` : 'Postagem no Instagram do Fosco'}
        >
          <img src={urlFoto(p.imagem)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
          <span className="absolute inset-0 flex items-center justify-center bg-noite/0 text-osso opacity-0 transition duration-300 group-hover:bg-noite/55 group-hover:opacity-100">
            <IconeInsta width={30} height={30} />
          </span>
          {p.video && (
            <svg viewBox="0 0 24 24" className="absolute right-2 top-2 h-5 w-5 drop-shadow" fill="#fff" aria-hidden="true">
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
          )}
        </a>
      ))}
    </div>
  );
}

export default function Trabalhos() {
  const { instagram, trabalhos, estudio, perfil, carregado } = useVitrine();
  if (!carregado) return null;
  const usuario = String(estudio.instagram || 'foscotattoo').replace(/^@/, '');
  const itens = instagram.length
    ? instagram.map((p) => ({ chave: p.shortcode, imagem: p.imagem, legenda: p.legenda, video: p.video, href: `https://www.instagram.com/${p.video ? 'reel' : 'p'}/${p.shortcode}/` }))
    : trabalhos.slice(0, 12).map((t) => ({ chave: t.id, imagem: t.imagem, legenda: t.legenda, href: instagramUrl(usuario) }));
  const seguidores = perfil?.seguidores ? Number(perfil.seguidores).toLocaleString('pt-BR') : null;

  return (
    <section id="trabalhos" className="relative scroll-mt-16 overflow-hidden bg-noite py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="max-w-2xl">
          <h2 className="titulo text-[clamp(34px,5vw,52px)]">Trabalhos recentes</h2>
          <span className="linha-ambar" />
          <p className="subtitulo">O que saiu da agulha nas últimas semanas, direto do nosso Instagram.</p>
        </Revelar>

        <Revelar className="mt-10 overflow-hidden rounded-[22px] border-2 border-osso/15 bg-carvao">
          <div className="flex flex-wrap items-center gap-4 border-b-2 border-osso/10 px-4 py-4 sm:px-6">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-noite ring-2 ring-ambar ring-offset-2 ring-offset-carvao">
              <Marca className="h-10 w-auto text-osso" titulo="" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-osso">{arroba(usuario)}</div>
              <div className="text-[13.5px] text-osso-3">
                {seguidores ? `${seguidores} seguidores · ` : ''}
                {estudio.nome}
              </div>
            </div>
            <a href={instagramUrl(usuario)} target="_blank" rel="noopener noreferrer" className="botao px-5 py-3">
              <IconeInsta width={17} height={17} /> Seguir
            </a>
          </div>
          {itens.length > 0 ? (
            <Grade itens={itens} usuario={usuario} />
          ) : (
            <p className="px-6 py-12 text-center text-[15px] text-osso-3">Os trabalhos mais novos estão no nosso perfil.</p>
          )}
          <a
            href={instagramUrl(usuario)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-t-2 border-osso/10 px-4 py-4 text-[15px] font-semibold text-ambar-claro transition hover:bg-osso/[0.04]"
          >
            Ver o perfil inteiro no Instagram <IconeExterno width={16} height={16} />
          </a>
        </Revelar>
      </div>
    </section>
  );
}
