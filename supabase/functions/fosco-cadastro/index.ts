// Cadastro de cliente pelo site do Fosco.
// A conta é criada aqui com a chave de serviço (login = CPF + senha), sem abrir
// o cadastro do projeto inteiro; o banco registra o cliente e credita a indicação.
import {
  cabecalhos, cpfValido, dataValida, emailDoCpf, emailValido, nomeLimpo, responder, servico,
  traduzirErro, whatsappNormal, soDigitos,
} from '../_shared/comum.ts';

const LIMITE_POR_HORA = 12;

Deno.serve(async (req) => {
  const h = cabecalhos(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: h });
  if (req.method !== 'POST') return responder({ erro: 'Use POST.' }, 405, h);

  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return responder({ erro: 'Pedido inválido.' }, 400, h);
  }

  const db = servico();

  // freio contra robô: tentativas por IP na última hora
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'sem-ip';
  const umaHoraAtras = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await db.from('fosco_tentativas').select('id', { count: 'exact', head: true })
    .eq('ip', ip).eq('tipo', 'cadastro').gte('criado_em', umaHoraAtras);
  if ((count ?? 0) >= LIMITE_POR_HORA) {
    return responder({ erro: 'Muitas tentativas agora. Tente de novo daqui a pouco.' }, 429, h);
  }
  await db.from('fosco_tentativas').insert({ ip, tipo: 'cadastro' });

  const nome = nomeLimpo(corpo.nome);
  const cpf = soDigitos(corpo.cpf);
  const whatsapp = whatsappNormal(corpo.whatsapp);
  const email = emailValido(corpo.email);
  const nascimento = dataValida(corpo.nascimento);
  const senha = String(corpo.senha ?? '');
  const codigo = String(corpo.codigo ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24);

  if (nome.length < 4 || !nome.includes(' ')) return responder({ erro: 'Escreva nome e sobrenome.', campo: 'nome' }, 400, h);
  if (!cpfValido(cpf)) return responder({ erro: 'Esse CPF não parece certo. Confira os números.', campo: 'cpf' }, 400, h);
  if (!whatsapp) return responder({ erro: 'WhatsApp inválido: use DDD + número.', campo: 'whatsapp' }, 400, h);
  if (email === null) return responder({ erro: 'Esse e-mail não parece certo.', campo: 'email' }, 400, h);
  if (!nascimento) return responder({ erro: 'Confira a data de nascimento.', campo: 'nascimento' }, 400, h);
  if (senha.length < 6 || senha.length > 72) return responder({ erro: 'A senha precisa ter pelo menos 6 caracteres.', campo: 'senha' }, 400, h);
  if (corpo.aceite !== true) return responder({ erro: 'Para se cadastrar, aceite a política de privacidade.', campo: 'aceite' }, 400, h);

  const { data: jaCpf } = await db.from('fosco_clientes').select('id').eq('cpf', cpf).maybeSingle();
  if (jaCpf) return responder({ erro: 'Esse CPF já tem cadastro. É só entrar com a sua senha.', campo: 'cpf', existe: true }, 409, h);
  const { data: jaZap } = await db.from('fosco_clientes').select('id').eq('whatsapp', whatsapp).maybeSingle();
  if (jaZap) return responder({ erro: 'Esse WhatsApp já está em outro cadastro.', campo: 'whatsapp' }, 409, h);

  const login = emailDoCpf(cpf);
  const { data: criado, error: erroConta } = await db.auth.admin.createUser({
    email: login,
    password: senha,
    email_confirm: true,
    app_metadata: { app: 'fosco', papel: 'cliente' },
    user_metadata: { nome },
  });
  if (erroConta || !criado?.user) {
    return responder({ erro: traduzirErro(erroConta?.message ?? '') }, 409, h);
  }

  const { data: reg, error: erroReg } = await db.rpc('fosco_registrar_cliente', {
    p_id: criado.user.id,
    p_nome: nome,
    p_cpf: cpf,
    p_whatsapp: whatsapp,
    p_email: email || null,
    p_nascimento: nascimento,
    p_aceita: corpo.aceita_promocoes === true,
    p_codigo_indicacao: codigo || null,
    p_origem: 'site',
  });
  if (erroReg) {
    await db.auth.admin.deleteUser(criado.user.id);
    return responder({ erro: traduzirErro(erroReg.message) }, 400, h);
  }

  return responder({ ok: true, login, codigo: reg?.codigo, indicado: reg?.indicado === true }, 200, h);
});
