// Peças comuns às funções do Fosco: origens liberadas, respostas e validação.
import { createClient } from 'npm:@supabase/supabase-js@2';

const ORIGENS = [
  'https://vejaseusite.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(Deno.env.get('FOSCO_ORIGENS') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
];

export function cabecalhos(req: Request): Record<string, string> {
  const origem = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ORIGENS.includes(origem) ? origem : ORIGENS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

export function responder(corpo: unknown, status: number, h: Record<string, string>) {
  return new Response(JSON.stringify(corpo), { status, headers: h });
}

export function servico() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const soDigitos = (v: unknown) => String(v ?? '').replace(/\D/g, '');

export function cpfValido(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const d = cpf.split('').map(Number);
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += d[i] * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== d[t]) return false;
  }
  return true;
}

export function whatsappNormal(v: unknown) {
  let w = soDigitos(v);
  if (w.startsWith('55') && w.length > 11) w = w.slice(2);
  return /^\d{10,11}$/.test(w) ? w : '';
}

export function dataValida(v: unknown) {
  const s = String(v ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
  const d = new Date(s + 'T12:00:00Z');
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return '';
  const ano = d.getUTCFullYear();
  const hoje = new Date().getUTCFullYear();
  return ano >= 1920 && ano <= hoje - 10 ? s : '';
}

export function emailValido(v: unknown) {
  const e = String(v ?? '').trim().toLowerCase();
  if (!e) return '';
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 160 ? e : null;
}

export function nomeLimpo(v: unknown) {
  return String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

export const emailDoCpf = (cpf: string) => `${cpf}@fosco.cliente`;

export function gerarSenha(tamanho = 8) {
  const letras = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(tamanho));
  return Array.from(bytes, (b) => letras[b % letras.length]).join('');
}

export function traduzirErro(msg: string) {
  if (/fosco_clientes_cpf_key/.test(msg)) return 'Esse CPF já tem cadastro. É só entrar com a sua senha.';
  if (/fosco_clientes_whatsapp_key/.test(msg)) return 'Esse WhatsApp já está em outro cadastro.';
  if (/already|registered|exists/i.test(msg)) return 'Esse CPF já tem cadastro. É só entrar com a sua senha.';
  return 'Não deu pra concluir agora. Tente de novo em instantes.';
}
