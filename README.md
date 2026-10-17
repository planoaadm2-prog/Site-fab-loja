# Virtuosa Beach Moda Praia

Primeira versão responsiva da vitrine de moda praia e vestuário, em HTML, CSS e JavaScript sem dependências de build.

## Executar

Na pasta `/workspace/Site-fab-loja`:

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

Valide internamente com `curl --fail http://127.0.0.1:3000/`.

Busca, filtros, seleção de tamanhos e sacola com quantidades funcionam no navegador. A sacola usa armazenamento local; pedidos são simulados localmente e não há processamento de pagamentos reais. Produtos, preços e ilustrações são demonstrativos. Antes da publicação comercial, configurar catálogo real, estoque, contatos, políticas, pagamento e frete.

Fotos editoriais: Unsplash (arquivos locais em `assets`). Ilustrações conceituais de produtos geradas pelo código em `app.js`.

## Demonstração de pagamento e gestão

A loja inclui checkout simulado (Pix, débito e crédito em até 6 parcelas), acessível na sacola. `financeiro.html` é uma área separada para vendas, custos unitários, estoque por tamanho, taxas, despesas, estorno simulado, previsão de parcelas e exportação CSV.

As páginas compartilham o estado `virtuosa-business-demo-v1` em localStorage, com Web Locks para serializar alterações entre abas. Vendas aprovadas reduzem estoque; recusadas não alteram quantidades; estornos devolvem as peças. Custos e taxas ficam registrados no pedido para preservar o histórico. Valores monetários são inteiros em centavos. O resumo exclui recusas e estornos. O estoque inicial é de cinco peças por tamanho, custo de 45% do preço; taxas de exemplo: Pix 0%, débito 1,5%, crédito 3,99% mais 1 ponto percentual por parcela extra. Recebimentos do crédito são projeções a intervalos de 30 dias, sem antecipação.

**Limitações:** demonstração pública sem autenticação. Use apenas dados fictícios. Sem cobrança real, dados de cartão, reserva de estoque, frete, impostos, envio de pedidos ou conciliação. Os dados não são compartilhados entre dispositivos, perfis de navegador ou endereços (localhost e GitHub Pages são separados). Apagar dados do navegador apaga a demonstração. Não lançar informações comerciais reais neste painel público. Para produção, migrar as operações para um servidor autenticado e banco transacional, integrar checkout do provedor e confirmar pagamentos por webhook antes de baixar estoque.

## Validação da demonstração

Com Playwright e Chromium disponíveis no ambiente, execute `node tests/demo.cjs`. O teste inicia e encerra seu próprio servidor Python na porta 3020. Valida recusa, três formas de pagamento, parcelamento, soma dos centavos, taxas, custo histórico, despesas, estorno, persistência, CSV, sincronização entre abas, bloqueio de estoque insuficiente e duplicação de pedidos, e layout móvel. Usa dados isolados em um contexto de navegador descartável. O Chromium esperado está em `/usr/bin/chromium`.

## Servidor e gestão protegida (homologação)

Foi adicionada uma aplicação Node 24 + Turso/libSQL (SQLite local em desenvolvimento), com gestão autenticada e Checkout Pro em **modo de teste**. Ela roda separadamente da demonstração do GitHub Pages. Veja [DEPLOY.md](DEPLOY.md) para implantação gratuita na Render + Turso, variáveis seguras, configuração Mercado Pago, limitações e pendências antes de vendas reais. Execute `npm test` para validar o servidor com banco temporário e provedor substituto.
