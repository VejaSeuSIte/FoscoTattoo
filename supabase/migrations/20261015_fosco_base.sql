-- Aplicado no projeto em 15/10/2026 em partes (fosco_esquema_privado, fosco_01..05).
-- Dados iniciais (config, equipe, vagas, modelos) foram inseridos à parte.
-- =====================================================================
-- Fosco Tattoo Studio: site, cadastro de clientes, indicação e fidelidade
-- Mora no projeto Supabase «Kitsune» ao lado da Raposa; tudo com prefixo
-- fosco_ e as funções internas no esquema fosco_privado (não exposto).
-- =====================================================================

create schema if not exists fosco_privado;
grant usage on schema fosco_privado to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- Quem administra o estúdio
-- ---------------------------------------------------------------------
create table public.fosco_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  criado_em timestamptz not null default now()
);
alter table public.fosco_admins enable row level security;

create or replace function fosco_privado.eh_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.fosco_admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function fosco_privado.eh_admin() from public;
grant execute on function fosco_privado.eh_admin() to anon, authenticated, service_role;

create or replace function fosco_privado.exigir_admin() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not fosco_privado.eh_admin() then
    raise exception 'Acesso só para o estúdio.' using errcode = '42501';
  end if;
end $$;
revoke all on function fosco_privado.exigir_admin() from public;
grant execute on function fosco_privado.exigir_admin() to authenticated, service_role;

create policy "fosco_admins: vê a si e a equipe" on public.fosco_admins
  for select to authenticated
  using (user_id = (select auth.uid()) or (select fosco_privado.eh_admin()));

-- ---------------------------------------------------------------------
-- Configuração (uma linha só): dados do estúdio e regras do programa
-- ---------------------------------------------------------------------
create table public.fosco_config (
  id int primary key default 1 check (id = 1),
  estudio jsonb not null default '{}'::jsonb,
  programa jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);
alter table public.fosco_config enable row level security;
create policy "fosco_config: todos leem" on public.fosco_config
  for select to anon, authenticated using (true);
create policy "fosco_config: admin altera" on public.fosco_config
  for update to authenticated
  using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));

create or replace function fosco_privado.cfg(p_chave text, p_padrao numeric) returns numeric
language plpgsql stable security definer set search_path = '' as $$
declare v text;
begin
  select programa->>p_chave into v from public.fosco_config where id = 1;
  return coalesce(nullif(v, '')::numeric, p_padrao);
exception when others then
  return p_padrao;
end $$;

create or replace function fosco_privado.cfg_bool(p_chave text, p_padrao boolean) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare v text;
begin
  select programa->>p_chave into v from public.fosco_config where id = 1;
  return coalesce(nullif(v, '')::boolean, p_padrao);
exception when others then
  return p_padrao;
end $$;

-- ---------------------------------------------------------------------
-- Vitrine: equipe, trabalhos e promoções
-- ---------------------------------------------------------------------
create table public.fosco_artistas (
  id uuid primary key default gen_random_uuid(),
  nome text not null default '',
  funcao text not null default 'Tatuagem',
  estilos text not null default '',
  bio text not null default '',
  instagram text not null default '',
  foto text not null default '',
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table public.fosco_artistas enable row level security;
create policy "fosco_artistas: público vê ativos" on public.fosco_artistas
  for select to anon, authenticated using (ativo);
create policy "fosco_artistas: admin vê todos" on public.fosco_artistas
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_artistas: admin cria" on public.fosco_artistas
  for insert to authenticated with check ((select fosco_privado.eh_admin()));
create policy "fosco_artistas: admin altera" on public.fosco_artistas
  for update to authenticated using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));
create policy "fosco_artistas: admin apaga" on public.fosco_artistas
  for delete to authenticated using ((select fosco_privado.eh_admin()));

create table public.fosco_trabalhos (
  id uuid primary key default gen_random_uuid(),
  artista_id uuid references public.fosco_artistas(id) on delete set null,
  imagem text not null,
  legenda text not null default '',
  estilo text not null default '',
  ordem int not null default 0,
  publicado boolean not null default true,
  criado_em timestamptz not null default now()
);
create index on public.fosco_trabalhos (artista_id);
alter table public.fosco_trabalhos enable row level security;
create policy "fosco_trabalhos: público vê publicados" on public.fosco_trabalhos
  for select to anon, authenticated using (publicado);
