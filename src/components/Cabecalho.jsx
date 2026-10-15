'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Assinatura } from './Marca';
import { IconeMenu, IconeFechar } from './Icones';
import { useVitrine } from '@/lib/vitrine';
import { linkOrcamento } from '@/lib/formatos';

const LINKS = [
  { href: '/#equipe', rotulo: 'Equipe' },
  { href: '/#estudio', rotulo: 'O estúdio' },
  { href: '/cuidados/', rotulo: 'Cuidados' },
  { href: '/#trabalhos', rotulo: 'Trabalhos' },
];

export default function Cabecalho({ solido = false }) {
  const { estudio } = useVitrine();
  const [rolou, setRolou] = useState(solido);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (solido) return;
    const f = () => setRolou(window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [solido]);

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        rolou || aberto ? 'border-b border-osso/10 bg-noite/95' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-osso" aria-label="Fosco Tattoo Studio, página inicial" onClick={() => setAberto(false)}>
          <Assinatura pequeno />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-osso-2 transition hover:text-ambar-claro">
              {l.rotulo}
            </Link>
          ))}
          <Link href="/entrar/" className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-osso-2 transition hover:text-ambar-claro">
            Minha área
          </Link>
          <Link href="/#indique" className="botao px-4 py-2.5 text-[12.5px] uppercase tracking-[0.1em]">
            Indique e ganhe
          </Link>
        </nav>
        <button
          type="button"
          className="-mr-2 rounded-full p-2.5 text-osso lg:hidden"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberto}
          onClick={() => setAberto((a) => !a)}
        >
          {aberto ? <IconeFechar width={24} height={24} /> : <IconeMenu width={24} height={24} />}
        </button>
      </div>
      {aberto && (
        <nav className="parede parede-topo h-[calc(100svh-68px)] overflow-y-auto px-6 pb-10 pt-8 lg:hidden" aria-label="Menu">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setAberto(false)} className="block py-3 font-corpo text-[22px] font-extrabold uppercase tracking-[0.08em] text-osso">
                  {l.rotulo}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/cadastro/" onClick={() => setAberto(false)} className="botao">
              Indique e ganhe
            </Link>
            <a href={linkOrcamento(estudio)} target="_blank" rel="noopener noreferrer" className="botao-linha">
              Pedir orçamento no WhatsApp
            </a>
            <Link href="/entrar/" onClick={() => setAberto(false)} className="botao-linha">
              Minha área
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
