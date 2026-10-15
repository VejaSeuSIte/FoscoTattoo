// Máscaras, datas, dinheiro e mensagens.
import { BASE, SUPABASE_URL, BALDE_PUBLICO } from './config';

export const soDigitos = (v) => String(v ?? '').replace(/\D/g, '');

export function mascaraCpf(v) {
  const d = soDigitos(v).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraZap(v) {
  let d = soDigitos(v);
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function cpfValido(cpf) {
  const c = soDigitos(cpf);
  if (!/^\d{11}$/.test(c) || /^(\d)\1{10}$/.test(c)) return false;
  const d = c.split('').map(Number);
  for (const t of [9, 10]) {
    let s = 0;
    for (let i = 0; i < t; i++) s += d[i] * (t + 1 - i);
    if (((s * 10) % 11) % 10 !== d[t]) return false;
  }
  return true;
}

export const primeiroNome = (n) => String(n ?? '').trim().split(/\s+/)[0] || '';

export function reais(v, centavos = false) {
  if (v === null || v === undefined || v === '') return '';
  return Number(v).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: centavos ? 2 : 0,
    maximumFractionDigits: centavos ? 2 : 0,
  });
}

export function numero(v) {
  const n = Number(v);
  return Number.isInteger(n) ? String(n) : n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

export function dataCurta(v) {
  if (!v) return '';
  const s = String(v);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + 'T12:00:00') : new Date(s);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function diaMes(v) {
  if (!v) return '';
  const d = new Date(String(v).slice(0, 10) + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

export function haQuanto(v) {
  if (!v) return '';
  const s = Math.max(0, (Date.now() - new Date(v).getTime()) / 1000);
  if (s < 3600) return `há ${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `há ${Math.round(s / 3600)} h`;
  const d = Math.round(s / 86400);
  if (d < 31) return `há ${d} dia${d > 1 ? 's' : ''}`;
  const m = Math.round(d / 30);
  if (m < 12) return `há ${m} ${m > 1 ? 'meses' : 'mês'}`;
  const a = Math.round(m / 12);
  return `há ${a} ano${a > 1 ? 's' : ''}`;
}

// link de conversa no WhatsApp com a mensagem já escrita
export function linkZap(numero, texto = '') {
  let d = soDigitos(numero);
  if (d && !d.startsWith('55')) d = '55' + d;
  const t = texto ? `?text=${encodeURIComponent(texto)}` : '';
  return d ? `https://wa.me/${d}${t}` : `https://wa.me/${t}`;
}

// troca {chaves} pelos valores
export function preencher(modelo, valores) {
  return String(modelo ?? '').replace(/\{(\w+)\}/g, (m, k) => (valores[k] !== undefined && valores[k] !== null ? String(valores[k]) : m));
}

// endereço do site (funciona no github.io e em domínio próprio)
export function urlSite(caminho = '/') {
  if (typeof window === 'undefined') return BASE + caminho;
  return window.location.origin + BASE + caminho;
}

export const linkIndicacao = (codigo) => urlSite(`/cadastro/?i=${codigo}`);

// foto: caminho do repositório (equipe/01.webp), do balde (balde:...) ou endereço completo
export function urlFoto(f) {
  if (!f) return '';
  if (/^https?:\/\//.test(f)) return f;
  if (f.startsWith('balde:')) return `${SUPABASE_URL}/storage/v1/object/public/${BALDE_PUBLICO}/${f.slice(6)}`;
  return `${BASE}/${f.replace(/^\//, '')}`;
}

export const instagramUrl = (u) => (u ? `https://instagram.com/${String(u).replace(/^@/, '')}` : '');
export const arroba = (u) => (u ? '@' + String(u).replace(/^@/, '') : '');