create policy "fosco_trabalhos: admin vê todos" on public.fosco_trabalhos
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_trabalhos: admin cria" on public.fosco_trabalhos
  for insert to authenticated with check ((select fosco_privado.eh_admin()));
create policy "fosco_trabalhos: admin altera" on public.fosco_trabalhos
  for update to authenticated using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));
create policy "fosco_trabalhos: admin apaga" on public.fosco_trabalhos
  for delete to authenticated using ((select fosco_privado.eh_admin()));

create table public.fosco_promocoes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null default '',
  preco_de numeric(10,2),
  preco_por numeric(10,2),
  vagas int,
  valida_ate date,
  artista_id uuid references public.fosco_artistas(id) on delete set null,
  ativa boolean not null default true,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
create index on public.fosco_promocoes (artista_id);
alter table public.fosco_promocoes enable row level security;
create policy "fosco_promocoes: público vê ativas" on public.fosco_promocoes
  for select to anon, authenticated using (ativa);
create policy "fosco_promocoes: admin vê todas" on public.fosco_promocoes
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_promocoes: admin cria" on public.fosco_promocoes
  for insert to authenticated with check ((select fosco_privado.eh_admin()));
create policy "fosco_promocoes: admin altera" on public.fosco_promocoes
  for update to authenticated using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));
create policy "fosco_promocoes: admin apaga" on public.fosco_promocoes
  for delete to authenticated using ((select fosco_privado.eh_admin()));

-- ---------------------------------------------------------------------
-- Clientes (o login é pelo CPF; o e-mail interno é <cpf>@fosco.cliente)
-- ---------------------------------------------------------------------
create table public.fosco_clientes (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (length(trim(nome)) between 2 and 120),
  cpf text not null unique check (cpf ~ '^[0-9]{11}$'),
  whatsapp text not null unique check (whatsapp ~ '^[0-9]{10,11}$'),
  email text check (email is null or email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  nascimento date,
  codigo text not null unique check (codigo ~ '^[a-z0-9]{3,24}$'),
  indicado_por uuid references public.fosco_clientes(id) on delete set null,
  aceita_promocoes boolean not null default false,
  origem text not null default 'site' check (origem in ('site', 'estudio')),
  notas text not null default '',
  criado_em timestamptz not null default now(),
  ultimo_acesso timestamptz
);
create index on public.fosco_clientes (indicado_por);
alter table public.fosco_clientes enable row level security;
create policy "fosco_clientes: admin vê" on public.fosco_clientes
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_clientes: admin altera" on public.fosco_clientes
  for update to authenticated using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));

-- Extrato de pontos: cada linha é um crédito ou um débito
create table public.fosco_pontos (
  id bigint generated always as identity primary key,
  cliente_id uuid not null references public.fosco_clientes(id) on delete cascade,
  pontos int not null check (pontos <> 0),
  motivo text not null check (motivo in ('indicacao', 'boas_vindas', 'indicado_tatuou', 'resgate', 'ajuste')),
  -- apagar um cadastro falso apaga junto o ponto que ele rendeu a quem indicou
  indicado_id uuid references public.fosco_clientes(id) on delete cascade,
  sessao_id uuid,
  observacao text not null default '',
  criado_por uuid,
  criado_em timestamptz not null default now()
);
create index on public.fosco_pontos (cliente_id);
create index on public.fosco_pontos (indicado_id);
create index on public.fosco_pontos (sessao_id);
create unique index fosco_pontos_uma_vez_por_indicado
  on public.fosco_pontos (indicado_id, motivo) where motivo in ('indicacao', 'indicado_tatuou');
alter table public.fosco_pontos enable row level security;
create policy "fosco_pontos: admin vê" on public.fosco_pontos
  for select to authenticated using ((select fosco_privado.eh_admin()));

-- Sessões de tatuagem registradas pelo estúdio (base da fidelidade)
create table public.fosco_sessoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.fosco_clientes(id) on delete cascade,
  artista_id uuid references public.fosco_artistas(id) on delete set null,
  data date not null default ((now() at time zone 'America/Recife')::date),
  valor numeric(10,2),
  descricao text not null default '',
  conta_fidelidade boolean not null default true,
  desconto_percentual numeric(6,2) not null default 0,
  premio_valor numeric(10,2) not null default 0,
  criado_por uuid,
  criado_em timestamptz not null default now()
);
create index on public.fosco_sessoes (cliente_id);
create index on public.fosco_sessoes (artista_id);
alter table public.fosco_sessoes enable row level security;
create policy "fosco_sessoes: admin vê" on public.fosco_sessoes
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_sessoes: admin altera" on public.fosco_sessoes
  for update to authenticated using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));

