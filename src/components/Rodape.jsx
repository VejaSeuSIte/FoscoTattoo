'use client';
import Link from 'next/link';
import Marca, { Logotipo } from './Marca';
import { IconeInsta, IconePino, IconeZap } from './Icones';
import { useVitrine } from '@/lib/vitrine';
import { arroba, instagramUrl, linkOrcamento, linkZap, mascaraZap } from '@/lib/formatos';

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

export default function Rodape() {
  const { estudio } = useVitrine();
  const ano = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-osso/10 bg-noite">
      <Marca className="pointer-events-none absolute -right-10 -top-24 h-[560px] w-auto text-osso/[0.035]" titulo="" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logotipo compacto className="h-[92px] w-auto text-osso" />
          {estudio.endereco ? (
            <a href={estudio.mapa || '#'} target="_blank" rel="noopener noreferrer" className="mt-5 flex max-w-sm items-start gap-2.5 text-[15px] leading-relaxed text-osso-2 hover:text-ambar-claro">
              <IconePino className="mt-0.5 shrink-0" /> {estudio.endereco}
            </a>
          ) : (
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-osso-2">{estudio.endereco_publico}</p>
          )}
          {estudio.horario && <p className="mt-2 pl-[30px] text-[14px] text-osso-3">{estudio.horario}</p>}
          <div className="mt-6 flex gap-3">
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
        <div>
          <div className="kicker mb-4">Fale com a gente</div>
          <ul className="space-y-3 text-[15px]">
            {estudio.instagram && (
              <li>
                <a href={instagramUrl(estudio.instagram)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-osso hover:text-ambar-claro">
                  <IconeInsta /> {arroba(estudio.instagram)}
                </a>
              </li>
            )}
            {estudio.whatsapp && (
              <li>
                <a href={linkZap(estudio.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-osso hover:text-ambar-claro">
                  <IconeZap /> {mascaraZap(estudio.whatsapp)}
                </a>
              </li>
            )}
            {estudio.grupo_whatsapp && (
              <li>
                <a href={estudio.grupo_whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-osso hover:text-ambar-claro">
                  <IconeZap /> Grupo do Fosco
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <div className="kicker mb-4">No site</div>
          <ul className="space-y-2.5 text-[15px] text-osso-2">
            <li><a href={linkOrcamento(estudio)} target="_blank" rel="noopener noreferrer" className="hover:text-ambar-claro">Pedir orçamento</a></li>
            <li><Link href="/cadastro/" className="hover:text-ambar-claro">Indique e ganhe</Link></li>
            <li><Link href="/cuidados/" className="hover:text-ambar-claro">Como cuidar da tattoo</Link></li>
            <li><Link href="/entrar/" className="hover:text-ambar-claro">Minha área</Link></li>
            <li><Link href="/privacidade/" className="hover:text-ambar-claro">Privacidade</Link></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-osso/[0.07]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 font-mono text-[11px] text-osso-4 sm:px-6">
          <span>© {ano} {estudio.nome}</span>
          <Link href="/admin/" className="opacity-60 hover:text-osso-2 hover:opacity-100">painel</Link>
        </div>
      </div>
    </footer>
  );
}
