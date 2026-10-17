# Servidor protegido + Mercado Pago de teste na Render

O GitHub Pages continua exibindo a demonstração local. Ele **não executa o servidor**. A configuração `render.yaml` cria um serviço Node com disco persistente; a Render cobra pelo serviço e disco conforme o plano escolhido. A criação e a contratação devem ser feitas na conta da loja.

## Preparar na Render

1. Acesse https://dashboard.render.com/ e conecte o repositório `planoaadm2-prog/Site-fab-loja`.
2. Use **New → Blueprint**, selecione o repositório e revise o serviço e o disco de `render.yaml` antes de contratar. Não crie um serviço sem disco persistente para este banco SQLite.
3. Configure as variáveis na área **Environment**, sem colocar valores no GitHub ou em mensagens:

| Variável | O que configurar |
| --- | --- |
| `APP_BASE_URL` | URL HTTPS exata do serviço Render, sem caminho nem barra final. Após criação, use o endereço atribuído pela Render e atualize esta variável. |
| `ADMIN_PASSWORD` | Senha exclusiva e longa para a equipe, com pelo menos 12 caracteres. Não usar as senhas fictícias dos testes. |
| `DATABASE_PATH` | `/var/data/virtuosa.sqlite` (já definido no Blueprint). |
| `MP_ACCESS_TOKEN` | Access Token **de teste** da aplicação Mercado Pago. Nunca colocar no JavaScript público. |
| `MP_WEBHOOK_SECRET` | Chave secreta de assinatura dos Webhooks da aplicação Mercado Pago. |
| `MP_COLLECTOR_ID` | Identificador da conta vendedora de teste correspondente ao token. |

Pode-se inicialmente deixar as variáveis do Mercado Pago vazias: o catálogo e a gestão funcionam, mas o checkout fica indisponível. `ADMIN_PASSWORD` é obrigatória. `APP_BASE_URL` precisa ser corrigida para a URL efetiva antes de usar login e checkout.

4. Publique o serviço e confirme que `/health` responde com `{"ok":true}`.
5. Abra `/gestao`, entre com a senha configurada e preencha preços, custos e estoque real. Os produtos iniciam **desativados e zerados**. As ilustrações ainda são provisórias. Não ativar produtos até revisar também imagens e informações comerciais.

## Configurar o Mercado Pago

Na aplicação de testes da conta Mercado Pago, configure as notificações de **pagamentos** para:

```text
https://SEU-ENDERECO-NA-RENDER/api/mercadopago/webhook
```

Use a chave secreta da configuração de Webhooks em `MP_WEBHOOK_SECRET`, e a conta vendedora/compradora de teste conforme as instruções atuais do Mercado Pago. O servidor usa `sandbox_init_point`, limita o checkout a até 6 parcelas e aceita confirmações apenas com `live_mode: false`. A definição comercial de parcelamento/juros depende das condições configuradas na conta; esta versão não promete crédito sem juros na operação do provedor.

As notificações são validadas por HMAC (`x-signature`, `x-request-id`, `data.id`) com tolerância de 10 minutos. A confirmação é consultada novamente na API oficial; conta recebedora, moeda, referência, valor e modo de teste são conferidos. Não há confiança no retorno do navegador. A integração **ainda precisa de homologação ponta a ponta com as credenciais da conta**; os testes automatizados usam um provedor substituto, não fazem uma compra no Mercado Pago.

## Como funciona o estoque

O servidor calcula preços e custos, reserva peças em transação SQLite ao iniciar o checkout e impede estoque negativo. A notificação de aprovação transforma a reserva em venda. Reenvios do mesmo pagamento não duplicam a baixa. Reembolso integral confirmado devolve estoque uma única vez. Reembolso parcial, contestação, frete e expedição não estão implementados.

Reservas não são liberadas automaticamente: timeout, abandono e pagamento recusado podem ser seguidos de uma tentativa posterior no mesmo checkout. Liberar essas peças sem conciliar o provedor pode causar venda duplicada. Pedidos reservados ficam visíveis na gestão e precisam de conferência. **Antes de ativar pagamentos reais, implementar e homologar expiração/cancelamento com conciliação e tratamento de contestação/reembolso parcial.** Não ajustar o estoque disponível para compensar reservas sem essa conferência.

## Antes do lançamento comercial

Esta entrega é infraestrutura para homologação, com pagamentos reais bloqueados. Ainda são necessários: homologação do checkout e Webhook na conta, conciliação e ciclo completo das reservas, condições de frete/retirada, políticas comerciais e de privacidade, fotos/dados reais do catálogo, estratégia de backup e teste de restauração do disco. A equipe precisa validar as condições de taxas e parcelamento na conta Mercado Pago. O financeiro registra taxas retornadas no pagamento; saldo disponível e datas de recebimento devem ser conciliados com os relatórios do provedor.

A gestão tem senha e sessão HttpOnly/Secure/SameSite, bloqueio por tentativas, verificação de origem e dados privados somente no servidor. Não é um sistema multiusuário com permissões individuais ou recuperação automática de senha. Troque `ADMIN_PASSWORD` no ambiente e reinicie para rotacionar o acesso e invalidar sessões.

## Desenvolvimento e validação

Node 24.5 ou superior. Nenhuma dependência de execução externa:

```sh
npm ci --ignore-scripts
npm test
```

Para testar interface local, configure `ADMIN_PASSWORD` com uma senha de desenvolvimento e `APP_BASE_URL=http://127.0.0.1:3000` somente no seu processo, depois execute `npm start`. Sem as credenciais e HTTPS, o checkout permanecerá desativado. Não use senhas de desenvolvimento na Render.

`npm test` usa banco temporário e provedor substituto. Valida autenticação, CSRF, dados privados, preço calculado no servidor, reserva/idempotência/estoque insuficiente, assinatura de notificação, rejeição de valor/conta/modo incorretos, aprovação, reembolso e persistência.

Faça backup consistente com a API de backup do SQLite (ou com o serviço parado), sem copiar apenas o `.sqlite` durante escrita com WAL. Uma única instância do serviço deve usar este disco. Para múltiplas instâncias, migre para um banco gerenciado como PostgreSQL antes de escalar.