-- ---------------------------------------------------------------------
-- Pedidos de orçamento
-- ---------------------------------------------------------------------
create table public.fosco_orcamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.fosco_clientes(id) on delete set null,
  nome text not null,
  whatsapp text not null,
  email text,
  artista_id uuid references public.fosco_artistas(id) on delete set null,
  ideia text not null,
  local_corpo text not null default '',
  tamanho text not null default '',
  estilo text not null default '',
  cor text not null default '',
  referencias text[] not null default '{}',
  disponibilidade text not null default '',
  status text not null default 'novo' check (status in ('novo', 'respondido', 'fechado', 'perdido')),
  valor numeric(10,2),
  notas text not null default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz
);
create index on public.fosco_orcamentos (status, criado_em desc);
create index on public.fosco_orcamentos (whatsapp, criado_em desc);
create index on public.fosco_orcamentos (cliente_id);
create index on public.fosco_orcamentos (artista_id);
alter table public.fosco_orcamentos enable row level security;
create policy "fosco_orcamentos: admin vê" on public.fosco_orcamentos
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_orcamentos: admin altera" on public.fosco_orcamentos
  for update to authenticated using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));
create policy "fosco_orcamentos: admin apaga" on public.fosco_orcamentos
  for delete to authenticated using ((select fosco_privado.eh_admin()));

-- ---------------------------------------------------------------------
-- Mensagens: modelos editáveis e registro do que já foi mandado
-- ---------------------------------------------------------------------
create table public.fosco_modelos (
  id uuid primary key default gen_random_uuid(),
  chave text unique,
  nome text not null,
  tipo text not null default 'campanha' check (tipo in ('campanha', 'sistema')),
  texto text not null,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.fosco_modelos enable row level security;
create policy "fosco_modelos: admin vê" on public.fosco_modelos
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_modelos: admin cria" on public.fosco_modelos
  for insert to authenticated with check ((select fosco_privado.eh_admin()));
create policy "fosco_modelos: admin altera" on public.fosco_modelos
  for update to authenticated using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));
create policy "fosco_modelos: admin apaga" on public.fosco_modelos
  for delete to authenticated using ((select fosco_privado.eh_admin()));

create table public.fosco_envios (
  id bigint generated always as identity primary key,
  cliente_id uuid references public.fosco_clientes(id) on delete cascade,
  canal text not null default 'whatsapp' check (canal in ('whatsapp', 'email')),
  modelo text not null default '',
  criado_por uuid,
  criado_em timestamptz not null default now()
);
create index on public.fosco_envios (cliente_id, criado_em desc);
alter table public.fosco_envios enable row level security;
create policy "fosco_envios: admin vê" on public.fosco_envios
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_envios: admin registra" on public.fosco_envios
  for insert to authenticated with check ((select fosco_privado.eh_admin()));

-- Tentativas de cadastro por IP (só a função de cadastro mexe aqui)
create table public.fosco_tentativas (
  id bigint generated always as identity primary key,
  ip text not null,
  tipo text not null,
  criado_em timestamptz not null default now()
);
create index on public.fosco_tentativas (ip, tipo, criado_em desc);
alter table public.fosco_tentativas enable row level security;

-- ---------------------------------------------------------------------
-- Contas internas
-- ---------------------------------------------------------------------
create or replace function fosco_privado.saldo(p_cliente uuid) returns int
language sql stable security definer set search_path = '' as $$
  select coalesce(sum(pontos), 0)::int from public.fosco_pontos where cliente_id = p_cliente;
$$;

create or replace function fosco_privado.desconto(p_saldo int) returns numeric
language sql stable security definer set search_path = '' as $$
  select greatest(0, least(p_saldo * fosco_privado.cfg('percentual_por_ponto', 1),
                           fosco_privado.cfg('desconto_maximo', 50)));
$$;

