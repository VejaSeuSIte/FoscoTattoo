'use client';
import Link from 'next/link';
import { Logotipo } from '@/components/Marca';
import {
  IconeGota, IconeInsta, IconePessoas, IconePino, IconeSeta, IconeZap, IconePresente, IconeExterno,
} from '@/components/Icones';
import { useVitrine } from '@/lib/vitrine';
import { BASE } from '@/lib/config';
import { instagramUrl, linkOrcamento, linkZap, numero, regraIndicacao, urlFoto } from '@/lib/formatos';

// cada link é um cartão escuro e reto; só o indique e ganhe vem em âmbar
function Opcao({ href, externo, icone: Icone, titulo, sub, destaque, i }) {
  const classe = `group flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-colors duration-200 ${
    destaque
      ? 'border-ambar bg-ambar text-noite hover:border-ambar-claro hover:bg-ambar-claro'
      : 'border-osso/15 bg-carvao/85 text-osso hover:border-ambar/55 hover:bg-fuligem'
  }`;
  const miolo = (
    <>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
          destaque ? 'border-noite/25 bg-noite/10 text-noite' : 'border-ambar/40 text-ambar'
        }`}
      >
        <Icone width={21} height={21} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-extrabold uppercase leading-tight tracking-[0.06em]">{titulo}</span>
        {sub && <span className={`mt-0.5 block text-[13px] leading-snug ${destaque ? 'text-noite/75' : 'text-osso-3'}`}>{sub}</span>}
      </span>
      <span className={`shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${destaque ? 'text-noite' : 'text-osso-3 group-hover:text-ambar'}`}>
        {externo ? <IconeExterno width={17} height={17} /> : <IconeSeta width={17} height={17} />}
      </span>
    </>
  );
  return (
    <li className="bio-entra" style={{ animationDelay: `${0.06 * i + 0.15}s` }}>
      {externo ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classe}>
          {miolo}
        </a>
      ) : (
        <Link href={href} className={classe}>
          {miolo}
        </Link>
      )}
    </li>
  );
}

function Redondo({ href, rotulo, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={rotulo}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-osso/30 bg-noite/40 text-osso transition-colors hover:border-ambar hover:text-ambar-claro"
    >
      {children}
    </a>
  );
}

export default function Bio() {
  const { estudio, programa, artistas, instagram } = useVitrine();
  const rostos = artistas ?? Array.from({ length: 8 }, (_, i) => ({ id: i, foto: `equipe/0${i + 1}.webp` }));
  const { primeira } = regraIndicacao(programa);
  const fotos = (instagram || []).slice(0, 6);

  const opcoes = [
    programa.indicacao_ativa !== false && { href: '/cadastro/', icone: IconePresente, titulo: `Indique e ganhe até ${programa.desconto_maximo}%`, sub: `Sua 1ª indicação já vale ${numero(primeira)}% de desconto`, destaque: true },
    { href: linkOrcamento(estudio), externo: true, icone: IconeZap, titulo: 'Pedir orçamento', sub: 'Conta sua ideia no WhatsApp' },
    { href: '/cuidados/', icone: IconeGota, titulo: 'Como cuidar da sua tattoo', sub: 'O que fazer e o que evitar nos primeiros dias' },
    { href: '/entrar/', icone: IconePessoas, titulo: 'Minha área', sub: 'Seus pontos, seu link e o cartão fidelidade' },
    estudio.mapa && { href: estudio.mapa, externo: true, icone: IconePino, titulo: 'Como chegar', sub: estudio.endereco },
  ].filter(Boolean);

  return (
    <main className="min-h-[100svh] bg-noite">
      <header className="relative isolate overflow-hidden px-4 pb-10 pt-12">
        <img
          src={`${BASE}/estudio/abertura-alta.webp`}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[62%_45%]"
        />
        <div className="bio-veu absolute inset-0 -z-10" aria-hidden="true" />
        <div className="mx-auto max-w-[440px] text-center">
          <h1 className="m-0 text-osso [filter:drop-shadow(0_6px_22px_rgba(0,0,0,.6))]">
            <Logotipo compacto className="mx-auto h-[150px] w-auto" />
          </h1>
          <p className="mt-4 text-[11.5px] font-semibold uppercase tracking-[0.3em] text-osso-2">Tattoo &amp; piercing · Recife</p>
          {estudio.endereco && <p className="mt-2 text-[14px] text-osso-2">{estudio.endereco}</p>}
          <div className="mt-6 flex items-center justify-center gap-3">
            {estudio.instagram && (
              <Redondo href={instagramUrl(estudio.instagram)} rotulo="Instagram">
                <IconeInsta />
              </Redondo>
            )}
            {estudio.whatsapp && (
              <Redondo href={linkZap(estudio.whatsapp)} rotulo="WhatsApp">
                <IconeZap />
              </Redondo>
            )}
            {estudio.mapa && (
              <Redondo href={estudio.mapa} rotulo="Mapa">
                <IconePino />
              </Redondo>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[440px] px-4 pb-14">
        <ul className="space-y-3">
          {opcoes.map((p, i) => (
            <Opcao key={p.titulo} {...p} i={i} />
          ))}
        </ul>

        <Link
          href="/#equipe"
          className="bio-entra mt-8 flex items-center gap-4 rounded-2xl border border-osso/15 px-4 py-3.5 transition-colors hover:border-ambar/55"
          style={{ animationDelay: `${0.06 * opcoes.length + 0.15}s` }}
        >
          <span className="flex shrink-0 -space-x-3">
            {rostos.slice(0, 4).map((a) => (
              <span key={a.id} className="h-11 w-11 overflow-hidden rounded-full border-2 border-carvao bg-fuligem ring-1 ring-osso/20">
                <img src={urlFoto(a.foto)} alt="" loading="lazy" className="h-full w-full scale-[1.2] object-cover object-[50%_20%]" />
              </span>
            ))}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-extrabold uppercase tracking-[0.06em] text-osso">Nossa equipe</span>
            <span className="block text-[13px] text-osso-3">{rostos.length} artistas, cada um com seu traço</span>
          </span>
          <IconeSeta width={17} height={17} className="shrink-0 text-osso-3" />
        </Link>

        {fotos.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-osso">Trabalhos recentes</h2>
              <a href={instagramUrl(estudio.instagram || 'foscotattoo')} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-ambar-claro hover:text-osso">
                Ver no Instagram
              </a>
            </div>
            <span className="mt-2 block h-[2px] w-10 bg-ambar" />
            <div className="mt-4 grid grid-cols-3 gap-1.5 overflow-hidden rounded-2xl">
              {fotos.map((p) => (
                <a
                  key={p.shortcode}
                  href={`https://www.instagram.com/${p.video ? 'reel' : 'p'}/${p.shortcode}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block aspect-square overflow-hidden bg-fuligem"
                  aria-label={p.legenda ? `Postagem de ${p.legenda} no Instagram` : 'Postagem no Instagram do Fosco'}
                >
                  <img src={urlFoto(p.imagem)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-col items-center text-center">
          <Link href="/" className="botao-linha">
            Entrar no site inteiro <IconeSeta width={16} height={16} />
          </Link>
          <p className="mt-4 text-[12px] text-osso-4">© {new Date().getFullYear()} {estudio.nome}</p>
        </div>
      </div>
    </main>
  );
}
