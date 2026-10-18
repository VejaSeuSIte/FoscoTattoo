-- 18/10: /admin completo.
-- 1) Confirmação do WhatsApp: quem se cadastra pelo site manda ao estúdio uma
--    mensagem com um código; o ponto de quem indicou (e o do indicado) só entra
--    depois disso. Cadastro feito pelo estúdio já nasce confirmado.
-- 2) /bio vinda do banco (fosco_bio_links), editável no painel.

alter table public.fosco_clientes
  add column if not exists whatsapp_confirmado_em timestamptz,
  add column if not exists codigo_confirmacao text,
  add column if not exists codigo_expira timestamptz;

-- quem já estava cadastrado fica como confirmado (os pontos dele já tinham entrado)
update public.fosco_clientes set whatsapp_confirmado_em = criado_em where whatsapp_confirmado_em is null;

create or replace function fosco_privado.novo_codigo_confirmacao() returns text
language sql volatile set search_path = '' as $$
  select lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
$$;

-- credita a indicação (quem indicou + o indicado) uma vez só
create or replace function fosco_privado.creditar_indicacao(p_cliente uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_ind uuid; v_pts int; v_ja int; v_boas int;
begin
  select indicado_por into v_ind from public.fosco_clientes where id = p_cliente;
  if v_ind is null or not fosco_privado.cfg_bool('indicacao_ativa', true) then return; end if;
  if exists (select 1 from public.fosco_pontos where indicado_id = p_cliente and motivo = 'indicacao') then return; end if;

  select count(*) into v_ja from public.fosco_pontos where cliente_id = v_ind and motivo = 'indicacao';
  if v_ja = 0 then
    v_pts := fosco_privado.cfg('pontos_primeira_indicacao', fosco_privado.cfg('pontos_por_indicacao', 1))::int;
  else
    v_pts := fosco_privado.cfg('pontos_por_indicacao', 1)::int;
  end if;
  if v_pts > 0 then
    insert into public.fosco_pontos (cliente_id, pontos, motivo, indicado_id) values (v_ind, v_pts, 'indicacao', p_cliente);
  end if;

  v_boas := fosco_privado.cfg('pontos_boas_vindas_indicado', 0)::int;
  if v_boas > 0 then
    insert into public.fosco_pontos (cliente_id, pontos, motivo, observacao)
    values (p_cliente, v_boas, 'boas_vindas', 'chegou por indicação');
  end if;
end $$;

create or replace function fosco_privado.confirmar(p_cliente uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.fosco_clientes
     set whatsapp_confirmado_em = now(), codigo_confirmacao = null, codigo_expira = null
   where id = p_cliente and whatsapp_confirmado_em is null;
  if not found then return false; end if;
  perform fosco_privado.creditar_indicacao(p_cliente);
  return true;
end $$;

create or replace function public.fosco_registrar_cliente(
  p_id uuid, p_nome text, p_cpf text, p_whatsapp text, p_email text, p_nascimento date,
  p_aceita boolean, p_codigo_indicacao text, p_origem text default 'site', p_indicado_por uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_codigo text; v_indicador uuid; v_boas int; v_estudio boolean := coalesce(p_origem, 'site') = 'estudio';
begin
  v_codigo := fosco_privado.novo_codigo(p_nome);
  if p_indicado_por is not null then
    select id into v_indicador from public.fosco_clientes where id = p_indicado_por;
  elsif coalesce(trim(p_codigo_indicacao), '') <> '' then
    select id into v_indicador from public.fosco_clientes where codigo = lower(trim(p_codigo_indicacao));
  end if;

  insert into public.fosco_clientes
    (id, nome, cpf, whatsapp, email, nascimento, codigo, indicado_por, aceita_promocoes, origem,
     whatsapp_confirmado_em, codigo_confirmacao, codigo_expira)
  values
    (p_id, trim(p_nome), p_cpf, p_whatsapp, nullif(lower(trim(coalesce(p_email, ''))), ''), p_nascimento,
     v_codigo, v_indicador, coalesce(p_aceita, false), coalesce(p_origem, 'site'),
     case when v_estudio then now() end,
     case when v_estudio then null else fosco_privado.novo_codigo_confirmacao() end,
     case when v_estudio then null else now() + interval '24 hours' end);

  v_boas := fosco_privado.cfg('pontos_boas_vindas', 0)::int;
  if v_boas > 0 then
    insert into public.fosco_pontos (cliente_id, pontos, motivo) values (p_id, v_boas, 'boas_vindas');
  end if;

  -- a indicação só vale com o WhatsApp confirmado
  if v_estudio then perform fosco_privado.creditar_indicacao(p_id); end if;

  return jsonb_build_object('codigo', v_codigo, 'indicado', v_indicador is not null, 'presente', greatest(v_boas, 0));
end $$;
revoke all on function public.fosco_registrar_cliente(uuid, text, text, text, text, date, boolean, text, text, uuid) from public, anon, authenticated;
grant execute on function public.fosco_registrar_cliente(uuid, text, text, text, text, date, boolean, text, text, uuid) to service_role;

-- a área do cliente pergunta se falta confirmar e pega o código (renova se venceu)
create or replace function public.fosco_minha_confirmacao() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); c public.fosco_clientes;
begin
  if uid is null then return null; end if;
  select * into c from public.fosco_clientes where id = uid;
  if not found then return null; end if;
  if c.whatsapp_confirmado_em is not null then
    return jsonb_build_object('confirmado', true);
  end if;
  if c.codigo_confirmacao is null or c.codigo_expira < now() then
    update public.fosco_clientes
       set codigo_confirmacao = fosco_privado.novo_codigo_confirmacao(), codigo_expira = now() + interval '24 hours'
     where id = uid returning * into c;
  end if;
  return jsonb_build_object('confirmado', false, 'codigo', c.codigo_confirmacao, 'expira', c.codigo_expira,
                            'indicado', c.indicado_por is not null);
end $$;
revoke all on function public.fosco_minha_confirmacao() from public, anon;
grant execute on function public.fosco_minha_confirmacao() to authenticated;

-- o estúdio confirma na mão (fase manual)
create or replace function public.fosco_admin_confirmar_whatsapp(p_cliente uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform fosco_privado.exigir_admin();
  return fosco_privado.confirmar(p_cliente);
end $$;
revoke all on function public.fosco_admin_confirmar_whatsapp(uuid) from public, anon;
grant execute on function public.fosco_admin_confirmar_whatsapp(uuid) to authenticated;

-- fase automática: a função do WhatsApp manda o número de quem escreveu e o texto.
-- Vale o código em qualquer lugar do texto; sem código, vale o número batendo
-- com um cadastro pendente. O WhatsApp às vezes manda o celular sem o 9.
create or replace function public.fosco_confirmar_por_mensagem(p_whatsapp text, p_texto text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare w text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g'); v_id uuid; v_nome text;
begin
  w := regexp_replace(w, '^55(?=\d{10,11}$)', '');
  select id, nome into v_id, v_nome from public.fosco_clientes
   where whatsapp_confirmado_em is null
     and (whatsapp = w or (length(w) = 10 and whatsapp = left(w, 2) || '9' || right(w, 8)))
   order by (codigo_confirmacao is not null and coalesce(p_texto, '') ~ ('(^|\D)' || codigo_confirmacao || '(\D|$)')) desc,
            criado_em desc
   limit 1;
  if v_id is null then return jsonb_build_object('confirmado', false); end if;
  perform fosco_privado.confirmar(v_id);
  return jsonb_build_object('confirmado', true, 'nome', v_nome);
end $$;
revoke all on function public.fosco_confirmar_por_mensagem(text, text) from public, anon, authenticated;
grant execute on function public.fosco_confirmar_por_mensagem(text, text) to service_role;

create or replace function public.fosco_admin_clientes() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform fosco_privado.exigir_admin();
  return coalesce((
    select jsonb_agg(to_jsonb(t) order by t.criado_em desc) from (
      select c.id, c.nome, c.cpf, c.whatsapp, c.email, c.nascimento, c.codigo, c.indicado_por,
             (select x.nome from public.fosco_clientes x where x.id = c.indicado_por) as indicador_nome,
             c.aceita_promocoes, c.origem, c.notas, c.criado_em, c.ultimo_acesso,
             c.whatsapp_confirmado_em, c.codigo_confirmacao,
             coalesce((select sum(p.pontos) from public.fosco_pontos p where p.cliente_id = c.id), 0)::int as pontos,
             (select count(*) from public.fosco_clientes i where i.indicado_por = c.id)::int as indicados,
             (select count(*) from public.fosco_sessoes s where s.cliente_id = c.id)::int as sessoes,
             (select count(*) from public.fosco_sessoes s where s.cliente_id = c.id and s.conta_fidelidade)::int as sessoes_fidelidade,
             (select count(*) from public.fosco_sessoes s where s.cliente_id = c.id and s.premio_valor > 0)::int as premios_usados,
             (select max(s.data) from public.fosco_sessoes s where s.cliente_id = c.id) as ultima_sessao,
             (select max(e.criado_em) from public.fosco_envios e where e.cliente_id = c.id) as ultimo_envio
        from public.fosco_clientes c) t), '[]'::jsonb);
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
    'aguardando_confirmacao', (select count(*) from public.fosco_clientes where whatsapp_confirmado_em is null),
    'orcamentos_novos', (select count(*) from public.fosco_orcamentos where status = 'novo'),
    'sessoes_mes', (select count(*) from public.fosco_sessoes where date_trunc('month', data) = date_trunc('month', hoje)),
    'aniversariantes_hoje', (select count(*) from public.fosco_clientes
                              where extract(month from nascimento) = extract(month from hoje)
                                and extract(day from nascimento) = extract(day from hoje)),
    'aniversariantes_mes', (select count(*) from public.fosco_clientes
                             where extract(month from nascimento) = extract(month from hoje)));
end $$;

-- ---------------------------------------------------------------------
-- /bio editável. `link` aceita atalhos: @indique, @orcamento, @mapa, @whatsapp,
-- @instagram; nos textos, {max} e {primeira} viram os números do programa.
-- ---------------------------------------------------------------------
create table if not exists public.fosco_bio_links (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default '',
  sub text not null default '',
  link text not null default '',
  icone text not null default 'seta',
  destaque boolean not null default false,
  ativo boolean not null default true,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.fosco_bio_links enable row level security;
create policy "fosco_bio_links: público vê ativos" on public.fosco_bio_links
  for select to anon, authenticated using (ativo);
create policy "fosco_bio_links: admin vê todos" on public.fosco_bio_links
  for select to authenticated using ((select fosco_privado.eh_admin()));
create policy "fosco_bio_links: admin cria" on public.fosco_bio_links
  for insert to authenticated with check ((select fosco_privado.eh_admin()));
create policy "fosco_bio_links: admin altera" on public.fosco_bio_links
  for update to authenticated using ((select fosco_privado.eh_admin())) with check ((select fosco_privado.eh_admin()));
create policy "fosco_bio_links: admin apaga" on public.fosco_bio_links
  for delete to authenticated using ((select fosco_privado.eh_admin()));

insert into public.fosco_bio_links (titulo, sub, link, icone, destaque, ordem)
select * from (values
  ('Indique e ganhe até {max}%', 'Sua 1ª indicação já vale {primeira}% de desconto', '@indique', 'presente', true, 1),
  ('Pedir orçamento', 'Conta sua ideia no WhatsApp', '@orcamento', 'zap', false, 2),
  ('Como cuidar da sua tattoo', 'O que fazer e o que evitar nos primeiros dias', '/cuidados/', 'gota', false, 3),
  ('Minha área', 'Seus pontos, seu link e o cartão fidelidade', '/entrar/', 'pessoas', false, 4),
  ('Como chegar', '', '@mapa', 'pino', false, 5)
) v(titulo, sub, link, icone, destaque, ordem)
where not exists (select 1 from public.fosco_bio_links);