create or replace function fosco_privado.fidelidade(p_cliente uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  n int := greatest(1, fosco_privado.cfg('fidelidade_sessoes', 6)::int);
  contadas int;
  usados int;
begin
  select count(*) filter (where conta_fidelidade), count(*) filter (where premio_valor > 0)
    into contadas, usados
    from public.fosco_sessoes where cliente_id = p_cliente;
  return jsonb_build_object(
    'necessarias', n,
    'premio', fosco_privado.cfg('fidelidade_premio', 200),
    'contadas', contadas,
    'no_cartao', contadas % n,
    'disponiveis', greatest(0, contadas / n - usados),
    'usados', usados);
end $$;

create or replace function fosco_privado.novo_codigo(p_nome text) returns text
language plpgsql volatile security definer set search_path = '' as $$
declare base text; cand text; i int := 0;
begin
  base := lower(split_part(trim(coalesce(p_nome, '')), ' ', 1));
  base := translate(base, 'áàâãäåéèêëíìîïóòôõöúùûüçñý', 'aaaaaaeeeeiiiiooooouuuucny');
  base := left(regexp_replace(base, '[^a-z]', '', 'g'), 12);
  if length(base) < 2 then base := 'fosco'; end if;
  loop
    i := i + 1;
    cand := base || case when i < 15 then (10 + floor(random() * 90))::int::text
                         else (100 + floor(random() * 9900))::int::text end;
    exit when not exists (select 1 from public.fosco_clientes where codigo = cand);
    if i > 60 then raise exception 'Não consegui gerar o código de indicação.'; end if;
  end loop;
  return cand;
end $$;

revoke all on function fosco_privado.cfg(text, numeric) from public;
revoke all on function fosco_privado.cfg_bool(text, boolean) from public;
revoke all on function fosco_privado.saldo(uuid) from public;
revoke all on function fosco_privado.desconto(int) from public;
revoke all on function fosco_privado.fidelidade(uuid) from public;
revoke all on function fosco_privado.novo_codigo(text) from public;

-- ---------------------------------------------------------------------
-- Cadastro (chamado só pela função fosco-cadastro / fosco-admin)
-- ---------------------------------------------------------------------
create or replace function public.fosco_registrar_cliente(
  p_id uuid, p_nome text, p_cpf text, p_whatsapp text, p_email text, p_nascimento date,
  p_aceita boolean, p_codigo_indicacao text, p_origem text default 'site', p_indicado_por uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_codigo text; v_indicador uuid; v_pts int; v_boas int;
begin
  v_codigo := fosco_privado.novo_codigo(p_nome);
  if p_indicado_por is not null then
    select id into v_indicador from public.fosco_clientes where id = p_indicado_por;
  elsif coalesce(trim(p_codigo_indicacao), '') <> '' then
    select id into v_indicador from public.fosco_clientes where codigo = lower(trim(p_codigo_indicacao));
  end if;

  insert into public.fosco_clientes
    (id, nome, cpf, whatsapp, email, nascimento, codigo, indicado_por, aceita_promocoes, origem)
  values
    (p_id, trim(p_nome), p_cpf, p_whatsapp, nullif(lower(trim(coalesce(p_email, ''))), ''), p_nascimento,
     v_codigo, v_indicador, coalesce(p_aceita, false), coalesce(p_origem, 'site'));

  if v_indicador is not null and fosco_privado.cfg_bool('indicacao_ativa', true) then
    v_pts := fosco_privado.cfg('pontos_por_indicacao', 1)::int;
    if v_pts > 0 then
      insert into public.fosco_pontos (cliente_id, pontos, motivo, indicado_id)
      values (v_indicador, v_pts, 'indicacao', p_id);
    end if;
  end if;

  v_boas := fosco_privado.cfg('pontos_boas_vindas', 0)::int;
  if v_boas > 0 then
    insert into public.fosco_pontos (cliente_id, pontos, motivo) values (p_id, v_boas, 'boas_vindas');
  end if;

  return jsonb_build_object('codigo', v_codigo, 'indicado', v_indicador is not null);
end $$;
revoke all on function public.fosco_registrar_cliente(uuid, text, text, text, text, date, boolean, text, text, uuid) from public, anon, authenticated;
grant execute on function public.fosco_registrar_cliente(uuid, text, text, text, text, date, boolean, text, text, uuid) to service_role;

-- Quem mandou o convite (só o primeiro nome)
create or replace function public.fosco_quem_indicou(p_codigo text) returns text
language sql stable security definer set search_path = '' as $$
  select split_part(nome, ' ', 1) from public.fosco_clientes
   where codigo = lower(trim(p_codigo)) limit 1;
$$;
revoke all on function public.fosco_quem_indicou(text) from public;
grant execute on function public.fosco_quem_indicou(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Área do cliente
-- ---------------------------------------------------------------------
create or replace function public.fosco_minha_area() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); c public.fosco_clientes; s int;
begin
  if uid is null then return null; end if;
  select * into c from public.fosco_clientes where id = uid;
  if not found then return null; end if;
  update public.fosco_clientes set ultimo_acesso = now() where id = uid;
  s := fosco_privado.saldo(uid);
  return jsonb_build_object(
    'cliente', jsonb_build_object(
      'nome', c.nome, 'codigo', c.codigo, 'whatsapp', c.whatsapp, 'email', c.email,
      'nascimento', c.nascimento, 'aceita_promocoes', c.aceita_promocoes, 'criado_em', c.criado_em),
    'pontos', s,
    'desconto', fosco_privado.desconto(s),
    'regras', jsonb_build_object(
      'percentual_por_ponto', fosco_privado.cfg('percentual_por_ponto', 1),
      'desconto_maximo', fosco_privado.cfg('desconto_maximo', 50),
      'pontos_por_indicacao', fosco_privado.cfg('pontos_por_indicacao', 1),
      'pontos_indicado_tatuou', fosco_privado.cfg('pontos_indicado_tatuou', 0)),
    'indicados', coalesce((
      select jsonb_agg(jsonb_build_object(
               'nome', split_part(i.nome, ' ', 1)
                       || coalesce(' ' || left(nullif(split_part(i.nome, ' ', 2), ''), 1) || '.', ''),
               'criado_em', i.criado_em,
               'tatuou', exists (select 1 from public.fosco_sessoes x where x.cliente_id = i.id))
             order by i.criado_em desc)
        from public.fosco_clientes i where i.indicado_por = uid), '[]'::jsonb),
    'extrato', coalesce((
      select jsonb_agg(jsonb_build_object(
               'pontos', p.pontos, 'motivo', p.motivo, 'observacao', p.observacao, 'criado_em', p.criado_em,
               'indicado', (select split_part(x.nome, ' ', 1) from public.fosco_clientes x where x.id = p.indicado_id))
             order by p.criado_em desc)
        from (select * from public.fosco_pontos where cliente_id = uid order by criado_em desc limit 80) p), '[]'::jsonb),
    'fidelidade', fosco_privado.fidelidade(uid),
    'sessoes', coalesce((
      select jsonb_agg(jsonb_build_object(
               'data', ss.data, 'artista', a.nome, 'descricao', ss.descricao,
               'desconto_percentual', ss.desconto_percentual, 'premio_valor', ss.premio_valor,
               'conta_fidelidade', ss.conta_fidelidade)
             order by ss.data desc, ss.criado_em desc)
        from public.fosco_sessoes ss left join public.fosco_artistas a on a.id = ss.artista_id
       where ss.cliente_id = uid), '[]'::jsonb));
end $$;
revoke all on function public.fosco_minha_area() from public, anon;
grant execute on function public.fosco_minha_area() to authenticated;

create or replace function public.fosco_atualizar_meus_dados(p_whatsapp text, p_email text, p_aceita boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); w text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
begin
  if uid is null then raise exception 'Entre na sua conta.'; end if;
  if w like '55%' and length(w) > 11 then w := substr(w, 3); end if;
  if w !~ '^[0-9]{10,11}$' then raise exception 'WhatsApp inválido: use DDD + número.'; end if;
  update public.fosco_clientes
     set whatsapp = w, email = nullif(lower(trim(coalesce(p_email, ''))), ''), aceita_promocoes = coalesce(p_aceita, false)
   where id = uid;
exception when unique_violation then
  raise exception 'Esse WhatsApp já está em outro cadastro.';
end $$;
revoke all on function public.fosco_atualizar_meus_dados(text, text, boolean) from public, anon;
grant execute on function public.fosco_atualizar_meus_dados(text, text, boolean) to authenticated;

-- ---------------------------------------------------------------------
-- Pedido de orçamento (visitante)
-- ---------------------------------------------------------------------
create or replace function public.fosco_pedir_orcamento(p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid; w text; v_nome text; v_ideia text; refs text[];
  uid uuid := (select auth.uid()); v_cli uuid; v_art uuid;
begin
  v_nome := left(trim(coalesce(p->>'nome', '')), 120);
  w := regexp_replace(coalesce(p->>'whatsapp', ''), '\D', '', 'g');
  if w like '55%' and length(w) > 11 then w := substr(w, 3); end if;
  v_ideia := left(trim(coalesce(p->>'ideia', '')), 3000);

  if length(v_nome) < 2 then raise exception 'Diga seu nome.'; end if;
  if w !~ '^[0-9]{10,11}$' then raise exception 'WhatsApp inválido: use DDD + número.'; end if;
  if length(v_ideia) < 5 then raise exception 'Conte um pouco da sua ideia.'; end if;

  if (select count(*) from public.fosco_orcamentos
       where whatsapp = w and criado_em > now() - interval '1 hour') >= 3 then
    raise exception 'Você já mandou alguns pedidos agora há pouco. A gente responde logo!';
  end if;
  if (select count(*) from public.fosco_orcamentos where criado_em > now() - interval '10 minutes') >= 30 then
    raise exception 'Muitos pedidos ao mesmo tempo. Tente de novo em alguns minutos.';
  end if;

  select coalesce(array_agg(r.x), '{}') into refs
    from (select jsonb_array_elements_text(coalesce(p->'referencias', '[]'::jsonb)) as x limit 5) r
   where r.x like 'orcamentos/%';

  if uid is not null then select id into v_cli from public.fosco_clientes where id = uid; end if;
  begin
    v_art := nullif(p->>'artista_id', '')::uuid;
  exception when others then
    v_art := null;
  end;
  if v_art is not null and not exists (select 1 from public.fosco_artistas where id = v_art) then
    v_art := null;
  end if;

  insert into public.fosco_orcamentos
    (cliente_id, nome, whatsapp, email, artista_id, ideia, local_corpo, tamanho, estilo, cor, referencias, disponibilidade)
  values
    (v_cli, v_nome, w, nullif(left(lower(trim(coalesce(p->>'email', ''))), 160), ''), v_art, v_ideia,
     left(coalesce(p->>'local_corpo', ''), 120), left(coalesce(p->>'tamanho', ''), 60),
     left(coalesce(p->>'estilo', ''), 120), left(coalesce(p->>'cor', ''), 40), refs,
     left(coalesce(p->>'disponibilidade', ''), 300))
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.fosco_pedir_orcamento(jsonb) from public;
grant execute on function public.fosco_pedir_orcamento(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Painel do estúdio
-- ---------------------------------------------------------------------
create or replace function public.fosco_admin_clientes() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform fosco_privado.exigir_admin();
  return coalesce((
    select jsonb_agg(to_jsonb(t) order by t.criado_em desc) from (
      select c.id, c.nome, c.cpf, c.whatsapp, c.email, c.nascimento, c.codigo, c.indicado_por,
             (select x.nome from public.fosco_clientes x where x.id = c.indicado_por) as indicador_nome,
             c.aceita_promocoes, c.origem, c.notas, c.criado_em, c.ultimo_acesso,
             coalesce((select sum(p.pontos) from public.fosco_pontos p where p.cliente_id = c.id), 0)::int as pontos,
             (select count(*) from public.fosco_clientes i where i.indicado_por = c.id)::int as indicados,
             (select count(*) from public.fosco_sessoes s where s.cliente_id = c.id)::int as sessoes,
             (select count(*) from public.fosco_sessoes s where s.cliente_id = c.id and s.conta_fidelidade)::int as sessoes_fidelidade,
             (select count(*) from public.fosco_sessoes s where s.cliente_id = c.id and s.premio_valor > 0)::int as premios_usados,
             (select max(s.data) from public.fosco_sessoes s where s.cliente_id = c.id) as ultima_sessao,
             (select max(e.criado_em) from public.fosco_envios e where e.cliente_id = c.id) as ultimo_envio
        from public.fosco_clientes c) t), '[]'::jsonb);
end $$;

create or replace function public.fosco_admin_cliente(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare s int;
begin
  perform fosco_privado.exigir_admin();
  if not exists (select 1 from public.fosco_clientes where id = p_id) then return null; end if;
  s := fosco_privado.saldo(p_id);
  return jsonb_build_object(
    'cliente', (select to_jsonb(c) from public.fosco_clientes c where c.id = p_id),
    'pontos', s,
    'desconto', fosco_privado.desconto(s),
    'fidelidade', fosco_privado.fidelidade(p_id),
    'indicador', (select jsonb_build_object('id', x.id, 'nome', x.nome)
                    from public.fosco_clientes c join public.fosco_clientes x on x.id = c.indicado_por
                   where c.id = p_id),
    'indicados', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', i.id, 'nome', i.nome, 'whatsapp', i.whatsapp, 'criado_em', i.criado_em,
               'tatuou', exists (select 1 from public.fosco_sessoes x where x.cliente_id = i.id))
             order by i.criado_em desc)
        from public.fosco_clientes i where i.indicado_por = p_id), '[]'::jsonb),
    'extrato', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', p.id, 'pontos', p.pontos, 'motivo', p.motivo, 'observacao', p.observacao,
               'criado_em', p.criado_em,
               'indicado', (select x.nome from public.fosco_clientes x where x.id = p.indicado_id))
             order by p.criado_em desc)
        from public.fosco_pontos p where p.cliente_id = p_id), '[]'::jsonb),
    'sessoes', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', ss.id, 'data', ss.data, 'artista_id', ss.artista_id, 'artista', a.nome,
               'valor', ss.valor, 'descricao', ss.descricao, 'conta_fidelidade', ss.conta_fidelidade,
               'desconto_percentual', ss.desconto_percentual, 'premio_valor', ss.premio_valor)
             order by ss.data desc, ss.criado_em desc)
        from public.fosco_sessoes ss left join public.fosco_artistas a on a.id = ss.artista_id
       where ss.cliente_id = p_id), '[]'::jsonb),
    'envios', coalesce((
      select jsonb_agg(jsonb_build_object('canal', e.canal, 'modelo', e.modelo, 'criado_em', e.criado_em)
             order by e.criado_em desc)
        from (select * from public.fosco_envios where cliente_id = p_id order by criado_em desc limit 20) e), '[]'::jsonb));
