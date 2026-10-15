'use client';
import Link from 'next/link';
import Marca from '@/components/Marca';
import { IconeBalao, IconeCasa, IconeInsta, IconePessoas, IconeSeta, IconeZap, IconeAgulha } from '@/components/Icones';
import { useVitrine } from '@/lib/vitrine';
import { instagramUrl, linkZap, numero, reais, urlFoto } from '@/lib/formatos';

function Item({ href, externo, icone: Icone, titulo, sub, destaque = false }) {
  const classe = `group flex items-center gap-4 rounded-2xl border px-4 py-4 transition duration-200 ${
    destaque
      ? 'border-transparent text-noite shadow-[0_14px_34px_-14px_rgba(236,150,60,.9)]'
      : 'border-osso/15 bg-noite/60 text-osso backdrop-blur-sm hover:border-ambar/50'
  }`;
  const estilo = destaque ? { background: 'linear-gradient(180deg,#e7a964,#c98339)' } : undefined;
  const miolo = (
    <>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${destaque ? 'bg-noite/15' : 'bg-osso/[0.06] text-ambar-claro'}`}>
        <Icone width={22} height={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16.5px] font-semibold leading-tight">{titulo}</span>
        {sub && <span className={`mt-0.5 block text-[13px] leading-snug ${destaque ? 'text-noite/75' : 'text-osso-3'}`}>{sub}</span>}
      </span>
      <IconeSeta width={18} height={18} className="shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
    </>
  );
  return externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classe} style={estilo}>
      {miolo}
    </a>
  ) : (
    <Link href={href} className={classe} style={estilo}>
      {miolo}
    </Link>
  );
}

export default function Bio() {
  const { estudio, programa, artistas, promocoes } = useVitrine();
  const rostos = (artistas ?? Array.from({ length: 8 }, (_, i) => ({ id: i, foto: `equipe/0${i + 1}.webp` }))).slice(0, 8);
  const porAmigo = Number(programa.pontos_por_indicacao) * Number(programa.percentual_por_ponto) || 1;
  const vaga = promocoes?.find((p) => p.vagas === null || p.vagas === undefined || p.vagas > 0);

  return (
    <main className="parede parede-topo min-h-[100svh] px-4 pb-12 pt-10" style={{ '--luz-y': '0%', '--luz-abre': '110%' }}>
      <div className="mx-auto max-w-[440px]">
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

        <div className="mt-7 flex flex-col items-center text-center">
          <Marca className="h-24 w-auto text-osso drop-shadow-[0_6px_24px_rgba(0,0,0,.7)]" titulo="" />
          <h1 className="titulo mt-4 text-[52px]">{estudio.nome_curto || 'Fosco'}</h1>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.3em] text-osso-2">tattoo studio · {estudio.cidade}</p>
          <p className="mt-3 text-[15px] text-osso-2">arte · tattoo · piercing · estúdio privado</p>
        </div>

        {vaga && (
          <Link href="/#vagas" className="papel picote mt-8 block rounded-xl py-4 pl-9 pr-5" style={{ transform: 'rotate(-1deg)' }}>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-[#7a6248]">vaga do mês</span>
            <span className="mt-1 flex items-end justify-between gap-3">
              <span className="font-gotica text-[24px] font-bold leading-tight">{vaga.titulo}</span>
              {vaga.preco_por && <span className="dinheiro shrink-0 text-[26px] leading-none text-selo-escuro">{reais(vaga.preco_por)}</span>}
            </span>
            {vaga.vagas ? (
              <span className="mt-1 block text-[13px] font-medium text-[#8e2d20]">
                {vaga.vagas === 1 ? 'Última vaga' : `Só ${vaga.vagas} vagas`}
              </span>
            ) : null}
          </Link>
        )}

        <nav className="mt-8 space-y-3" aria-label="Links do Fosco">
          <Item href="/orcamento/" icone={IconeBalao} titulo="Pedir orçamento" sub="Conta sua ideia, a gente responde no WhatsApp" destaque />
          {programa.indicacao_ativa !== false && (
            <Item href="/cadastro/" icone={IconeAgulha} titulo={`Indique e ganhe até ${programa.desconto_maximo}%`} sub={`Cada amigo cadastrado pelo seu link vale ${numero(porAmigo)}%`} />
          )}
          <Item href="/entrar/" icone={IconePessoas} titulo="Minha área" sub="Seus pontos, seu link e o cartão fidelidade" />
          <Item href="/#equipe" icone={IconeCasa} titulo="Conheça a equipe" sub="Quem tatua no Fosco" />
          {estudio.grupo_whatsapp && <Item href={estudio.grupo_whatsapp} externo icone={IconeZap} titulo="Grupo do Fosco" sub="Vagas de última hora e novidades" />}
          {estudio.whatsapp && <Item href={linkZap(estudio.whatsapp)} externo icone={IconeZap} titulo="Falar no WhatsApp" />}
          {estudio.instagram && <Item href={instagramUrl(estudio.instagram)} externo icone={IconeInsta} titulo="Instagram" sub={`@${estudio.instagram}`} />}
        </nav>

        <p className="mt-10 text-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-osso-4">
          <Link href="/" className="hover:text-osso-2">
            site completo
          </Link>
        </p>
      </div>
      <div className="led" />
    </main>
  );
}
