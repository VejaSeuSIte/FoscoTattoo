'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Assinatura } from './Marca';
import { IconeMenu, IconeFechar } from './Icones';

const LINKS = [
  { href: '/#vagas', rotulo: 'Vagas do mês' },
  { href: '/#equipe', rotulo: 'Equipe' },
  { href: '/#indique', rotulo: 'Indique e ganhe' },
  { href: '/#fidelidade', rotulo: 'Fidelidade' },
  { href: '/orcamento/', rotulo: 'Orçamento' },
];

export default function Cabecalho({ solido = false }) {
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
        rolou || aberto ? 'border-b border-osso/10 bg-noite/85 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-osso" aria-label="Fosco Tattoo Studio, página inicial" onClick={() => setAberto(false)}>
          <Assinatura pequeno />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[14px] font-medium text-osso-2 transition hover:text-ambar-claro">
              {l.rotulo}
            </Link>
          ))}
          <Link href="/entrar/" className="botao-mini">
            Minha área
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
                <Link href={l.href} onClick={() => setAberto(false)} className="block py-3 font-gotica text-[34px] font-semibold text-osso">
                  {l.rotulo}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/orcamento/" onClick={() => setAberto(false)} className="botao">
              Pedir orçamento
            </Link>
            <Link href="/entrar/" onClick={() => setAberto(false)} className="botao-linha">
              Minha área
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
