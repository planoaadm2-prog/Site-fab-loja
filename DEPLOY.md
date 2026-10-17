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

## Configurar o Mercado Pago

Na aplicação de testes da conta Mercado Pago, configure as notificações de **pagamentos** para:

```text
https://SEU-ENDERECO-NA-RENDER/api/mercadopago/webhook
```

Use a chave secreta da configuração de Webhooks em `MP_WEBHOOK_SECRET`, e a conta vendedora/compradora de teste conforme as instruções atuais do Mercado Pago. O servidor usa `sandbox_init_point`, limita o checkout a até 6 parcelas e aceita confirmações apenas com `live_mode: false`. A definição comercial de parcelamento/juros depende das condições configuradas na conta; esta versão não promete crédito sem juros na operação do provedor.

As notificações são validadas por HMAC (`x-signature`, `x-request-id`, `data.id`) com tolerância de 10 minutos. A confirmação é consultada novamente na API oficial; conta recebedora, moeda, referência, valor e modo de teste são conferidos. Não há confiança no retorno do navegador. A integração **ainda precisa de homologação ponta a ponta com as credenciais da conta**; os testes automatizados usam um provedor substituto, não fazem uma compra no Mercado Pago.

## Como funciona o estoque

O servidor calcula preços e custos, reserva peças em uma transação no banco Turso/libSQL ao iniciar o checkout e impede estoque negativo. A notificação de aprovação transforma a reserva em venda. Reenvios do mesmo pagamento não duplicam a baixa. Reembolso integral confirmado devolve estoque uma única vez. Reembolso parcial, contestação, frete e expedição não estão implementados.

Reservas não são liberadas automaticamente: timeout, abandono e pagamento recusado podem ser seguidos de uma tentativa posterior no mesmo checkout. Liberar essas peças sem conciliar o provedor pode causar venda duplicada. Pedidos reservados ficam visíveis na gestão e precisam de conferência. **Antes de ativar pagamentos reais, implementar e homologar expiração/cancelamento com conciliação e tratamento de contestação/reembolso parcial.** Não ajustar o estoque disponível para compensar reservas sem essa conferência.

## Antes do lançamento comercial

Esta entrega é infraestrutura para homologação, com pagamentos reais bloqueados. Ainda são necessários: homologação do checkout e Webhook na conta, conciliação e ciclo completo das reservas, condições de frete/retirada, políticas comerciais e de privacidade, fotos/dados reais do catálogo, estratégia de backup/exportação e teste de restauração do banco. A equipe precisa validar as condições de taxas e parcelamento na conta Mercado Pago. O financeiro registra taxas retornadas no pagamento; saldo disponível e datas de recebimento devem ser conciliados com os relatórios do provedor.

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
