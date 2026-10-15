'use client';
import Link from 'next/link';
import Marca from '@/components/Marca';
import Padrao from '@/components/Padrao';
import {
  IconeBalao, IconeGota, IconeInsta, IconePessoas, IconePino, IconeSeta, IconeZap, IconePresente, IconeExterno,
} from '@/components/Icones';
import { useVitrine } from '@/lib/vitrine';
import { instagramUrl, linkZap, numero, urlFoto } from '@/lib/formatos';

// cada placa é uma gravura: cor chapada, borda e sombra de impressão no tom de
// baixo, o carimbo do ícone inclinado e uma padronagem de flash tom sobre tom
const CORES = {
  ambar: { fundo: '#e09a4f', texto: '#1c1008', tom: '#8a4f1f', selo: '#8a4f1f', icone: '#fbe1bd', padrao: 'pontilhado' },
  bambu: { fundo: '#5f7a3e', texto: '#f6efdc', tom: '#2d3d1a', selo: '#f6efdc', icone: '#3d5224', padrao: 'ondas' },
  selo: { fundo: '#b5402e', texto: '#fbeee0', tom: '#5c1910', selo: '#fbeee0', icone: '#8e2d20', padrao: 'estrelas' },
  papel: { fundo: '#eadcc0', texto: '#261a14', tom: '#8a6a48', selo: '#261a14', icone: '#eadcc0', padrao: 'hachura' },
  tijolo: { fundo: '#7d4a2c', texto: '#fbeee0', tom: '#3a2112', selo: '#fbeee0', icone: '#6b3c22', padrao: 'losangos' },
  noite: { fundo: '#1a1410', texto: '#ebdfc7', tom: '#d8954c', selo: '#d8954c', icone: '#1a1410', padrao: 'teia' },
};

function Placa({ href, externo, icone: Icone, titulo, sub, cor, i }) {
  const c = CORES[cor];
  const classe =
    'group relative flex items-center gap-4 overflow-hidden rounded-[18px] border-2 px-4 py-[0.95rem] transition-[transform,box-shadow] duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px]';
  const estilo = {
    background: c.fundo,
    color: c.texto,
    borderColor: c.tom,
    boxShadow: `4px 4px 0 ${c.tom}`,
    animationDelay: `${i * 60}ms`,
  };
  const miolo = (
    <>
      <Padrao nome={c.padrao} cor={cor === 'noite' ? '#d8954c' : c.tom} opacidade={cor === 'noite' ? 0.22 : 0.2} tam={c.padrao === 'teia' ? 34 : 22} />
      <span
        className="relative flex h-[52px] w-[52px] shrink-0 -rotate-[5deg] items-center justify-center rounded-[14px] transition-transform duration-300 group-hover:rotate-0"
        style={{ background: c.selo, color: c.icone }}
      >
        <Icone width={26} height={26} />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block font-gotica text-[23px] font-bold leading-[1.05]">{titulo}</span>
        {sub && <span className="mt-0.5 block text-[13.5px] leading-snug opacity-80">{sub}</span>}
      </span>
      <span
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200 group-hover:bg-[var(--tom)] group-hover:text-[var(--fundo)]"
        style={{ borderColor: c.tom, '--tom': c.tom, '--fundo': c.fundo }}
      >
        {externo ? <IconeExterno width={16} height={16} /> : <IconeSeta width={16} height={16} />}
      </span>
    </>
  );
  const eventos = {
    onMouseEnter: (e) => (e.currentTarget.style.boxShadow = `6px 6px 0 ${c.tom}`),
    onMouseLeave: (e) => (e.currentTarget.style.boxShadow = `4px 4px 0 ${c.tom}`),
  };
  return (
    <li className="bio-entra" style={{ animationDelay: `${0.06 * i + 0.15}s` }}>
      {externo ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classe} style={estilo} {...eventos}>
          {miolo}
        </a>
      ) : (
        <Link href={href} className={classe} style={estilo} {...eventos}>
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
      className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-osso/35 text-osso transition-colors hover:bg-osso hover:text-noite"
    >
      {children}
    </a>
  );
}

export default function Bio() {
  const { estudio, programa, artistas } = useVitrine();
  const rostos = (artistas ?? Array.from({ length: 8 }, (_, i) => ({ id: i, foto: `equipe/0${i + 1}.webp` }))).slice(0, 8);
  const porAmigo = Number(programa.pontos_por_indicacao) * Number(programa.percentual_por_ponto) || 1;

  const placas = [
    { href: '/orcamento/', icone: IconeBalao, titulo: 'Pedir orçamento', sub: 'Conta sua ideia, a gente responde com o valor', cor: 'ambar' },
    estudio.whatsapp && { href: linkZap(estudio.whatsapp, 'Oi! Vim pelo Instagram do Fosco.'), externo: true, icone: IconeZap, titulo: 'Falar no WhatsApp', sub: 'Tira dúvida e marca horário', cor: 'bambu' },
    programa.indicacao_ativa !== false && { href: '/cadastro/', icone: IconePresente, titulo: `Indique e ganhe até ${programa.desconto_maximo}%`, sub: `Cada amigo cadastrado pelo seu link vale ${numero(porAmigo)}%`, cor: 'selo' },
    { href: '/cuidados/', icone: IconeGota, titulo: 'Como cuidar da sua tattoo', sub: 'O passo a passo pra cicatrizar bonito', cor: 'papel' },
    { href: '/entrar/', icone: IconePessoas, titulo: 'Minha área', sub: 'Seus pontos, seu link e o cartão fidelidade', cor: 'tijolo' },
    estudio.mapa && { href: estudio.mapa, externo: true, icone: IconePino, titulo: 'Como chegar', sub: estudio.endereco, cor: 'noite' },
  ].filter(Boolean);

  return (
    <main className="min-h-[100svh] bg-noite">
      <header className="parede parede-topo relative overflow-hidden px-4 pb-16 pt-10" style={{ '--luz-y': '8%', '--luz-abre': '110%' }}>
        <div className="mx-auto max-w-[460px] text-center">
          <div className="flex justify-center">
            <div className="flex -space-x-3">
              {rostos.map((a, i) => (
                <span
                  key={a.id}
                  className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#d9caa9] bg-carvao shadow-[0_6px_14px_rgba(0,0,0,.7)]"
                  style={{ zIndex: 10 - Math.abs(i - 3.5), transform: `translateY(${Math.abs(i - 3.5) * 2}px)` }}
                >
                  <img src={urlFoto(a.foto)} alt="" className="h-full w-full scale-[1.5] object-cover object-[50%_18%]" />
                </span>
              ))}
            </div>
          </div>
          <Marca className="mx-auto mt-7 h-24 w-auto text-osso drop-shadow-[0_6px_24px_rgba(0,0,0,.7)]" titulo="" />
          <h1 className="titulo mt-4 text-[54px]">{estudio.nome_curto || 'Fosco'}</h1>
          <p className="mt-1 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ambar-claro">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-selo" />
            tattoo · arte · piercing
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-selo" />
          </p>
          {estudio.endereco && <p className="mt-3 text-[14.5px] text-osso-2">{estudio.endereco}</p>}
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
        <div className="led" />
      </header>

      <div className="mx-auto max-w-[460px] px-4 pb-14 pt-10">
        <ul className="space-y-4">
          {placas.map((p, i) => (
            <Placa key={p.titulo} {...p} i={i} />
          ))}
        </ul>
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
