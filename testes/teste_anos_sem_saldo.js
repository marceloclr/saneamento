// Exercícios sem saldo do programado (programado − empenhado = 0 em todos os MAPPs do
// conjunto) não aparecem no Saldo por exercício, na exportação, nas dicas por regra nem na ficha.
const { carregar }=require('./carregar');
const t0=Date.now();
carregar().then(win=>{
  console.log('carga',Math.round((Date.now()-t0)/1000),'s');
  console.log(win.eval(`(function(){
    const perto=(a,b)=>Math.abs(a-b)<0.01;
    const conjuntos={};
    ['universo','sobreviventes','base'].forEach(function(cj){
      $('#saldoConjunto').value=cj; $('#saldoMedida').value='saldo';
      renderSaldo();
      const a=E.saldo, lista=conjuntoSaldo();
      const visiveis=a.per.map(p=>+p.rot);
      const ocultoComSaldo=a.anosSemSaldo.filter(ano=>lista.some(m=>Math.abs(saldoDoAno(m,ano))>=0.005));
      const visivelSemSaldo=visiveis.filter(ano=>!lista.some(m=>Math.abs(saldoDoAno(m,ano))>=0.005));
      const cab=[...document.querySelectorAll('#tabSaldo thead th')].map(th=>th.textContent);
      const cabOculto=cab.filter(c=>a.anosSemSaldo.map(String).indexOf(c)>=0);
      const exp=linhasSaldo()[0]||{};
      const expOculto=Object.keys(exp).filter(k=>a.anosSemSaldo.some(ano=>k.indexOf('EXERC. '+ano)===0));
      let somaSaldoTodos=0; lista.forEach(m=>anosExec().forEach(ano=>{ somaSaldoTodos+=saldoDoAno(m,ano); }));
      let somaSaldoGrade=0; for(let i=0;i<a.per.length;i++) somaSaldoGrade+=a.per[i].futuro?a.totalProg[i]:a.totalProg[i]-a.totalEmp[i];
      conjuntos[cj]={ mapps:lista.length, ocultos:faixasTexto(a.anosSemSaldo), visiveis:faixasTexto(visiveis),
        ocultoComSaldo, visivelSemSaldo, cabecalhoComOculto:cabOculto, exportacaoComOculto:expOculto,
        exportacaoCampo:exp['EXERCÍCIOS SEM SALDO OCULTOS'],
        larguraOk:[...document.querySelectorAll('#tabSaldo tbody tr')].slice(0,5).every(tr=>tr.children.length===cab.length),
        saldoTotal:{ grade:somaSaldoGrade, todosAnos:somaSaldoTodos, ok:perto(somaSaldoGrade,somaSaldoTodos) },
        np:a.np.total,
        legenda:$('#saldoLegenda').textContent };
    });
    renderSaldoPorRegra();
    const dicaUniverso=[...document.querySelectorAll('#cartoesSaldoRegra [data-tip]')].map(e=>e.getAttribute('data-tip')).find(t=>/Conjunto: Universo/.test(t))||'';
    const sob=sobreviventes();
    const m=sob.find(x=>somaAno(x,'Programado',2010)) || E.mapps.find(x=>somaAno(x,'Programado',2010));
    abrirFicha(m.chave);
    const secoes=[...document.querySelectorAll('#fichaCorpo .ficha-secao')];
    const sec=secoes.find(s=>/Saldo do programado por exercício/.test(s.querySelector('h4').textContent));
    const anosFicha=[...sec.querySelectorAll('tbody tr td.mono')].map(td=>+td.textContent);
    return JSON.stringify({ conjuntos,
      dicaRegraUniverso:dicaUniverso.split('\\n').filter(l=>/^\\s+\\d{4}:/.test(l)).map(l=>l.trim().slice(0,4)).join(','),
      ficha:{ mapp:m.codigo+' '+m.titulo, anos:anosFicha.join(','), anoSemSaldoNaFicha:anosFicha.filter(a=>Math.abs(saldoDoAno(m,a))<0.005),
              nota:sec.querySelector('p').textContent },
      erros:window.__erros.slice(0,5) },null,1);
  })()`));
  console.log('FIM anos-sem-saldo'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