end $$;

create or replace function public.fosco_admin_registrar_sessao(
  p_cliente uuid, p_artista uuid, p_data date, p_valor numeric, p_descricao text,
  p_conta_fidelidade boolean, p_usar_desconto boolean, p_usar_premio boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_saldo int; v_pct numeric := 0; v_ppp numeric; v_usados int := 0; v_premio numeric := 0;
  v_fid jsonb; v_primeira boolean; v_ind uuid; v_bonus int; v_id uuid;
begin
  perform fosco_privado.exigir_admin();
  if not exists (select 1 from public.fosco_clientes where id = p_cliente) then
    raise exception 'Cliente não encontrado.';
  end if;
  v_primeira := not exists (select 1 from public.fosco_sessoes where cliente_id = p_cliente);

  if coalesce(p_usar_desconto, false) then
    v_saldo := fosco_privado.saldo(p_cliente);
    v_ppp := greatest(0.0001, fosco_privado.cfg('percentual_por_ponto', 1));
    v_pct := fosco_privado.desconto(v_saldo);
    v_usados := least(v_saldo, ceil(v_pct / v_ppp)::int);
  end if;

  -- o prêmio usa o que foi ganho ANTES desta sessão
  if coalesce(p_usar_premio, false) then
    v_fid := fosco_privado.fidelidade(p_cliente);
    if (v_fid->>'disponiveis')::int > 0 then v_premio := (v_fid->>'premio')::numeric; end if;
  end if;

  insert into public.fosco_sessoes
    (cliente_id, artista_id, data, valor, descricao, conta_fidelidade, desconto_percentual, premio_valor, criado_por)
  values
    (p_cliente, p_artista, coalesce(p_data, (now() at time zone 'America/Recife')::date), p_valor,
     coalesce(p_descricao, ''), coalesce(p_conta_fidelidade, true), v_pct, v_premio, (select auth.uid()))
  returning id into v_id;

  if v_usados > 0 then
    insert into public.fosco_pontos (cliente_id, pontos, motivo, sessao_id, criado_por, observacao)
    values (p_cliente, -v_usados, 'resgate', v_id, (select auth.uid()), v_pct::text || '% de desconto na sessão');
  end if;

  if v_primeira then
    select indicado_por into v_ind from public.fosco_clientes where id = p_cliente;
    v_bonus := fosco_privado.cfg('pontos_indicado_tatuou', 0)::int;
    if v_ind is not null and v_bonus > 0
       and not exists (select 1 from public.fosco_pontos where indicado_id = p_cliente and motivo = 'indicado_tatuou') then
      insert into public.fosco_pontos (cliente_id, pontos, motivo, indicado_id, sessao_id)
      values (v_ind, v_bonus, 'indicado_tatuou', p_cliente, v_id);
    end if;
  end if;

  return jsonb_build_object(
    'id', v_id, 'desconto_percentual', v_pct, 'pontos_usados', v_usados, 'premio_valor', v_premio,
    'valor_final', case when p_valor is null then null
                        else greatest(0, round(p_valor * (1 - v_pct / 100) - v_premio, 2)) end);
end $$;

create or replace function public.fosco_admin_apagar_sessao(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform fosco_privado.exigir_admin();
  delete from public.fosco_pontos where sessao_id = p_id;
  delete from public.fosco_sessoes where id = p_id;
end $$;

create or replace function public.fosco_admin_ajustar_pontos(p_cliente uuid, p_pontos int, p_obs text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform fosco_privado.exigir_admin();
  if coalesce(p_pontos, 0) = 0 then return; end if;
  insert into public.fosco_pontos (cliente_id, pontos, motivo, observacao, criado_por)
  values (p_cliente, p_pontos, 'ajuste', coalesce(p_obs, ''), (select auth.uid()));
end $$;

create or replace function public.fosco_admin_resumo() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare hoje date := (now() at time zone 'America/Recife')::date;
begin
  perform fosco_privado.exigir_admin();
  return jsonb_build_object(
    'clientes', (select count(*) from public.fosco_clientes),
    'novos_7d', (select count(*) from public.fosco_clientes where criado_em > now() - interval '7 days'),
    'novos_30d', (select count(*) from public.fosco_clientes where criado_em > now() - interval '30 days'),
    'indicacoes_30d', (select count(*) from public.fosco_pontos where motivo = 'indicacao' and criado_em > now() - interval '30 days'),
    'orcamentos_novos', (select count(*) from public.fosco_orcamentos where status = 'novo'),
    'sessoes_mes', (select count(*) from public.fosco_sessoes where date_trunc('month', data) = date_trunc('month', hoje)),
    'aniversariantes_hoje', (select count(*) from public.fosco_clientes
                              where extract(month from nascimento) = extract(month from hoje)
                                and extract(day from nascimento) = extract(day from hoje)),
    'aniversariantes_mes', (select count(*) from public.fosco_clientes
                             where extract(month from nascimento) = extract(month from hoje)));
end $$;

revoke all on function public.fosco_admin_clientes() from public, anon;
revoke all on function public.fosco_admin_cliente(uuid) from public, anon;
revoke all on function public.fosco_admin_registrar_sessao(uuid, uuid, date, numeric, text, boolean, boolean, boolean) from public, anon;
revoke all on function public.fosco_admin_apagar_sessao(uuid) from public, anon;
revoke all on function public.fosco_admin_ajustar_pontos(uuid, int, text) from public, anon;
revoke all on function public.fosco_admin_resumo() from public, anon;
grant execute on function public.fosco_admin_clientes() to authenticated;
grant execute on function public.fosco_admin_cliente(uuid) to authenticated;
grant execute on function public.fosco_admin_registrar_sessao(uuid, uuid, date, numeric, text, boolean, boolean, boolean) to authenticated;
grant execute on function public.fosco_admin_apagar_sessao(uuid) to authenticated;
grant execute on function public.fosco_admin_ajustar_pontos(uuid, int, text) to authenticated;
grant execute on function public.fosco_admin_resumo() to authenticated;

-- ---------------------------------------------------------------------
-- Arquivos: vitrine pública e referências dos pedidos de orçamento
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('fosco', 'fosco', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('fosco-referencias', 'fosco-referencias', false, 8388608,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do nothing;

create policy "fosco: admin envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'fosco' and (select fosco_privado.eh_admin()));
create policy "fosco: admin troca" on storage.objects for update to authenticated
  using (bucket_id = 'fosco' and (select fosco_privado.eh_admin()));
create policy "fosco: admin tira" on storage.objects for delete to authenticated
  using (bucket_id = 'fosco' and (select fosco_privado.eh_admin()));
create policy "fosco: admin lista" on storage.objects for select to authenticated
  using (bucket_id = 'fosco' and (select fosco_privado.eh_admin()));
create policy "fosco: visitante manda referência" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'fosco-referencias' and (storage.foldername(name))[1] = 'orcamentos');
create policy "fosco: admin vê referências" on storage.objects for select to authenticated
  using (bucket_id = 'fosco-referencias' and (select fosco_privado.eh_admin()));
create policy "fosco: admin tira referências" on storage.objects for delete to authenticated
  using (bucket_id = 'fosco-referencias' and (select fosco_privado.eh_admin()));
