// O endereço público antigo leva à loja conectada ao financeiro.
if(location.hostname==='planoaadm2-prog.github.io'&&['/Site-fab-loja/','/Site-fab-loja/index.html'].includes(location.pathname)){
  location.replace('https://site-fab-loja-1.onrender.com/'+location.hash);
}
