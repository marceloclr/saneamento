// Diagnóstico: onde renderAntesDepois gasta tempo, com e sem os observadores de colunas.
const { carregar }=require('./carregar');
const t0=Date.now();
const med=(rot,f)=>{ process.stdout.write(rot+'… '); const t=Date.now(); f(); console.log((Date.now()-t)+' ms'); };
carregar().then(async win=>{
  console.log('carga',Math.round((Date.now()-t0)/1000),'s');
  const tabs=win.eval('TABELAS_COLUNAS').map(id=>win.document.getElementById(id)).filter(Boolean);
  tabs.forEach(t=>t._colsObs&&t._colsObs.disconnect());
  console.log('observadores desligados');
  med('apurarAntesDepois',()=>win.apurarAntesDepois());
  med('renderQuadroMapp',()=>win.renderQuadroMapp());
  med('renderAntesDepois',()=>win.renderAntesDepois());
  await new Promise(r=>setTimeout(r,100));
  tabs.forEach(t=>win.vigiarTabela(t));
  console.log('observadores ligados');
  med('renderQuadroMapp',()=>win.renderQuadroMapp());
  await new Promise(r=>setTimeout(r,100));
  med('renderAntesDepois',()=>win.renderAntesDepois());
  console.log('FIM'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
