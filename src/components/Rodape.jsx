'use client';
import Link from 'next/link';
import Marca from './Marca';
import { IconeInsta, IconePino, IconeZap } from './Icones';
import { useVitrine } from '@/lib/vitrine';
import { arroba, instagramUrl, linkZap, mascaraZap } from '@/lib/formatos';

// nuvem japonesa (kumo), o outro fundo clássico da tatuagem oriental
function Nuvens({ className = '' }) {
  return (
    <svg viewBox="0 0 520 220" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M20 170 q0 -34 34 -34 q6 -30 40 -30 q26 0 36 22 q12 -10 30 -6 q22 6 22 30 q20 2 20 22 q0 16 -16 16 H34 q-14 0 -14 -20z" />
      <path d="M70 150 q10 -14 26 -6 M130 128 q14 -10 28 2 M178 154 q10 -8 20 0" />
      <path d="M250 96 q0 -30 30 -30 q6 -26 36 -26 q24 0 32 20 q12 -8 28 -4 q20 6 20 26 q18 2 18 20 q0 14 -14 14 H262 q-12 0 -12 -20z" />
      <path d="M296 80 q10 -12 24 -4 M352 62 q12 -8 24 2 M392 86 q10 -8 18 0" />
      <path d="M360 190 q0 -22 22 -22 q4 -18 24 -18 q16 0 22 14 q8 -6 18 -4 q14 4 14 18 q12 2 12 14 q0 10 -10 10 H372 q-12 0 -12 -12z" />
    </svg>
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

export default function Rodape() {
  const { estudio } = useVitrine();
  const ano = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-osso/10 bg-noite">
      <Marca className="pointer-events-none absolute -right-10 -top-24 h-[560px] w-auto text-osso/[0.035]" titulo="" />
      <Nuvens className="pointer-events-none absolute -bottom-6 left-[-40px] w-[520px] text-ambar/[0.07]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Marca className="h-14 w-auto text-osso" titulo="" />
            <div>
              <div className="font-gotica text-[34px] font-bold leading-none">{estudio.nome_curto || 'Fosco'}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-osso-2">tattoo studio · {estudio.cidade}</div>
            </div>
          </div>
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
            <li><Link href="/orcamento/" className="hover:text-ambar-claro">Pedir orçamento</Link></li>
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
          <Link href="/painel/" className="opacity-60 hover:text-osso-2 hover:opacity-100">painel</Link>
        </div>
      </div>
    </footer>
  );
}
