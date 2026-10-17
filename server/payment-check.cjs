module.exports=async function check(env,provider){
 const checks=[['MP_ACCESS_TOKEN',!!env.MP_ACCESS_TOKEN],['MP_COLLECTOR_ID',!!env.MP_COLLECTOR_ID],['MP_WEBHOOK_SECRET',!!env.MP_WEBHOOK_SECRET]].map(([name,ok])=>({name,ok,message:ok?'Configurado':'Não configurado'}));
 if(!env.MP_ACCESS_TOKEN)return{ok:false,checks,message:'Adicione MP_ACCESS_TOKEN de teste nas variáveis da Render.'};
 try{const account=await provider('/users/me');const valid=account&&/^\d+$/.test(String(account.id));checks.push({name:'Autenticação Mercado Pago',ok:!!valid,message:valid?'Token aceito pela API':'Resposta de conta inesperada'});if(valid&&env.MP_COLLECTOR_ID){const match=String(account.id)===String(env.MP_COLLECTOR_ID).trim();checks.push({name:'Conta vendedora',ok:match,message:match?'Corresponde a MP_COLLECTOR_ID':'MP_COLLECTOR_ID não corresponde à conta do token'});}}
 catch(e){checks.push({name:'Autenticação Mercado Pago',ok:false,message:[401,403].includes(e.providerStatus)?'A API recusou o token ou a permissão. Confira a credencial de teste.':'Não foi possível consultar a API. Verifique a configuração e tente novamente.'});}
 const ok=checks.every(c=>c.ok);return{ok,checks,message:ok?'Conexão e conta verificadas. Ainda é necessário testar o checkout e a assinatura do webhook com uma compra de teste.':'Há pendências na configuração. Nenhuma cobrança foi realizada.'};
};
