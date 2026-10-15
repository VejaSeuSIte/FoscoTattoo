'use client';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_CHAVE } from './config';

let cliente;

export function supa() {
  if (!cliente) {
    cliente = createClient(SUPABASE_URL, SUPABASE_CHAVE, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // o domínio do GitHub Pages é dividido com outros sites: chave própria
        storageKey: 'fosco-sessao',
      },
    });
  }
  return cliente;
}

// chama uma função do servidor (fosco-cadastro, fosco-admin) e devolve { dados, erro }
export async function funcao(nome, corpo) {
  const db = supa();
  const { data: sessao } = await db.auth.getSession();
  const token = sessao?.session?.access_token;
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/${nome}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_CHAVE,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(corpo),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { dados: j, erro: j.erro || 'Não deu certo agora. Tente de novo.' };
    return { dados: j, erro: null };
  } catch {
    return { dados: null, erro: 'Sem conexão. Confira a internet e tente de novo.' };
  }
}

// mensagem de erro do banco, já em português
export function erroLegivel(e) {
  const m = e?.message || String(e || '');
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Sem conexão. Confira a internet e tente de novo.';
  if (/Invalid login credentials/i.test(m)) return 'CPF ou senha não conferem.';
  if (/JWT|expired/i.test(m)) return 'Sua sessão expirou. Entre de novo.';
  return m.replace(/^.*?:\s(?=[A-ZÁÉÍÓÚ])/, '') || 'Não deu certo agora. Tente de novo.';
}

// dados da área do cliente, só se houver alguém logado
export async function minhaArea() {
  const db = supa();
  const { data } = await db.auth.getSession();
  if (!data?.session) return null;
  const { data: area, error } = await db.rpc('fosco_minha_area');
  return error ? null : area;
}
