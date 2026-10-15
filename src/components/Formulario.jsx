'use client';
import { useState } from 'react';
import { IconeOlho, IconeOlhoFechado } from './Icones';

export function Campo({ rotulo, dica, erro, id, children, className = '' }) {
  return (
    <div className={className}>
      {rotulo && (
        <label htmlFor={id} className="rotulo">
          {rotulo}
        </label>
      )}
      {children}
      {erro ? (
        <p className="mt-1.5 text-[13px] text-[#f0a596]" role="alert">
          {erro}
        </p>
      ) : (
        dica && <p className="mt-1.5 text-[12.5px] text-osso-3">{dica}</p>
      )}
    </div>
  );
}

export function CampoSenha({ id, valor, aoMudar, erro, autoComplete = 'current-password', placeholder = 'mínimo 6 caracteres' }) {
  const [ver, setVer] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={ver ? 'text' : 'password'}
        className="campo pr-12"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={erro ? 'true' : undefined}
        minLength={6}
        required
      />
      <button
        type="button"
        onClick={() => setVer((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-osso-3 hover:text-osso"
        aria-label={ver ? 'Esconder a senha' : 'Mostrar a senha'}
      >
        {ver ? <IconeOlhoFechado /> : <IconeOlho />}
      </button>
    </div>
  );
}

// grupo de opções em botões (local do corpo, tamanho...)
export function Fichas({ opcoes, valor, aoMudar, nome }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={nome}>
      {opcoes.map((o) => {
        const ativo = valor === o;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(ativo ? '' : o)}
            className={`rounded-full border px-3.5 py-2 text-[14px] transition ${
              ativo ? 'border-ambar bg-ambar/15 text-ambar-claro' : 'border-osso/15 text-osso-2 hover:border-osso/35'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function Aviso({ tipo = 'erro', children }) {
  const cor =
    tipo === 'ok'
      ? 'border-[#5f8a4c]/50 bg-[#5f8a4c]/[0.12] text-[#cfe3bd]'
      : tipo === 'info'
        ? 'border-ambar/40 bg-ambar/10 text-ambar-claro'
        : 'border-selo/50 bg-selo/[0.12] text-[#f4b3a6]';
  return (
    <div className={`rounded-xl border px-4 py-3 text-[14.5px] leading-relaxed ${cor}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

// diminui a foto no próprio celular antes de enviar (máx. 1600 px)
export async function encolherImagem(arquivo, max = 1600, qualidade = 0.82) {
  if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) return arquivo;
  try {
    const bmp = await createImageBitmap(arquivo);
    const escala = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * escala);
    const h = Math.round(bmp.height * escala);
    const tela = document.createElement('canvas');
    tela.width = w;
    tela.height = h;
    tela.getContext('2d').drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise((ok) => tela.toBlob(ok, 'image/webp', qualidade));
    if (!blob || blob.size > arquivo.size) return arquivo;
    return new File([blob], arquivo.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return arquivo;
  }
}
