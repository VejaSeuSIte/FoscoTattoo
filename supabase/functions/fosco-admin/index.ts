// Ações do painel do Fosco que precisam da chave de serviço: criar cliente
// pelo estúdio, gerar senha nova, apagar cadastro e cuidar da equipe do painel.
// Só quem está em fosco_admins passa daqui.
import {
  cabecalhos, cpfValido, dataValida, emailDoCpf, emailValido, gerarSenha, nomeLimpo, responder,
  servico, soDigitos, traduzirErro, whatsappNormal,
} from '../_shared/comum.ts';

Deno.serve(async (req) => {
  const h = cabecalhos(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: h });
  if (req.method !== 'POST') return responder({ erro: 'Use POST.' }, 405, h);

  const db = servico();
  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: quem } = await db.auth.getUser(jwt);
  if (!quem?.user) return responder({ erro: 'Entre de novo no painel.' }, 401, h);
  const { data: ehAdmin } = await db.from('fosco_admins').select('user_id').eq('user_id', quem.user.id).maybeSingle();
  if (!ehAdmin) return responder({ erro: 'Acesso só para o estúdio.' }, 403, h);

  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return responder({ erro: 'Pedido inválido.' }, 400, h);
  }

  switch (corpo.acao) {
    case 'criar_cliente': {
      const nome = nomeLimpo(corpo.nome);
      const cpf = soDigitos(corpo.cpf);
      const whatsapp = whatsappNormal(corpo.whatsapp);
      const email = emailValido(corpo.email);
      const nascimento = corpo.nascimento ? dataValida(corpo.nascimento) : '';
      if (nome.length < 2) return responder({ erro: 'Escreva o nome do cliente.' }, 400, h);
      if (!cpfValido(cpf)) return responder({ erro: 'CPF inválido.' }, 400, h);
      if (!whatsapp) return responder({ erro: 'WhatsApp inválido: DDD + número.' }, 400, h);
      if (email === null) return responder({ erro: 'E-mail inválido.' }, 400, h);
      if (corpo.nascimento && !nascimento) return responder({ erro: 'Data de nascimento inválida.' }, 400, h);

      const { data: jaCpf } = await db.from('fosco_clientes').select('id').eq('cpf', cpf).maybeSingle();
      if (jaCpf) return responder({ erro: 'Esse CPF já tem cadastro.' }, 409, h);
      const { data: jaZap } = await db.from('fosco_clientes').select('id').eq('whatsapp', whatsapp).maybeSingle();
      if (jaZap) return responder({ erro: 'Esse WhatsApp já está em outro cadastro.' }, 409, h);

      const senha = gerarSenha();
      const { data: criado, error } = await db.auth.admin.createUser({
        email: emailDoCpf(cpf),
        password: senha,
        email_confirm: true,
        app_metadata: { app: 'fosco', papel: 'cliente' },
        user_metadata: { nome },
      });
      if (error || !criado?.user) return responder({ erro: traduzirErro(error?.message ?? '') }, 409, h);

      const indicadoPor = typeof corpo.indicado_por === 'string' && corpo.indicado_por ? corpo.indicado_por : null;
      const { data: reg, error: erroReg } = await db.rpc('fosco_registrar_cliente', {
        p_id: criado.user.id,
        p_nome: nome,
        p_cpf: cpf,
        p_whatsapp: whatsapp,
        p_email: email || null,
        p_nascimento: nascimento || null,
        p_aceita: corpo.aceita_promocoes === true,
        p_codigo_indicacao: null,
        p_origem: 'estudio',
        p_indicado_por: indicadoPor,
      });
      if (erroReg) {
        await db.auth.admin.deleteUser(criado.user.id);
        return responder({ erro: traduzirErro(erroReg.message) }, 400, h);
      }
      return responder({ ok: true, id: criado.user.id, senha, codigo: reg?.codigo }, 200, h);
    }

    case 'nova_senha': {
      const id = String(corpo.cliente_id ?? '');
      const { data: cli } = await db.from('fosco_clientes').select('id').eq('id', id).maybeSingle();
      if (!cli) return responder({ erro: 'Cliente não encontrado.' }, 404, h);
      const senha = gerarSenha();
      const { error } = await db.auth.admin.updateUserById(id, { password: senha });
      if (error) return responder({ erro: 'Não deu pra trocar a senha agora.' }, 500, h);
      return responder({ ok: true, senha }, 200, h);
    }

    case 'excluir_cliente': {
      const id = String(corpo.cliente_id ?? '');
      const { data: cli } = await db.from('fosco_clientes').select('id').eq('id', id).maybeSingle();
      if (!cli) return responder({ erro: 'Cliente não encontrado.' }, 404, h);
      // trava: só apaga conta criada para cliente do Fosco
      const { data: conta } = await db.auth.admin.getUserById(id);
      if (conta?.user?.app_metadata?.app !== 'fosco' || conta.user.app_metadata?.papel !== 'cliente') {
        return responder({ erro: 'Essa conta não é de cliente do Fosco.' }, 400, h);
      }
      const { error } = await db.auth.admin.deleteUser(id);
      if (error) return responder({ erro: 'Não deu pra apagar agora.' }, 500, h);
      return responder({ ok: true }, 200, h);
    }

    case 'listar_equipe': {
      const { data: linhas } = await db.from('fosco_admins').select('user_id, nome, criado_em').order('criado_em');
      const equipe = [];
      for (const l of linhas ?? []) {
        const { data: u } = await db.auth.admin.getUserById(l.user_id);
        equipe.push({ ...l, email: u?.user?.email ?? '', eu: l.user_id === quem.user.id });
      }
      return responder({ ok: true, equipe }, 200, h);
    }

    case 'adicionar_equipe': {
      const email = emailValido(corpo.email);
      const nome = nomeLimpo(corpo.nome);
      const senha = String(corpo.senha ?? '');
      if (!email) return responder({ erro: 'E-mail inválido.' }, 400, h);
      if (email.endsWith('@fosco.cliente')) return responder({ erro: 'Use um e-mail de verdade.' }, 400, h);

      let userId = '';
      let criou = false;
      const { data: criado, error } = await db.auth.admin.createUser({
        email,
        password: senha.length >= 8 ? senha : gerarSenha(10),
        email_confirm: true,
        app_metadata: { app: 'fosco', papel: 'equipe' },
      });
      if (criado?.user) {
        userId = criado.user.id;
        criou = true;
      } else if (/already|registered|exists/i.test(error?.message ?? '')) {
        // conta que já existe no projeto: só dá o acesso, sem mexer na senha dela
        for (let pagina = 1; pagina <= 20 && !userId; pagina++) {
          const { data: lista } = await db.auth.admin.listUsers({ page: pagina, perPage: 200 });
          const achado = lista?.users?.find((u) => (u.email ?? '').toLowerCase() === email);
          if (achado) userId = achado.id;
          if (!lista?.users?.length) break;
        }
      }
      if (!userId) return responder({ erro: 'Não deu pra criar esse acesso.' }, 400, h);
      await db.from('fosco_admins').upsert({ user_id: userId, nome });
      return responder({ ok: true, criou, senha_definida: criou && senha.length >= 8 }, 200, h);
    }

    case 'remover_equipe': {
      const id = String(corpo.user_id ?? '');
      if (id === quem.user.id) return responder({ erro: 'Você não pode tirar o seu próprio acesso.' }, 400, h);
      await db.from('fosco_admins').delete().eq('user_id', id);
      return responder({ ok: true }, 200, h);
    }

    default:
      return responder({ erro: 'Ação desconhecida.' }, 400, h);
  }
});
