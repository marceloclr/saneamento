// Contratos de Gestão (plano contratos-de-gestao): varredura do título de todos os MAPPs,
// marcação manual, remoção e restauração, sessão, exportação — e a invariante de que a
// marcação não interfere no saneamento. Uso: node teste_contratos_gestao.js
const { carregar }=require('./carregar');
const ok=c=>c?'OK':'FALHOU';

carregar().then(async win=>{
  const E=win.eval('E'), doc=win.document, R={};
  const achar=(org,cod)=>E.mapps.find(m=>m.orgao===org && m.codigo===cod);
  const retrato=()=>{ const t=win.totaisNP(win.sobreviventes());
    return JSON.stringify({ s:win.sobreviventes().length, np:Math.round(t.np), p27:Math.round(t.p27),
      regras:['1a','1b','1.2','1.3'].map(r=>E.diag.regras[r].length), exc:win.excluidos().length }); };
  const antes=retrato();

  /* ---------- identificação automática ---------- */
  const auto=win.listaCG();
  const ref=[['SDA','758'],['SCIDADES','4597'],['SEPLAG','313'],['SECULT','749'],['FEC','649'],['SDA','1072']];
  const cgdt=E.mapps.filter(m=>/CGDT/i.test(m.titulo) && !/CONTRATO DE GEST/.test(win.norm(m.titulo)));
  R.auto={ total:auto.length, orgaos:new Set(auto.map(m=>m.orgao)).size,
    referencia:ref.map(([o,c])=>{ const m=achar(o,c); return o+' '+c+':'+(m?win.ehCG(m):'ausente'); }),
    cgdtSemMencao:cgdt.map(m=>m.orgao+' '+m.codigo+':'+win.ehCG(m)),
    trecho:win.mencionaCG('Apoio ao Programa Garantia Safra (C.G - SDA).'),
    falsos:['COGERH adutora','CGDT suporte','ICG 10','CGE auditoria'].map(t=>win.mencionaCG(t)).filter(Boolean) };
  R.auto.ok=ok(R.auto.total===42 && R.auto.orgaos===12 && R.auto.referencia.every(x=>/:true$/.test(x)) &&
    R.auto.cgdtSemMencao.every(x=>/:false$/.test(x)) && R.auto.trecho==='C.G' && !R.auto.falsos.length);

  /* ---------- tela ---------- */
  win.renderContratos();
  const linhas=()=>doc.querySelectorAll('#tabContratos tbody tr[data-chave]').length;
  R.tela={ linhas:linhas(), cartao:doc.querySelector('#cartoesContratos').textContent.replace(/\s+/g,' ').slice(0,80) };
  doc.getElementById('cgBusca').value='SEPLAG'; win.renderContratos();
  R.tela.buscaSeplag=linhas();
  doc.getElementById('cgBusca').value=''; win.renderContratos();
  R.tela.ok=ok(R.tela.linhas===42 && R.tela.buscaSeplag===2);

  /* ---------- marcar manual, remover automático, restaurar ---------- */
  const manual=E.mapps.find(m=>!win.ehCG(m) && m.dentroUniverso);
  const alvo=achar('SDA','758');
  doc.getElementById('cgProcura').value=manual.orgao+' '+manual.codigo; win.renderProcuraCG();
  const botao=Array.from(doc.querySelectorAll('#cgResultados [data-cg-marcar]')).find(b=>b.getAttribute('data-cg-marcar')===manual.chave);
  if(botao) botao.click();
  doc.querySelector('#tabContratos [data-cg-remover="'+alvo.chave.replace(/"/g,'\\"')+'"]').click();
  R.marcacao={ achouNaProcura:!!botao, manual:win.ehCG(manual), origem:win.origemCG(manual), removido:win.ehCG(alvo),
    total:win.listaCG().length, removidos:win.listaCGRemovidos().length, linhas:linhas(),
    linhasRemovidas:doc.querySelectorAll('#tabContratosRemovidos tbody tr').length,
    exportacao:win.conjuntos().find(c=>c.id==='contratos').contagem(), semInterferencia:retrato()===antes };
  R.marcacao.ok=ok(R.marcacao.achouNaProcura && R.marcacao.manual && R.marcacao.origem==='Manual' && !R.marcacao.removido &&
    R.marcacao.total===42 && R.marcacao.removidos===1 && R.marcacao.linhas===42 && R.marcacao.linhasRemovidas===1 &&
    R.marcacao.exportacao===42 && R.marcacao.semInterferencia);

  /* ---------- linhas da exportação ---------- */
  const lcg=win.linhasCG(), lm=lcg.find(l=>l['MAPP']===manual.codigo && l['ÓRGÃO']===manual.orgao);
  const par=win.linhasParametrosResultado([]).filter(l=>/C\.G\.|CONTRATOS DE GESTAO/.test(l.ITEM));
  R.export={ linhas:lcg.length, colunas:Object.keys(lcg[0]).slice(-3), manual:lm&&lm['ORIGEM DA MARCAÇÃO'],
    semAlvo:!lcg.some(l=>l['MAPP']==='758'&&l['ÓRGÃO']==='SDA'), parametros:par.length };
  R.export.ok=ok(R.export.linhas===42 && R.export.colunas.join('|')==='ORIGEM DA MARCAÇÃO|TRECHO IDENTIFICADO|SITUAÇÃO NO SANEAMENTO' &&
    R.export.manual==='Manual' && R.export.semAlvo && R.export.parametros>=2);

  /* ---------- sessão: ida e volta, e sessão antiga sem cg ---------- */
  const sess=JSON.parse(JSON.stringify(win.montarSessao('teste')));
  win.eval('E.cg={incluidos:{},removidos:{}}'); win.calcularCG();
  const zerado=win.listaCG().length;
  win.aplicarSessao(sess,'arquivo');
  const E2=win.eval('E');
  R.sessao={ zerado, total:win.listaCG().length, manual:win.ehCG(manual), removido:win.ehCG(alvo) };
  delete sess.cg; win.aplicarSessao(sess,'arquivo');
  R.sessao.antiga=win.listaCG().length; R.sessao.cgAntiga=JSON.stringify(E2.cg);
  R.sessao.ok=ok(zerado===42 && R.sessao.total===42 && R.sessao.manual && !R.sessao.removido &&
    R.sessao.antiga===42 && R.sessao.cgAntiga==='{"incluidos":{},"removidos":{}}');

  /* ---------- restaurar ---------- */
  win.marcarCG(alvo.chave); win.desmarcarCG(manual.chave);
  R.restaurar={ alvo:win.ehCG(alvo), manual:win.ehCG(manual), total:win.listaCG().length, semInterferencia:retrato()===antes };
  R.restaurar.ok=ok(R.restaurar.alvo && !R.restaurar.manual && R.restaurar.total===42 && R.restaurar.semInterferencia);

  R.erros=win.__erros.slice(0,5);
  R.geral=ok(['auto','tela','marcacao','export','sessao','restaurar'].every(k=>R[k].ok==='OK') && !R.erros.length);
  console.log(JSON.stringify(R,null,1));
  process.exit(0);
}).catch(e=>{ console.error(e); process.exit(1); });
