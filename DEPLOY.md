# Render gratuita + Turso gratuito

O GitHub Pages continua exibindo a demonstração local. O servidor autenticado roda na **Render Free** e os dados ficam em um banco remoto **Turso Free**. `render.yaml` não cria disco nem serviço pago. Ambos os serviços têm limites de uso; confira os planos nas suas contas. A Render gratuita pode suspender a aplicação após inatividade e levar algum tempo para responder novamente.

## 1. Criar o banco gratuito

1. Acesse https://turso.tech/ e entre/crie sua conta.
2. Escolha o plano gratuito, crie um banco e copie a **Database URL** (`libsql://...`) e gere um token com acesso ao banco. Não publique nem envie esse token em mensagens.
3. Guarde esses dois valores para preencher na Render. O servidor cria as tabelas automaticamente na primeira conexão. Produtos começam desativados e com estoque zero; a vitrine mantém os cards de apresentação com a indicação “Em breve”. Publicar um produto no financeiro habilita a compra conforme o estoque.

O banco fica no Turso, não no disco temporário da Render. Reiniciar/reimplantar o servidor não deve apagar pedidos ou estoque. A conexão real ainda deve ser validada após cadastrar URL/token na sua conta; os testes do repositório usam o mesmo cliente e operações com um banco local temporário.

## 2. Criar o serviço gratuito na Render

1. Acesse https://dashboard.render.com/ e escolha **New → Web Service**.
2. Conecte `planoaadm2-prog/Site-fab-loja`, branch `main`, e dê um nome novo ao serviço (por exemplo, `virtuosa-beach-free`). Selecione **Node** e plano **Free**, sem adicionar disco.
3. Build Command: `npm ci --ignore-scripts`. Start Command: `npm start`. Health Check Path: `/health`.
4. Em **Environment**, preencha:

| Variável | Valor |
| --- | --- |
| `NODE_VERSION` | `24.19.0` |
| `TURSO_DATABASE_URL` | URL do banco Turso (`libsql://...` ou `https://...`). |
| `TURSO_AUTH_TOKEN` | Token do banco, guardado apenas como segredo no servidor. |
| `ADMIN_PASSWORD` | Senha exclusiva e longa para a equipe, pelo menos 12 caracteres. |
| `APP_BASE_URL` | Endereço HTTPS do serviço Render, sem caminho ou barra final. Use o endereço atribuído ao serviço e atualize esta variável se necessário. |

5. Publique o serviço. Também é possível criar um **novo Blueprint** a partir de `render.yaml`, que já declara o plano `free`, sem disco.
6. Confirme `/health` e abra `/gestao`. Entre com a senha, configure preço, custo e estoque. Antes do lançamento comercial, revise também as imagens e informações do catálogo.

Se a tentativa anterior deixou um serviço com plano/disco pago, a configuração de um **novo** serviço gratuito evita depender da conversão daquele disco. Não remova um serviço ou disco que contenha dados sem backup. A atualização do repositório não altera automaticamente contratos na sua conta Render.

A aplicação se recusa a iniciar na Render sem `TURSO_DATABASE_URL`: não usa silenciosamente SQLite no disco temporário. Isso evita perder dados ao reiniciar. Se falhar, confira as variáveis e os logs; não compartilhe valores de senhas/tokens.

## 3. Habilitar pagamento de teste

O servidor pode iniciar sem Mercado Pago. O checkout fica desativado até configurar também:

| Variável | O que configurar |
| --- | --- |
| `MP_ACCESS_TOKEN` | Access Token **de teste** da aplicação Mercado Pago. |
| `MP_WEBHOOK_SECRET` | Chave secreta de assinatura dos Webhooks da aplicação. |
| `MP_COLLECTOR_ID` | Identificador da conta vendedora de teste correspondente ao token. |

Depois de salvar essas variáveis, abra `/gestao` e clique em **Verificar conexão Mercado Pago**. O diagnóstico consulta a conta na API, não cria cobrança e não mostra as credenciais. A presença da chave de webhook não valida sua assinatura; isso requer uma notificação de teste real.

