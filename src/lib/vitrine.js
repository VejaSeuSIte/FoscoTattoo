'use client';
// Dados públicos do site (estúdio, regras, equipe, vagas, trabalhos), lidos
// direto da API do banco, com cópia na sessão pra navegação ficar instantânea.
import { createContext, createElement, useContext, useEffect, useState } from 'react';
import { SUPABASE_URL, SUPABASE_CHAVE, ESTUDIO_PADRAO, PROGRAMA_PADRAO } from './config';

const CHAVE_CACHE = 'fosco-vitrine-v1';

async function ler(tabela, consulta) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?${consulta}`, {
    headers: { apikey: SUPABASE_CHAVE, Authorization: `Bearer ${SUPABASE_CHAVE}` },
  });
  if (!r.ok) throw new Error(`${tabela}: ${r.status}`);
  return r.json();
}

export async function carregarVitrine() {
  const hoje = new Date().toISOString().slice(0, 10);
  const [config, artistas, promocoes, trabalhos] = await Promise.all([
    ler('fosco_config', 'select=estudio,programa&id=eq.1'),
    ler('fosco_artistas', 'select=id,nome,funcao,estilos,bio,instagram,foto,ordem&ativo=eq.true&order=ordem.asc,criado_em.asc'),
    ler('fosco_promocoes', `select=id,titulo,descricao,preco_de,preco_por,vagas,valida_ate,artista_id,ordem&ativa=eq.true&or=(valida_ate.is.null,valida_ate.gte.${hoje})&order=ordem.asc,criado_em.desc`),
    ler('fosco_trabalhos', 'select=id,artista_id,imagem,legenda,estilo,ordem&publicado=eq.true&order=ordem.asc,criado_em.desc&limit=60'),
  ]);
  return {
    estudio: { ...ESTUDIO_PADRAO, ...(config[0]?.estudio || {}) },
    programa: { ...PROGRAMA_PADRAO, ...(config[0]?.programa || {}) },
    artistas,
    promocoes,
    trabalhos,
    carregado: true,
  };
}

const VAZIO = {
  estudio: ESTUDIO_PADRAO,
  programa: PROGRAMA_PADRAO,
  artistas: null,
  promocoes: [],
  trabalhos: [],
  carregado: false,
};

const Contexto = createContext(VAZIO);

// um carregamento só por visita, dividido por todas as partes da página
export function VitrineProvider({ children }) {
  const [v, setV] = useState(VAZIO);
  useEffect(() => {
    let vivo = true;
    try {
      const c = sessionStorage.getItem(CHAVE_CACHE);
      if (c) setV(JSON.parse(c));
    } catch {}
    carregarVitrine()
      .then((d) => {
        if (!vivo) return;
        setV(d);
        try {
          sessionStorage.setItem(CHAVE_CACHE, JSON.stringify(d));
        } catch {}
      })
      .catch(() => vivo && setV((x) => ({ ...x, carregado: true })));
    return () => {
      vivo = false;
    };
  }, []);
  return createElement(Contexto.Provider, { value: v }, children);
}

export const useVitrine = () => useContext(Contexto);

export function limparCacheVitrine() {
  try {
    sessionStorage.removeItem(CHAVE_CACHE);
  } catch {}
}

// guarda o código de indicação de quem chegou por um link (?i=...) por 30 dias
const CHAVE_INDICACAO = 'fosco-indicacao';
export function guardarIndicacao(codigo) {
  const c = String(codigo || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!c) return;
  try {
    localStorage.setItem(CHAVE_INDICACAO, JSON.stringify({ c, t: Date.now() }));
  } catch {}
}
export function lerIndicacao() {
  try {
    const j = JSON.parse(localStorage.getItem(CHAVE_INDICACAO) || 'null');
    if (j && Date.now() - j.t < 30 * 86400000) return j.c;
  } catch {}
  return '';
}
export function esquecerIndicacao() {
  try {
    localStorage.removeItem(CHAVE_INDICACAO);
  } catch {}
}
