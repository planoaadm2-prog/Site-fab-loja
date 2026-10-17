# Virtuosa Beach Moda Praia

Primeira versão responsiva da vitrine de moda praia e vestuário, em HTML, CSS e JavaScript sem dependências de build.

## Executar

Na pasta `/workspace/Site-fab-loja`:

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

Valide internamente com `curl --fail http://127.0.0.1:3000/`.

Busca, filtros, seleção de tamanhos e sacola com quantidades funcionam no navegador. A sacola usa armazenamento local; não envia pedidos nem processa pagamentos. Produtos, preços e ilustrações são demonstrativos. Antes da publicação comercial, configurar catálogo real, estoque, contatos, políticas, pagamento e frete.

Fotos editoriais: Unsplash (arquivos locais em `assets`). Ilustrações conceituais de produtos geradas pelo código em `app.js`.
