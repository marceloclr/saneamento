// Versão simplificada — grupos de fonte e seleção de colunas (etapa 7 do plano grupos-fonte-e-colunas):
// grupos embutidos, Grupo → Fonte na etapa 2 e na base saneada, colunas nas 5 tabelas, exportação que
// segue filtros e colunas da grade, e carga da planilha do usuário.
const fs=require('fs'), path=require('path');
const { carregar }=require('./carregar');
const ok=c=>c?'OK':'FALHOU';

carregar('simplificado/index.html').then(async win=>{
  const E=win.eval('E'), M=win.eval('MULTIS'), doc=win.document, R={};
  const marcar=(id,v)=>{ M[id].escolha=new Set(v); win.aplicarMulti(id); };
  const fontes=win.fontesDaBase(), cogerf=fontes.filter(f=>win.grupoDaFonte(f)==='FONTES COGERF');

  /* ---------- grupos embutidos e filtros ---------- */
  R.grupos={ vigentes:!!win.gruposVigentes(), opcoes:win.opcoesGrupoFonte().map(p=>p[0]).join(','), cogerf:cogerf.length,
    fGrupoAntesDeFonte:(()=>{ const a=doc.getElementById('fGrupoFonte'), b=doc.getElementById('fFonte'); return !!(a&&b&&(a.compareDocumentPosition(b)&4)); })(),
    bsGrupoAntesDeFonte:(()=>{ const a=doc.getElementById('bsGrupoFonte'), b=doc.getElementById('bsFonte'); return !!(a&&b&&(a.compareDocumentPosition(b)&4)); })(),
    habilitado:!M.fGrupoFonte.bt.disabled };
  R.grupos.ok=ok(R.grupos.vigentes && R.grupos.opcoes==='FONTES COGERF,OUTRAS FONTES' && cogerf.length===32 &&
    R.grupos.fGrupoAntesDeFonte && R.grupos.bsGrupoAntesDeFonte && R.grupos.habilitado);

  /* ---------- equivalência grupo × fontes marcadas ---------- */
  const eqv=(idG,idF,medir)=>{
    const sem=medir(); marcar(idG,['FONTES COGERF']);
    const cascata=M[idF].lista.length>0 && M[idF].lista.every(p=>win.grupoDaFonte(p[0])==='FONTES COGERF');
    const porGrupo=medir(); marcar(idG,[]);
    marcar(idF,cogerf.filter(f=>M[idF].lista.some(p=>p[0]===f))); const porFonte=medir(); marcar(idF,[]);
    return { sem, porGrupo, porFonte, cascata, ok:ok(porGrupo===porFonte && porGrupo!==sem && cascata) };
  };
  win.renderSaneada();
  R.equivalencia={
    etapa2:eqv('fGrupoFonte','fFonte',()=>String(win.filtrar().length)),
    baseSaneada:eqv('bsGrupoFonte','bsFonte',()=>String(win.filtrarSaneada().length)) };

  /* ---------- colunas nas 5 tabelas ---------- */
  R.colunas={};
  for(const id of win.eval('TABELAS_COLUNAS')){
    const tab=doc.getElementById(id); win.aplicarColunas(tab);
    const cols=win.colunasDaTabela(tab), alvo=cols.findIndex(c=>!c.fixa);
    const botao=!!doc.querySelector('.cols-bt[data-cols="'+id+'"]');
    const mapp=cols.find(c=>/^(MAPP|CODIGO)\b/.test(c.chave)), prov=cols.find(c=>c.chave==='PROVIDENCIA');
    if(alvo<0){ R.colunas[id]={ colunas:cols.length, botao, ok:ok(botao) }; continue; }
    E.colunasOcultas[id]=new Set([cols[alvo].chave]); win.aplicarColunas(tab);
    const cab=tab.tHead.rows[tab.tHead.rows.length-1].cells[alvo];
    R.colunas[id]={ colunas:cols.length, oculta:cols[alvo].rot, cabecalhoOculto:cab.classList.contains('col-oculta'), botao,
      mappFixa:!mapp||mapp.fixa, providenciaFixa:!prov||prov.fixa };
    R.colunas[id].ok=ok(botao && R.colunas[id].cabecalhoOculto && R.colunas[id].mappFixa && R.colunas[id].providenciaFixa);
    E.colunasOcultas[id]=new Set(); win.aplicarColunas(tab);
  }

  /* ---------- exportação da base saneada: filtros e colunas da grade ---------- */
  let capt=null; win.XLSX.writeFile=(wb,nome)=>{ capt={wb,nome}; };
  marcar('bsGrupoFonte',['FONTES COGERF']);
  win.renderGradeSaneada();
  const tS=doc.getElementById('tabSaneada'); const cS=win.colunasDaTabela(tS);
  E.colunasOcultas.tabSaneada=new Set([cS.find(c=>c.chave==='ORGAO').chave, cS.find(c=>c.chave==='REGRA').chave]); win.aplicarColunas(tS);
  const esperados=win.filtrarSaneada().length;
  await win.exportarResultadoFinal();
  const XLSX=require('xlsx');
  const aba=n=>capt&&capt.wb.Sheets[n]?XLSX.utils.sheet_to_json(capt.wb.Sheets[n]):[];
  const res=aba('RESULTADO DO SANEAMENTO'), par=aba('PARAMETROS');
  const filtros=(par.find(l=>/Filtros aplicados/.test(l.ITEM))||{}).VALOR;
  R.exportacao={ abas:capt&&capt.wb.SheetNames.join(','), linhas:res.length, esperados,
    semOrgao:!!res[0] && !('ÓRGÃO' in res[0]), semRegra:!!res[0] && !('REGRAS ATENDIDAS' in res[0]), temSaldo:!!res[0] && ('SALDO DO PROGRAMADO' in res[0]),
    filtros, colunas:(par.find(l=>/Colunas ocultas em MAPPs/.test(l.ITEM))||{}).VALOR };
  R.exportacao.ok=ok(res.length===esperados && esperados>0 && R.exportacao.semOrgao && R.exportacao.semRegra && R.exportacao.temSaldo &&
    /grupo de fonte: FONTES COGERF/.test(filtros||'') && /COLUNAS OCULTAS/.test(R.exportacao.abas||'') && /PARAMETROS/.test(R.exportacao.abas||''));
  marcar('bsGrupoFonte',[]); E.colunasOcultas.tabSaneada=new Set();

  /* ---------- carga da planilha do usuário ---------- */
  const arq=path.join(__dirname,'..','modelos','grupos-fontes.xlsx');
  await win.importarGruposFonte(new win.File([fs.readFileSync(arq)],'grupos-fontes.xlsx'));
  const c=win.eval('E._critGF');
  R.carga={ erros:c.erros, avisos:c.avisos.length, doUpload:!!E.gruposFonte, estado:doc.getElementById('gfEstado').textContent };
  R.carga.ok=ok(!c.erros.length && R.carga.doUpload && /planilha/.test(R.carga.estado));

  R.erros=win.__erros.slice(0,5);
  console.log(JSON.stringify(R,null,1));
  console.log('FIM simplificado-grupos-colunas'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
