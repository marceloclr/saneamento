// Quadro por MAPP: exercícios anteriores a 2027 sem saldo a programar (programado − empenhado = 0
// em todas as linhas) saem do quadro, sem mudar os totais.
const { carregar }=require('./carregar');
const t0=Date.now();
carregar().then(win=>{
  console.log('carga',Math.round((Date.now()-t0)/1000),'s');
  console.log(win.eval(`(function(){
    const perto=(a,b)=>Math.abs(a-b)<0.01;
    const q=linhasQuadroMapp(true), t=totaisNP(sobreviventes());
    let s27=0, sNP=0; q.linhas.forEach(v=>{ s27+=+v[q.c27]||0; sNP+=+v[q.c27+1]||0; });
    const ocultas=new Set(q.anosOcultos);
    const colsOcultas=E.serie.filter(it=>ocultas.has(it.ano));
    const col=(met,ano)=>{ const it=E.serie.find(x=>x.met===met&&x.ano===ano); return it?it.col:null; };
    let comSaldo=0;
    sobreviventes().forEach(m=>(m.linhas||[]).forEach(i=>{ const v=linhaOriginal(E.linhas[i]);
      q.anosOcultos.forEach(a=>{ if(Math.abs((+v[col('Programado',a)]||0)-(+v[col('Empenhado',a)]||0))>=0.005) comSaldo++; }); }));
    const ocultoFuturo=q.anosOcultos.filter(a=>a>=NP_ANO);
    const cabOculto=q.cab.filter(c=>colsOcultas.some(it=>E.colunas[it.col]===c));
    const anosVisiveis=[...new Set(E.serie.map(it=>it.ano))].filter(a=>!ocultas.has(a)).sort();
    const r=linhasQuadroMapp(false);
    renderQuadroMapp();
    return JSON.stringify({
      anosOcultos:faixasTexto(q.anosOcultos), anosVisiveis:anosVisiveis,
      colunas:{ antes:E.colunas.length+1, depois:q.cab.length, removidas:colsOcultas.length },
      cabecalhoSemOcultos:cabOculto.length===0,
      c27:q.cab[q.c27], np:q.cab[q.c27+1],
      larguraOk:q.linhas.every(v=>v.length===q.cab.length),
      somaP27:{ quadro:s27, totais:t.p27, ok:perto(s27,t.p27) },
      somaNP:{ quadro:sNP, totais:t.np, ok:perto(sNP,t.np) },
      linhasComSaldoEmAnoOculto:comSaldo, anosOcultosDe2027EmDiante:ocultoFuturo,
      telaCenario:{ mapps:r.mapps, anosOcultos:faixasTexto(r.anosOcultos) },
      legenda:document.querySelector('#adLegendaMapp').textContent,
      parametro:linhasParametrosResultado(q.anosOcultos).find(l=>/ocultos/.test(l.ITEM)),
      erros:window.__erros.slice(0,5)
    },null,1);
  })()`));
  console.log('FIM anos-ocultos'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
