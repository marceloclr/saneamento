// Visão Geral em página única (backlog itens 3 e 7): índice fixo, faixa-resumo e
// Indícios de programação dentro da grade de saldos. Uso: node teste_indice_panorama.js
const { carregar }=require('./carregar');
const ok=c=>c?'OK':'FALHOU';

carregar().then(async win=>{
  const doc=win.document, R={};
  win.irParaAba('visao');
  await new Promise(r=>setTimeout(r,300));

  /* ---------- estrutura ---------- */
  const prog=doc.getElementById('seg-programacao');
  R.estrutura={ semSegmentos:!doc.getElementById('segPanorama'),
    progNoSaldo:!!prog && prog.closest('.bloco')===doc.getElementById('seg-saldo'),
    titulo:prog && prog.querySelector('h3').textContent,
    exportarNoSub:!!prog && !!prog.querySelector('#btnExportarProgramacao'),
    regras:!!doc.getElementById('seg-regras') };
  R.estrutura.ok=ok(R.estrutura.semSegmentos && R.estrutura.progNoSaldo && R.estrutura.titulo==='Indícios de programação' &&
    R.estrutura.exportarNoSub && R.estrutura.regras);

  /* ---------- índice ---------- */
  const links=[...doc.querySelectorAll('#indicePanorama [data-alvo]')];
  R.indice={ total:links.length,
    semAlvo:links.filter(a=>!doc.getElementById(a.getAttribute('data-alvo'))).map(a=>a.textContent),
    ocultos:links.filter(a=>a.classList.contains('oculto')).map(a=>a.textContent),
    ativo:(doc.querySelector('#indicePanorama a.ativo')||{}).textContent };
  R.indice.ok=ok(R.indice.total===8 && !R.indice.semAlvo.length && !R.indice.ocultos.length && !!R.indice.ativo);

  /* clique em bloco recolhido abre o bloco */
  const uni=doc.getElementById('seg-universo');
  const antes=uni.classList.contains('recolhido');
  doc.querySelector('#indicePanorama [data-alvo="seg-universo"]').click();
  R.clique={ estavaRecolhido:antes, abriu:!uni.classList.contains('recolhido') };
  R.clique.ok=ok(R.clique.abriu);

  /* ---------- faixa-resumo ---------- */
  const U=win.diagPanorama().noUniverso, S=win.sobreviventes(U), Rt=win.retirados(U);
  const faixa=doc.getElementById('faixaResumo');
  const txt=faixa.textContent.replace(/\s+/g,' ');
  R.faixa={ visivel:!faixa.classList.contains('oculto'), texto:txt,
    soma:U.length===S.length+Rt.length };
  R.faixa.ok=ok(R.faixa.visivel && R.faixa.soma && txt.includes('Universo '+win.n(U.length)) &&
    txt.includes('Sobreviventes '+win.n(S.length)) && txt.includes('Retirados '+win.n(Rt.length)));

  /* destinos antigos da apresentação continuam válidos */
  win.irParaDestino(['panorama','programacao']); win.irParaDestino(['panorama','regras']);
  R.erros=win.__erros.slice(0,5);
  R.ok=ok([R.estrutura,R.indice,R.clique,R.faixa].every(x=>x.ok==='OK') && !win.__erros.length);
  console.log(JSON.stringify(R,null,1));
  process.exit(R.ok==='OK'?0:1);
});