## Configurar o Mercado Pago

Na aplicação de testes da conta Mercado Pago, configure as notificações de **pagamentos** para:

```text
https://SEU-ENDERECO-NA-RENDER/api/mercadopago/webhook
```

Use a chave secreta da configuração de Webhooks em `MP_WEBHOOK_SECRET`, e a conta vendedora/compradora de teste conforme as instruções atuais do Mercado Pago. O servidor usa `sandbox_init_point`, limita o checkout a até 6 parcelas e aceita confirmações apenas com `live_mode: false`. A definição comercial de parcelamento/juros depende das condições configuradas na conta; esta versão não promete crédito sem juros na operação do provedor.

As notificações são validadas por HMAC (`x-signature`, `x-request-id`, `data.id`) com tolerância de 10 minutos (timestamp em segundos ou milissegundos). A confirmação é consultada novamente na API oficial; conta recebedora, moeda, referência, valor e modo de teste são conferidos. Não há confiança no retorno do navegador. A integração **ainda precisa de homologação ponta a ponta com as credenciais da conta**; os testes automatizados usam um provedor substituto, não fazem uma compra no Mercado Pago.

## Como funciona o estoque

O servidor calcula preços e custos, reserva peças em uma transação no banco Turso/libSQL ao iniciar o checkout e impede estoque negativo. A notificação de aprovação transforma a reserva em venda. Reenvios do mesmo pagamento não duplicam a baixa. Reembolso integral confirmado devolve estoque uma única vez. Reembolso parcial, contestação, frete e expedição não estão implementados.

Reservas não são liberadas automaticamente: timeout, abandono e pagamento recusado podem ser seguidos de uma tentativa posterior no mesmo checkout. Liberar essas peças sem conciliar o provedor pode causar venda duplicada. Pedidos reservados ficam visíveis na gestão e precisam de conferência. **Antes de ativar pagamentos reais, implementar e homologar expiração/cancelamento com conciliação e tratamento de contestação/reembolso parcial.** Não ajustar o estoque disponível para compensar reservas sem essa conferência.

## Antes do lançamento comercial

O modo padrão permanece sandbox; pagamentos reais exigem a ativação explícita descrita abaixo. Ainda são necessários: homologação do checkout e Webhook na conta, conciliação e ciclo completo das reservas, condições de frete/retirada, políticas comerciais e de privacidade, fotos/dados reais do catálogo, estratégia de backup/exportação e teste de restauração do banco. A equipe precisa validar as condições de taxas e parcelamento na conta Mercado Pago. O financeiro registra taxas retornadas no pagamento; saldo disponível e datas de recebimento devem ser conciliados com os relatórios do provedor.

A gestão tem senha e sessão HttpOnly/Secure/SameSite, bloqueio por tentativas, verificação de origem e dados privados somente no servidor. Não é um sistema multiusuário com permissões individuais ou recuperação automática de senha. Troque `ADMIN_PASSWORD` no ambiente e reinicie para rotacionar o acesso e invalidar sessões.

## Desenvolvimento e validação

Node 24.5 ou superior. A dependência `@libsql/client` está fixada no lockfile:

```sh
npm ci --ignore-scripts
npm test
```

Para testar interface local, configure `ADMIN_PASSWORD` com uma senha de desenvolvimento e `APP_BASE_URL=http://127.0.0.1:3000` somente no seu processo, depois execute `npm start`. Sem `TURSO_DATABASE_URL`, o desenvolvimento local usa `.data/virtuosa.sqlite`, ignorado pelo Git. Na Render, o banco remoto é obrigatório. Sem as credenciais Mercado Pago e HTTPS, o checkout permanecerá desativado. Não use senhas de desenvolvimento na Render.

`npm test` usa banco temporário e provedor substituto. Valida autenticação, CSRF, dados privados, preço calculado no servidor, reserva/idempotência/estoque insuficiente, assinatura de notificação, rejeição de valor/conta/modo incorretos, aprovação, reembolso e persistência.

