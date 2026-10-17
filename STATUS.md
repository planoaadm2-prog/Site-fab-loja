# Ponto de retomada

## Endereços

- Loja com servidor: https://site-fab-loja-1.onrender.com/
- Gestão protegida: https://site-fab-loja-1.onrender.com/gestao
- Demonstração independente: https://planoaadm2-prog.github.io/Site-fab-loja/

## Salvo e implementado

Identidade da Virtuosa Beach (logo azul e dourado), layout responsivo, categorias destacadas, busca, sacola, vitrine original também na Render, gestão com senha, banco Turso, preços/custos/estoque, despesas, reserva de peças e integração Mercado Pago em homologação. Produtos não publicados continuam visíveis como “Em breve”, sem inventar estoque. Dados reais do servidor e dados locais da demonstração são separados. Não existem credenciais neste documento.

## Pendência principal: Mercado Pago

O último resultado enviado pela pessoa usuária confirmou a presença de MP_ACCESS_TOKEN, MP_COLLECTOR_ID e MP_WEBHOOK_SECRET, mas a consulta de autenticação foi recusada pela API (401 ou 403). A causa exata ainda não foi validada. Não declarar token, conta ou webhook válidos. Retomar pela seção “Verificar conexão Mercado Pago” na gestão, com as credenciais de teste configuradas apenas na Render. Não solicitar valores em chat. A conta correspondente e o webhook ainda precisam ser homologados com uma compra de teste. Pagamentos reais continuam bloqueados.

## Antes de operação comercial

Revisar fotos e dados reais do catálogo, frete/retirada, políticas, conciliação e expiração/cancelamento de reservas, reembolso parcial, contestação e backup. Consultar DEPLOY.md. Render e Turso estão configurados para seus planos gratuitos, sujeitos a limites; não criar recursos pagos sem autorização.

## Validação

`npm test` para servidor; `node tests/production-ui.cjs` para gestão/vitrine conectada; `node tests/demo.cjs` para a demonstração. Testes usam banco descartável, provedor substituto e dados fictícios. Não executam cobrança no Mercado Pago. Playwright e Chromium são fornecidos pelo ambiente de desenvolvimento.

## Venda presencial adicionada

A gestão possui um balcão para dinheiro/Pix/débito/crédito (até 12 parcelas), identificação da unidade, taxa informada em reais, troco, carrinho por tamanho e confirmação de recebimento pela equipe. Registra a venda e baixa estoque em transação; estorno físico devolve estoque sem executar reembolso bancário. Independe de Mercado Pago. Origem física e site de teste ficam distintas no histórico e nos indicadores. O estoque segue compartilhado entre todas as unidades e o site. Nenhuma venda real é criada pelos testes automatizados; usam banco descartável.

## Aba Mercadorias

Cadastro de produtos agora persistido no banco: nome, categoria, descrição, preço, custo, foto otimizada, cor e tamanhos/estoque inicial. Reposição incremental por tamanho com histórico e chave contra duplicação. Edição de metadados/preços/custos sem sobrescrever estoque ou vendas anteriores. Catálogo do site e balcão leem os novos produtos do servidor; não ficam mais limitados à lista estática original. Gestão organizada em quatro abas. Fotos ficam no banco, sem disco pago. Validar com `npm test` e `node tests/merchandise-ui.cjs`; testes não criam produtos na loja real.
