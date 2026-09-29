// Diagnóstico: tempo de cada etapa do renderTudo antes e depois de carregar grupos de fonte.
const XLSX=require('xlsx');
const { carregar }=require('./carregar');
const t0=Date.now();
carregar().then(async win=>{
  console.log('carga',Math.round((Date.now()-t0)/1000));
  const etapas=win.eval(`[['resumo',renderResumoImport],['painel',renderPainel],['prepararFiltros',prepararFiltros],['previa',renderPrevia],
    ['diag',renderDiagnostico],['filtrosAD',prepararFiltrosAntesDepois],['universo',renderUniverso],['regras',renderRegrasAplicadas],
    ['qualidade',renderQualidade],['saldo',renderSaldo],['filtrosSan',prepararFiltrosSaneamento],['saneamento',renderSaneamento],
    ['antesDepois',renderAntesDepois],['fase2',renderFase2],['export',renderExportacoes],['selo',atualizarSelo],['graficos',desenharGraficos],
    ['cabecalhos',prepararCabecalhos]]`);
  const rodar=async rot=>{ for(const [n,f] of etapas){ process.stdout.write(rot+' '+n+'… '); const t=Date.now(); f(); console.log((Date.now()-t)+' ms');
    await new Promise(r=>setTimeout(r,50)); } };
  await rodar('antes');
  const fontes=win.fontesDaBase(), tes=fontes.filter(f=>/Tesouro/i.test(f));
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['CÓDIGO','DESCRIÇÃO'],['TES','Tesouro']]),'GRUPOS');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['CÓDIGO','DESCRIÇÃO','GRUPO','FONTE NA BASE']].concat(tes.map(f=>[win.codigoFonte(f),win.descricaoFonte(f),'TES',f]))),'FONTES');
  win.eval('renderTudo=function(){ console.log("(renderTudo suprimido)"); }');
  await win.importarGruposFonte(new win.File([XLSX.write(wb,{type:'buffer',bookType:'xlsx'})],'g.xlsx'));
  console.log('importado', win.temGruposFonte());
  await rodar('depois');
  console.log('FIM'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