Na hospedagem, use exportação/backup do Turso e confirme as condições de retenção do seu plano. Para um banco SQLite local antigo, exporte e valide uma migração antes de mudar sua conexão; não há importação automática desses arquivos para o Turso. Nenhum dado deve ser guardado no disco temporário da Render.

## Venda presencial / balcão

Na gestão protegida `/gestao`, a seção **Nova venda presencial** registra pagamentos já recebidos/conferidos pela equipe, sem depender de uma conta Mercado Pago. Selecione produto, tamanho, quantidade e unidade; adicione as peças e informe dinheiro, Pix, débito ou crédito (1 a 12 parcelas). Informe em reais a taxa efetiva do meio de pagamento, se houver. Dinheiro permite informar o recebido e conferir o troco. Confirme que conferiu o recebimento antes de registrar.

O servidor usa preços e custos do cadastro, verifica novamente o estoque, registra a venda e baixa as peças em uma única transação. Uma mesma tentativa não gera venda duplicada. Produtos não publicados online também podem ser vendidos presencialmente se tiverem estoque. O estoque é **único e compartilhado**, não separado por unidade; a unidade identifica a origem da venda. A implementação não reserva quantidade exclusiva para cada filial.

Vendas físicas aparecem como **Loja física**, com nome da unidade, pagamento e parcelas. Os indicadores presenciais não somam pedidos de teste do site. O resultado presencial deduz custos, taxas informadas e todas as despesas cadastradas, antes de impostos. Parcelamento registra o acordo com a maquininha, sem conciliação bancária ou projeção automática de recebíveis físicos.

O botão **Estornar** em uma venda física devolve as peças ao estoque e exclui os valores dos indicadores. A devolução do dinheiro/Pix/cartão é feita fora do sistema e precisa ser conferida pela equipe; nenhum reembolso é enviado à maquininha. O estorno não emite documento fiscal nem fiscaliza devoluções. O sistema registra operação interna, não cobra cartão, não envia Pix e não emite nota fiscal.

A atualização adiciona somente colunas `channel` e `location` ao histórico de pedidos, preservando pedidos, preços, custos e estoque existentes. Pedidos antigos são classificados como online. Testes de migração, concorrência entre checkout/POS, idempotência, pagamento manual, custo histórico e estorno usam bancos descartáveis.

## Mercadorias: cadastro, fotos e reposição

A gestão tem abas **Venda presencial**, **Mercadorias**, **Vendas e financeiro** e **Pagamento online**. Em Mercadorias:

- **Cadastrar mercadoria:** nome, categoria, descrição, preço de venda, custo unitário, foto opcional, cor de referência e até 12 tamanhos personalizados com quantidades iniciais. Tamanhos são separados por vírgulas (ex.: PP, P, M ou 36, 38). Uma mesma tentativa de cadastro não duplica a peça.
- **Fotos:** JPG, PNG ou WebP de até 10 MB são otimizadas no navegador, mantendo proporções e convertendo para JPEG com fundo branco. O servidor valida formato e limita o arquivo persistido a 512 KB. A foto fica no Turso; não depende do disco temporário da Render. Imagens ocupam a franquia do plano do banco. Sem foto, o site usa a ilustração da categoria.
- **Entrada de mercadorias:** selecione produto e tamanho, quantidade recebida e motivo. A entrada é somada ao saldo em transação, sem sobrescrever uma venda simultânea. Repetir a mesma tentativa não duplica o saldo. As últimas 50 entradas ficam disponíveis no painel.
- **Editar mercadoria:** altera nome, categoria, descrição, foto, cor, preço, custo e habilitação das compras online. O saldo por tamanho é somente leitura; novas peças devem entrar pelo formulário de reposição. Alterar custo ou preço não modifica os valores de vendas anteriores.

