-- Presente do convite: quem se cadastra pelo link de um amigo já ganha pontos
-- (programa.pontos_boas_vindas_indicado; 10 pontos = 10% com 1% por ponto).
-- Soma com os pontos de boas-vindas gerais, que valem para qualquer cadastro.
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
  if v_indicador is not null and fosco_privado.cfg_bool('indicacao_ativa', true) then
    v_boas := v_boas + fosco_privado.cfg('pontos_boas_vindas_indicado', 0)::int;
  end if;
  if v_boas > 0 then
    insert into public.fosco_pontos (cliente_id, pontos, motivo) values (p_id, v_boas, 'boas_vindas');
  end if;

  return jsonb_build_object('codigo', v_codigo, 'indicado', v_indicador is not null, 'presente', greatest(v_boas, 0));
end $$;
revoke all on function public.fosco_registrar_cliente(uuid, text, text, text, text, date, boolean, text, text, uuid) from public, anon, authenticated;
grant execute on function public.fosco_registrar_cliente(uuid, text, text, text, text, date, boolean, text, text, uuid) to service_role;

update public.fosco_config
   set programa = programa || jsonb_build_object('pontos_boas_vindas_indicado', 10)
 where id = 1 and not (programa ? 'pontos_boas_vindas_indicado');
