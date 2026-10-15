// Teste de ponta a ponta do cadastro/indicação direto na API (sem navegador).
const URL = 'https://kqpdoyidalucsiqksjtr.supabase.co';
const K = 'sb_publishable_fJOwnHy3XZuARp_Z0nhTRw_16yL_cpK';
const ORIGIN = 'https://vejaseusite.github.io';
export function cpf() {
  const d = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  for (const t of [9, 10]) { let s = 0; for (let i = 0; i < t; i++) s += d[i] * (t + 1 - i); d.push(((s * 10) % 11) % 10); }
  return d.join('');
}
const zap = () => '8199' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0');
async function post(path, body, token) {
  const r = await fetch(URL + path, { method: 'POST', headers: { apikey: K, 'Content-Type': 'application/json', Origin: ORIGIN, ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body) });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t; }
  return { status: r.status, j };
}
async function cadastrar(nome, codigo) {
  const c = cpf();
  const r = await post('/functions/v1/fosco-cadastro', { nome, cpf: c, whatsapp: zap(), email: '', nascimento: '1995-10-15', senha: 'teste123', aceite: true, aceita_promocoes: true, codigo });
  return { c, ...r };
}
async function entrar(cpfNum) {
  const r = await post('/auth/v1/token?grant_type=password', { email: cpfNum + '@fosco.cliente', password: 'teste123' });
  return r.j.access_token;
}
const a = await cadastrar('Teste Alfa Fosco');
console.log('A', a.status, a.j);
const b = await cadastrar('Teste Beta Fosco', a.j.codigo);
console.log('B', b.status, b.j);
const dup = await post('/functions/v1/fosco-cadastro', { nome: 'Teste Gama', cpf: a.c, whatsapp: zap(), nascimento: '1990-01-01', senha: 'teste123', aceite: true });
console.log('dup', dup.status, dup.j.erro);
const tok = await entrar(a.c);
console.log('login A', !!tok);
const area = await post('/rest/v1/rpc/fosco_minha_area', {}, tok);
console.log('area A', area.status, JSON.stringify(area.j).slice(0, 600));
const quem = await post('/rest/v1/rpc/fosco_quem_indicou', { p_codigo: a.j.codigo });
console.log('quem', quem.j);
const adm = await post('/rest/v1/rpc/fosco_admin_clientes', {}, tok);
console.log('admin com conta de cliente (deve negar):', adm.status, adm.j.message);
const orc = await post('/rest/v1/rpc/fosco_pedir_orcamento', { p: { nome: 'Teste Orc', whatsapp: '81999990000', ideia: 'Uma carpa no antebraço, fineline', local_corpo: 'Antebraço' } });
console.log('orcamento', orc.status, orc.j);
const ler = await fetch(URL + '/rest/v1/fosco_clientes?select=*', { headers: { apikey: K, Authorization: 'Bearer ' + tok } });
console.log('cliente lendo tabela direta (deve vir vazio):', ler.status, await ler.text());