Novos cadastros ficam automaticamente disponíveis no balcão e no catálogo do site. Sem habilitar compras, aparecem em apresentação (“Em breve”) e não podem ser comprados online. A venda presencial continua possível se houver estoque. O cliente não recebe os custos de aquisição nos endpoints públicos. Produtos não são excluídos pelo painel, preservando o histórico.

A atualização adiciona metadados aos produtos e uma tabela de entradas, preservando os preços, custos, estoques e pedidos existentes. A inicialização não recria nem zera cadastros. Teste de interface completo: `node tests/merchandise-ui.cjs`, com banco descartável e dados fictícios.

## Sincronização da vitrine

Após salvar preço/cadastro ou registrar venda/reposição no financeiro, abas abertas da loja no mesmo navegador recebem uma notificação sem dados privados e buscam os dados atuais. Em outros dispositivos, a vitrine consulta uma revisão opaca a cada 15 segundos enquanto estiver visível, e também ao voltar para a aba. O catálogo com fotos só é baixado novamente quando a revisão muda. Preço na sacola, no card e no detalhe aberto são atualizados sem recarregar o documento; tamanho selecionado é preservado quando ainda disponível.

A sincronização se aplica à loja hospedada na Render e conectada ao banco. A demonstração independente do GitHub Pages mantém seus próprios dados fictícios. Custo de aquisição é privado e não altera o preço de venda. Alterações no cadastro precisam ser confirmadas pelo botão Salvar mercadoria.

Teste específico: `node tests/catalog-sync.cjs`, com bancos e credenciais locais descartáveis. Cobre mudanças entre abas, mudanças externas sem notificação local, novo produto, reposição, sacola/modal e economia de consultas sem alterações.


## Pagamento real (ativação explícita)

Na Render, no serviço da loja, configure `MP_MODE=production`, `MP_ACCESS_TOKEN` com o Access Token de **produção** da aplicação, `MP_COLLECTOR_ID` com o ID da conta vendedora real e `MP_WEBHOOK_SECRET` com a assinatura da configuração de Webhooks de **produção**. Configure o evento Pagamentos para `https://site-fab-loja-1.onrender.com/api/mercadopago/webhook` no ambiente de produção e salve com redeploy. Nunca envie essas chaves em mensagens.

Sem MP_MODE, o padrão é sandbox. Valores diferentes de sandbox/production impedem a inicialização. A produção usa init_point HTTPS do domínio www.mercadopago.com.br, verifica a conta antes de reservar e recusa contas identificadas como test_user. Cada pedido guarda seu modo; os anteriores permanecem sandbox. O webhook exige live_mode correspondente ao pedido, inclusive após mudança de configuração. Não reutilizar identificadores de checkout entre modos.

Após o deploy, verifique o aviso de pagamentos reais na gestão e o botão Pagar com Mercado Pago na sacola. Faça a compra de baixo valor com um comprador diferente da conta vendedora. O pagamento é real e pode ter taxas e valor mínimo conforme o meio escolhido. Confira o pedido Pago e o recebimento no Mercado Pago; o retorno à loja não confirma pagamento. Se precisar devolver, faça o reembolso no Mercado Pago e confira a atualização. Não libere reserva manualmente sem conferir o provedor. Frete não está calculado; a sacola informa retirada a combinar com a loja.

Os testes automatizados cobrem produção com provedor substituto; nenhuma cobrança real foi feita por eles. O painel financeiro exibe vendas online reais e de teste separadamente; resultado presencial continua exclusivo das lojas físicas.


## Confirmação de Pix

O webhook consulta o pagamento na API e só confirma status approved com conta, valor, moeda, referência e modo correspondentes. Pix (payment_method_id=pix, payment_type_id=bank_transfer) sem parcelas ou com 0 é registrado como Pix, 1x. Cartões mantêm a validação de 1 a 6 parcelas.

