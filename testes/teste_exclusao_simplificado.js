// Excluir pelo usuário na versão simplificada, com os MAPPs da SEPA: o excluído entra na base
// saneada como os das regras (com ou sem regra), com a ação "excluído pelo usuário".
const { carregar }=require('./carregar');
const ok=c=>c?'OK':'FALHOU';

carregar('simplificado/index.html').then(async win=>{
  const E=win.eval('E'), doc=win.document, R={};
  const ORG='SEPA';
  const sepa=E.mapps.filter(m=>m.orgao===ORG), porCod=c=>sepa.find(m=>m.codigo===c);
  const cods=l=>l.filter(m=>m.orgao===ORG).map(m=>m.codigo).sort((a,b)=>a-b).join(',');
  const ACAO='EXCLUÍDO PELO USUÁRIO';

  R.inicio={ baseSaneada:cods(win.mantidos()), excluidos:win.excluidos().length };
  R.inicio.ok=ok(R.inicio.baseSaneada==='3,4,5,6,14,17,18,20,21' && R.inicio.excluidos===0);

  /* exclusões pelo caminho do botão, sem diálogo (motivo e responsável já informados) */
  E.motivoExclusao='teste'; E.responsavel='teste'; E.perguntarExclusao=false;
  await win.ocultarMapps([porCod('18').chave],'18');   /* com regra */
  await win.ocultarMapps([porCod('2').chave],'2');     /* sem regra */
  win.renderSaneada();
  win.eval("MULTIS.bsRegra.escolha=new Set(['excluido']); aplicarMulti('bsRegra');");
  const filtrados=win.filtrarSaneada();
  const linhas=win.linhasMapp(win.mantidos().filter(m=>m.orgao===ORG));
  const l2=linhas.find(l=>l.MAPP==='2')||{}, l3=linhas.find(l=>l.MAPP==='3')||{};
  win.abrirFicha(porCod('2').chave);
  R.excluidos={ baseSaneada:cods(win.mantidos()), excluidos:cods(win.excluidos()), filtroExcluido:cods(filtrados),
    acao18:win.acaoSaneada(porCod('18')), acao2:win.acaoSaneada(porCod('2')), acao3:win.acaoSaneada(porCod('3')),
    export2:l2['AÇÃO NA BASE SANEADA']+' / '+l2['SANEAMENTO'], export3:l3['AÇÃO NA BASE SANEADA'],
    fichaBotoes:doc.querySelectorAll('#fichaCorpo button').length,
    fichaAcao:/EXCLUÍDO PELO USUÁRIO/.test(doc.getElementById('fichaCorpo').textContent) };
  R.excluidos.ok=ok(R.excluidos.baseSaneada==='2,3,4,5,6,14,17,18,20,21' && R.excluidos.excluidos==='2,18' &&
    R.excluidos.filtroExcluido==='2,18' && R.excluidos.acao18===ACAO && R.excluidos.acao2===ACAO && R.excluidos.acao3!==ACAO &&
    R.excluidos.export2===ACAO+' / '+ACAO && R.excluidos.export3===porCod('3').d.acao && R.excluidos.fichaBotoes===0 && R.excluidos.fichaAcao);

  /* retornar o 2 (sem regra) tira da base saneada; o 18 segue com a ação da regra */
  win.restabelecerMapps([porCod('2').chave, porCod('18').chave]);
  R.retorno={ baseSaneada:cods(win.mantidos()), acao18:win.acaoSaneada(porCod('18')) };
  R.retorno.ok=ok(R.retorno.baseSaneada==='3,4,5,6,14,17,18,20,21' && R.retorno.acao18===porCod('18').d.acao);

  R.erros=win.__erros.slice(0,5);
  console.log(JSON.stringify(R,null,1));
  console.log('FIM exclusao-simplificado'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
