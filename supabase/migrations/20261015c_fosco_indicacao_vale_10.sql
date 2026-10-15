-- A propaganda é para quem indica: cada amigo cadastrado pelo link vale 10 pontos (10%)
-- para quem indicou. O amigo que chega pelo convite ganha 1 ponto (1%), regra interna
-- que não aparece no site.
update public.fosco_config
   set programa = programa || jsonb_build_object('pontos_por_indicacao', 10, 'pontos_boas_vindas_indicado', 1)
 where id = 1;
