'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { IconeFechar } from '../Icones';

// ---------- aviso rápido no canto da tela ----------
const AvisoCtx = createContext(() => {});
export const useAvisar = () => useContext(AvisoCtx);

export function AvisosProvider({ children }) {
  const [lista, setLista] = useState([]);
  const avisar = useCallback((texto, tipo = 'ok') => {
    const id = Math.random();
    setLista((l) => [...l, { id, texto, tipo }]);
    setTimeout(() => setLista((l) => l.filter((a) => a.id !== id)), tipo === 'erro' ? 6000 : 3200);
  }, []);
  return (
    <AvisoCtx.Provider value={avisar}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {lista.map((a) => (
          <div
            key={a.id}
            role="status"
            className={`pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-[14.5px] shadow-2xl backdrop-blur ${
              a.tipo === 'erro' ? 'border-selo/60 bg-[#2a120d]/95 text-[#f4b3a6]' : 'border-ambar/40 bg-[#1f160f]/95 text-osso'
            }`}
          >
            {a.texto}
          </div>
        ))}
      </div>
    </AvisoCtx.Provider>
  );
}

// ---------- janela por cima ----------
export function Janela({ aberta, aoFechar, titulo, children, larga = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!aberta) return;
    const f = (e) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', f);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', f);
      document.body.style.overflow = '';
    };
  }, [aberta, aoFechar]);
  if (!aberta) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-2xl border border-osso/10 bg-carvao shadow-2xl sm:rounded-2xl ${larga ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-osso/10 px-5 py-4">
          <h2 className="font-gotica text-[26px] font-semibold leading-none">{titulo}</h2>
          <button type="button" onClick={aoFechar} className="rounded-full p-1.5 text-osso-2 hover:bg-osso/10 hover:text-osso" aria-label="Fechar">
            <IconeFechar />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

// ---------- liga/desliga ----------
export function Interruptor({ ligado, aoMudar, rotulo, dica }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={!!ligado}
        onClick={() => aoMudar(!ligado)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${ligado ? 'bg-ambar' : 'bg-osso/20'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-noite transition-all ${ligado ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      <span>
        <span className="block text-[15px] text-osso">{rotulo}</span>
        {dica && <span className="block text-[13px] text-osso-3">{dica}</span>}
      </span>
    </label>
  );
}

export function Numero({ rotulo, valor, detalhe, destaque = false }) {
  return (
    <div className={`rounded-2xl border p-4 ${destaque ? 'border-ambar/40 bg-ambar/10' : 'border-osso/10 bg-carvao/80'}`}>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-osso-3">{rotulo}</div>
      <div className="mt-1 font-gotica text-[40px] font-bold leading-none text-osso">{valor}</div>
      {detalhe && <div className="mt-1 text-[12.5px] text-osso-3">{detalhe}</div>}
    </div>
  );
}

export function Vazio({ children }) {
  return <div className="rounded-2xl border border-dashed border-osso/15 px-5 py-10 text-center text-[15px] text-osso-3">{children}</div>;
}

export function Carregando({ texto = 'carregando...' }) {
  return <div className="py-16 text-center font-mono text-[12px] text-osso-3">{texto}</div>;
}

export function Secao({ titulo, acao, children, className = '' }) {
  return (
    <section className={className}>
      {(titulo || acao) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          {titulo && <h3 className="font-gotica text-[24px] font-semibold leading-none">{titulo}</h3>}
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}

export function Chip({ ativo, aoClicar, children, conta }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition ${
        ativo ? 'border-ambar bg-ambar/15 text-ambar-claro' : 'border-osso/15 text-osso-2 hover:border-osso/35'
      }`}
    >
      {children}
      {conta !== undefined && <span className="rounded-full bg-osso/10 px-1.5 font-mono text-[11px]">{conta}</span>}
    </button>
  );
}
