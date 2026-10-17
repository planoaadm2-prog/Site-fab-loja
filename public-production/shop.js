/* A mesma vitrine do site, com disponibilidade e preços vindos do servidor. */
(async()=>{
 let inventory=[],paymentReady=false;
 async function refresh(){const response=await fetch('/api/catalog',{cache:'no-store'});if(!response.ok)throw Error('Não foi possível consultar a disponibilidade. Tente novamente.');const data=await response.json();inventory=data.inventory;paymentReady=data.paymentReady;for(const p of products){const row=inventory.find(i=>i.id===p.id);if(row)p.price=row.price/100;}}
 const state=()=>({inventory:Object.fromEntries(products.map(p=>[p.id,{sizes:Object.fromEntries(p.sizes.map(size=>{const row=inventory.find(i=>i.id===p.id&&i.size===size);return[size,row?.active?row.available:0];}))}]))});
 window.Storefront={refresh,ready:()=>paymentReady,label:id=>{const rows=inventory.filter(i=>i.id===id);return !rows.some(i=>i.active)?'Em breve':rows.some(i=>i.available>0)?'Disponível':'Esgotado';},note:id=>inventory.some(i=>i.id===id&&i.active)?'Ilustração provisória. Consulte os tamanhos disponíveis.':'Peça em apresentação. A compra ficará disponível quando a equipe publicar o estoque.'};
 window.DemoStore={read:state,stock:(id,size)=>state().inventory[id]?.sizes[size]||0};
 function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script);});}
 try{await refresh();await loadScript('/storefront.js');await loadScript('/production-checkout.js');}catch(e){const message=document.createElement('p');message.setAttribute('role','alert');message.textContent=e.message||'Falha ao carregar a loja. Atualize a página.';document.querySelector('#products').replaceChildren(message);}
})();
