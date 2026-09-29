// Seleção de colunas: ocultar em cada tabela (thead/tbody/tfoot, colspan), persistência
// após redesenho, colunas fixas, exportações sem as colunas ocultas, Restaurar padrão.
const XLSX=require('xlsx');
const { carregar }=require('./carregar');
const t0=Date.now(), seg=()=>Math.round((Date.now()-t0)/1000);
const ok=c=>c?'OK':'FALHOU';
const quadro=win=>new Promise(r=>win.requestAnimationFrame(()=>setTimeout(r,10)));

carregar(process.argv[2]).then(async win=>{
  console.log('carga',seg(),'s');
  const E=win.eval('E'), R={}, doc=win.document;
  const ocultar=(id,chaves)=>{ E.colunasOcultas[id]=new Set(chaves); win.aplicarColunas(doc.getElementById(id)); };
  const lista=win.eval('TABELAS_COLUNAS');

  /* ---------- cada tabela ---------- */
  R.tabelas={};
  for(const id of lista){
    const tab=doc.getElementById(id);
    if(!tab){ R.tabelas[id]='ausente'; continue; }
    win.aplicarColunas(tab);
    const cols=win.colunasDaTabela(tab), alvo=cols.findIndex(c=>!c.fixa);
    const botao=!!doc.querySelector('.cols-bt[data-cols="'+id+'"]');
    const naoFixas=[cols.find(c=>/^(MAPP|CODIGO)\b/.test(c.chave)), cols.find(c=>c.chave==='PROVIDENCIA')].filter(c=>c&&!c.fixa);
    if(naoFixas.length){ R.tabelas[id]={ identNaoFixa:naoFixas.map(c=>c.rot), ok:'FALHOU' }; continue; }
    if(alvo<0){ R.tabelas[id]={ colunas:cols.length, semOcultavel:true, botao }; continue; }
    ocultar(id,[cols[alvo].chave]);
    let certo=0, errado=0;
    Array.from(tab.rows).forEach(tr=>{
      let pos=0;
      Array.from(tr.cells).forEach(td=>{
        const span=+td.getAttribute('data-cs')||1, cobre=pos<=alvo&&alvo<pos+span;
        if(span===1){ if(cobre===td.classList.contains('col-oculta')) certo++; else errado++; }
        else if(cobre){ if(td.colSpan===span-1) certo++; else errado++; }
        pos+=span;
      });
    });
    const rot=doc.querySelector('.cols-bt[data-cols="'+id+'"] .c');
    R.tabelas[id]={ colunas:cols.length, oculta:cols[alvo].rot, certo, errado, contador:rot&&rot.textContent, ok:ok(errado===0 && certo>0 && botao) };
    ocultar(id,[]);
  }

  /* ---------- persistência após redesenho (Diagnóstico) ---------- */
  const tD=doc.getElementById('tabDiag'), cD=win.colunasDaTabela(tD), orgD=cD.find(c=>/ORGAO/.test(c.chave)&&!c.fixa);
  ocultar('tabDiag',[orgD.chave]);
  win.eval('E.filtro=lerFiltros(); E.ordem.desc=!E.ordem.desc; renderDiagnostico();');
  await quadro(win); await quadro(win);
  const idx=win.colunasDaTabela(tD).findIndex(c=>c.chave===orgD.chave);
  const linha=tD.tBodies[0].rows[0];
  R.persistencia={ coluna:orgD.rot, cabecalhoOculto:tD.tHead.rows[tD.tHead.rows.length-1].cells[idx].classList.contains('col-oculta'),
    celulaOculta:linha.cells[idx].classList.contains('col-oculta') };
  R.persistencia.ok=ok(R.persistencia.cabecalhoOculto && R.persistencia.celulaOculta);

  /* ---------- painel: fixa desabilitada, restaurar ---------- */
  const bt=doc.querySelector('.cols-bt[data-cols="tabDiag"]');
  win.abrirPainelColunas('tabDiag',bt);
  const p=doc.getElementById('painelColunas');
  const fixas=Array.from(p.querySelectorAll('label.fixa input')).every(i=>i.disabled && i.checked);
  const desmarcada=Array.from(p.querySelectorAll('input')).filter(i=>!i.checked).length;
  p.querySelector('[data-cols-padrao]').click();
  R.painel={ fixasDesabilitadas:fixas, desmarcadasAntes:desmarcada, depoisRestaurar:(E.colunasOcultas.tabDiag||new Set()).size,
    fechou:!p.classList.contains('aberto'), ok:ok(fixas && desmarcada===1 && (E.colunasOcultas.tabDiag||new Set()).size===0) };

  /* ---------- exportações ---------- */
  const X={};
  // Diagnóstico (linhasMapp) sem ÓRGÃO
  ocultar('tabDiag',[orgD.chave]);
  const lm=win.colunasExportaveis('tabDiag',win.linhasMapp(win.eval('E.listaFiltrada').slice(0,5)));
  X.diag={ semOrgao:!Object.keys(lm[0]).some(k=>/^ÓRGÃO$/.test(k)), colunas:Object.keys(lm[0]).length };
  ocultar('tabDiag',[]);
  // Saldo sem o ano 2026 e sem NP
  win.renderSaldo(); win.aplicarColunas(doc.getElementById('tabSaldo'));
  const cS=win.colunasDaTabela(doc.getElementById('tabSaldo'));
  ocultar('tabSaldo',[cS.find(c=>c.chave==='2026').chave, cS.find(c=>/NOVO PROGRAMADO/.test(c.chave)).chave]);
  const ls=win.colunasExportaveis('tabSaldo',win.linhasSaldo());
  X.saldo={ sem2026:!Object.keys(ls[0]).some(k=>/2026/.test(k)), semNP:!Object.keys(ls[0]).some(k=>/NOVO PROGRAMADO|^NP —/.test(k)),
    tem2025:Object.keys(ls[0]).some(k=>/2025/.test(k)) };
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(ls),'S'); win.anexarColunasOcultas(wb,['tabSaldo']);
  X.saldo.abaColunas=wb.SheetNames.includes('COLUNAS OCULTAS');
  ocultar('tabSaldo',[]);
  // Quadro por MAPP (matriz)
  win.renderAntesDepois(); win.aplicarColunas(doc.getElementById('tabQuadroMapp'));
  const cQ=win.colunasDaTabela(doc.getElementById('tabQuadroMapp')), fQ=cQ.find(c=>c.chave==='FONTE');
  ocultar('tabQuadroMapp',[fQ.chave]);
  const q=win.linhasQuadroMapp(false), qv=win.colunasExportaveisAoa('tabQuadroMapp',q.cab,q.linhas);
  X.quadro={ antes:q.cab.length, depois:qv.cab.length, semFonte:!qv.cab.includes('FONTE'), larguraOk:qv.linhas.every(l=>l.length===qv.cab.length),
    parametro:(win.linhasParametrosResultado([]).find(l=>/Colunas ocultas/.test(l.ITEM))||{}).VALOR };
  ocultar('tabQuadroMapp',[]);
  R.exportacoes=X;
  R.exportacoes.ok=ok(X.diag.semOrgao && X.saldo.sem2026 && X.saldo.semNP && X.saldo.tem2025 && X.saldo.abaColunas &&
    X.quadro.semFonte && X.quadro.depois===X.quadro.antes-1 && X.quadro.larguraOk && X.quadro.parametro==='FONTE');

  R.erros=win.__erros.slice(0,5);
  console.log(JSON.stringify(R,null,1));
  console.log('FIM colunas'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
