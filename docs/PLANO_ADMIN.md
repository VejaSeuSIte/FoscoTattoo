# Plano do /admin (18/10/2026)

1. `/admin` vira o endereço do painel; `/painel` redireciona.
2. Login do dono pelo nome («Marcelo Morais»): o nome vira um e-mail interno `<nome-sem-espaço>@fosco.admin`.
3. /bio vinda do banco (`fosco_bio_links`), editável na aba Vitrine → Bio (aparece/escondido, ordem, destaque).
4. Equipe: trocar o retrato do card.
5. Pontos: botões de dar e tirar, motivo obrigatório.
6. Cartão fidelidade de carimbos clicável: carimbo vazio = marcar sessão; o último carimbo = desmarcar.
7. Apagar cadastro só digitando o primeiro nome.
8. Confirmação do WhatsApp: depois do cadastro, a pessoa manda para o estúdio uma mensagem com um código de 4 dígitos.
   O ponto de quem indicou (e o do indicado) só entra quando o WhatsApp é confirmado.
   - Fase 1 (agora): manual. Lista «esperando confirmação» no /admin, o estúdio aperta ✓.
   - Fase 2: automática pela API oficial do WhatsApp (Cloud API, coexistência com o app Business).
     A função `fosco-whatsapp` recebe as mensagens e chama `fosco_confirmar_por_mensagem`
     (aceita o código em qualquer lugar do texto, ou só o número batendo com um cadastro pendente; código vale 24 h).
     Precisa do dono do número uma vez (Meta Business + código por SMS).
   - Cadastro feito pelo estúdio já nasce confirmado; os cadastros antigos foram dados por confirmados.