Em Vendas e financeiro, o botão **Conferir pagamento** consulta o Mercado Pago pelo pedido e busca cada pagamento por ID antes de aplicar as mesmas validações do webhook. A rota exige sessão da equipe e mesma origem; não existe confirmação manual de recebimento online. Sem pagamento registrado/aprovado, o pedido continua Reservado. A consulta não cria cobranças. Pedidos de outro modo não são conciliados com as credenciais atuais. Ainda é necessária uma compra real para comprovar a integração na conta.


## Confirmação para o cliente

Novos checkouts retornam à loja com referência privada do pedido no fragmento da URL. A loja remove esse fragmento da barra de endereço e mantém o acompanhamento na sessão do navegador. O cliente vê Aguardando confirmação, Pagamento confirmado ou Pagamento estornado, com valor e identificação curta. A consulta a cada 10 segundos (até 15 minutos em primeiro plano, ou botão Verificar pagamento) lê somente o status validado no banco. Não confirma pelo parâmetro status/retorno do Mercado Pago e não expõe custo, dados pessoais ou credenciais. A referência privada permite apenas consultar aquele pedido e deve ser tratada como privada. Pedidos iniciados antes desta funcionalidade não têm acompanhamento no navegador; a equipe pode conferir no financeiro.

A tela é da loja, não modifica a interface hospedada pelo Mercado Pago. Após pagar Pix, o cliente deve voltar à loja no mesmo navegador; o aviso na sacola orienta esse retorno. Webhook e Conferir pagamento na gestão atualizam o mesmo pedido. Teste de navegador: node tests/customer-status.cjs, sem cobrança real.


## Fotos e galeria dos produtos

Na gestão → Mercadorias, o cadastro e a edição aceitam uma foto principal e até cinco adicionais. Selecione várias em Mais fotos do produto, confira as prévias e salve a mercadoria. As adicionais podem ser removidas individualmente. JPG/PNG/WebP de até 10 MB por arquivo são otimizadas no navegador; o servidor valida cada imagem final até 512 KB e permite até cinco adicionais. Limite JSON das rotas de cadastro/edição: 4,4 MB. Campos images são persistidos como JSON no banco e apresentados como arrays na API; migração aditiva mantém a imagem existente e o estoque. Clientes antigos que omitem images preservam as fotos extras.

Na loja, cards com fotos adicionais indicam a quantidade e o modal exibe miniaturas clicáveis, contador e imagem em destaque. Produtos sem fotos mantêm a ilustração existente. Nenhuma foto real de produto é inventada: a equipe deve enviá-las pela gestão. Verificação: npm test e node tests/gallery-ui.cjs (fixtures locais, sem alterar catálogo publicado).


## Publicar e retirar mercadorias em lote

Gestão → Mercadorias → Mercadorias cadastradas: marque as caixas dos produtos, ou use Selecionar resultados da busca/filtro atual. Publicar selecionadas coloca as mercadorias na vitrine e habilita compras nos tamanhos com saldo; Retirar do site esconde a mercadoria e impede novos checkouts online. Seleções são mantidas ao trocar filtros e o contador inclui todas as selecionadas; Limpar seleção desmarca todas. A ação vale para o produto inteiro, não para unidades/tamanhos específicos.

A rota protegida POST /api/admin/publication recebe ids (1–500 distintos) e published booleano. Valida a existência de todos, atualiza somente published/active e registra auditoria em uma transação; preços, custos, fotos, estoque, pedidos e vendas presenciais são preservados. Migração published=1 preserva a vitrine existente. O checkbox antigo de edição continua controlando compras: ao habilitar, republica o produto; desabilitar sozinho mantém apresentação se já visível. Use Retirar do site para ocultar.

O formulário de lote atualiza a lista sem baixar novamente todas as fotos. A vitrine recebe aviso imediato em abas do mesmo navegador; outros navegadores consultam revisão a cada 15 segundos em primeiro plano, além de ao voltar à aba. Itens retirados são removidos da sacola local e o modal de uma peça retirada fecha. Reservas e pagamentos anteriores continuam válidos e precisam ser tratados pelo fluxo normal. Teste: node tests/publication-ui.cjs.
