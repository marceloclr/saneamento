const { carregar }=require('./carregar');
(async function(){
  const t0=Date.now();
  const win=await carregar();
  console.log('carga',Math.round((Date.now()-t0)/1000),'s');
  const r=win.eval(`(function(){
    const out={ carga:{ mapps:E.mapps.length, falhas:E.falhasRender, erros:window.__erros.slice(0,5) } };
    const set=(id,vals)=>{ const st=MULTIS[id]; st.escolha.clear(); (vals||[]).forEach(v=>st.escolha.add(v)); rotularMulti(id); };
    const zera=(ids)=>ids.forEach(id=>set(id,[]));
    const perto=(a,b)=>Math.abs(a-b)<0.01;
    const saldoF=(m,f)=>m.porFonte.filter(pf=>f.indexOf(pf.fonte)>=0).reduce((t,pf)=>t+saldoSerie(pf.serie),0);
    const cont={}; E.diag.noUniverso.forEach(m=>{ if(m.fontes>1) m.porFonte.forEach(pf=>cont[pf.fonte]=(cont[pf.fonte]||0)+1); });
    const F=Object.keys(cont).sort((a,b)=>cont[b]-cont[a]); const A=F[0], B=F[1];
    out.fontes=[A,B];
    const FD=['fSecretaria','fOrgao','fPrograma','fAno','fRegra','fEstagio','fRevisao','fExec','fConfianca','fFonte','fManif'];

    // ===== Diagnóstico
    const D={};
    zera(FD); const base=filtrar(); const baseSoma=somaSaldo(base);
    set('fFonte',[A]); let L=filtrar();
    let esp=E.diag.noUniverso.filter(m=>casaFonte([A],m));
    D.umaFonte={ n:L.length, nEsperado:esp.length, soma:somaSaldo(L), somaEsperada:esp.reduce((t,m)=>t+saldoF(m,[A]),0),
      futuroOk:L.every(m=>perto(m.progFuturo, m.$base.porFonte.filter(pf=>pf.fonte===A).reduce((t,pf)=>{let s=0; E.anos.forEach(a=>{ if(a>E.cfg.presenteFim) s+=somaAnoArray(pf.serie,'Programado',a); }); return t+s;},0))),
      algumaLinhaMudou:L.some(m=>!perto(m.saldo,m.$base.saldo)) };
    set('fFonte',[A,B]); L=filtrar(); esp=E.diag.noUniverso.filter(m=>casaFonte([A,B],m));
    D.duasFontes={ n:L.length, nEsperado:esp.length, igual:perto(somaSaldo(L), esp.reduce((t,m)=>t+saldoF(m,[A,B]),0)) };
    set('fFonte',F); L=filtrar(); D.todasMarcadas={ n:L.length, nBase:base.length, somaIgualSemFiltro:perto(somaSaldo(L),baseSoma) };
    set('fFonte',[]); D.semFonte=perto(somaSaldo(filtrar()),baseSoma);
    // renderização: rodapé e resumo
    set('fFonte',[A]); renderDiagnostico();
    D.tela={ rodape:$('#tabDiag tfoot').textContent.replace(/\\s+/g,' ').slice(0,120), resumo:$('#resumoFiltro').textContent.slice(0,160),
      linha1:[...$('#tabDiag tbody tr').children].slice(8,11).map(t=>t.textContent) };
    set('fFonte',[]);
    // combinação: órgão + fonte + estágio + valor mínimo
    const org=E.diag.noUniverso.filter(m=>casaFonte([A],m)).map(m=>m.orgao).sort((a,b)=>0)[0];
    set('fOrgao',[org]); set('fFonte',[A]); set('fEstagio',['EM_EXECUCAO']); $('#fValorMin').value='100000';
    L=filtrar();
    esp=E.diag.noUniverso.filter(m=>m.orgao===org && casaFonte([A],m) && m.estagio==='EM_EXECUCAO' && saldoF(m,[A])>=100000);
    D.combinacao={ orgao:org, n:L.length, nEsperado:esp.length, mesmos:L.map(m=>m.chave).sort().join()===esp.map(m=>m.chave).sort().join(),
      nSoOrgao:E.diag.noUniverso.filter(m=>m.orgao===org).length };
    $('#fValorMin').value='0'; zera(FD);
    // filtros isolados
    D.isolados={};
    [['fSecretaria','secretaria'],['fOrgao','orgao'],['fPrograma','programa'],['fAno','ano'],['fEstagio','estagio'],['fConfianca',null],['fRegra',null],['fRevisao',null],['fExec',null],['fManif',null]].forEach(([id,c])=>{
      const op=MULTIS[id].lista[Math.min(1,MULTIS[id].lista.length-1)]; if(!op) return;
      set(id,[op[0]]); const l=filtrar();
      D.isolados[id]={ opcao:op[1].slice(0,30), n:l.length, coerente: c?l.every(m=>String(c==='estagio'?m.estagio:m[c])===op[0]):null };
      set(id,[]);
    });
    // dependentes
    set('fSecretaria',['SEPLAG']); opcoesDependentes(E.mapps,'#fSecretaria','#fOrgao','#fPrograma');
    D.dependentes={ orgaos:MULTIS.fOrgao.lista.map(p=>p[0]), programas:MULTIS.fPrograma.lista.length };
    set('fSecretaria',[]); opcoesDependentes(E.mapps,'#fSecretaria','#fOrgao','#fPrograma');
    D.dependentesVolta=MULTIS.fOrgao.lista.length;
    out.diagnostico=D;

    // ===== Decisão
    const S={}; prepararFiltrosSaneamento();
    const sb=somaSaldo(filtrarSaneamento());
    set('sFonte',[A]); const sl=filtrarSaneamento(); const se=conjuntoEnquadrado().filter(m=>casaFonte([A],m));
    S.fonte={ n:sl.length, nEsperado:se.length, igual:perto(somaSaldo(sl), se.reduce((t,m)=>t+saldoF(m,[A]),0)) };
    set('sOrgao',[sl[0].orgao]); S.combinacao={ n:filtrarSaneamento().length, nEsperado:se.filter(m=>m.orgao===sl[0].orgao).length };
    set('sFonte',[]); set('sOrgao',[]); S.volta=perto(somaSaldo(filtrarSaneamento()),sb);
    out.decisao=S;

    // ===== Panorama
    const P={};
    set('panFonte',[A]); cacheRecorte.chave=null;
    const U=diagPanorama().noUniverso;
    const npEsp=E.diag.noUniverso.filter(m=>casaFonte([A],m)&&sobrevive(m)).reduce((t,m)=>t+m.porFonte.filter(pf=>pf.fonte===A).reduce((s,pf)=>s+novoProgramadoSerie(pf.serie,anosNovoProgramado(),npDoMapp(m).anosExcluidos).valor,0),0);
    P.fonte={ universo:U.length, todosNaFonte:U.every(m=>!!m.$fontes), np:totaisNP(sobreviventes(U)).np, npEsperado:npEsp,
      saldoSobrev:(function(){ $('#saldoConjunto').value='sobreviventes'; return apurarSaldo().np.total; })() };
    set('saldoOrgao',[U[0].orgao]); cacheRecorte.chave=null;
    P.combinacao={ n:diagPanorama().noUniverso.length, nEsperado:E.diag.noUniverso.filter(m=>casaFonte([A],m)&&m.orgao===U[0].orgao).length };
    zera(['panSecretaria','saldoOrgao','panPrograma','panFonte','panEstagio']); cacheRecorte.chave=null;
    // Programação: fonte da grade
    set('progFonte',[A]); const pg=programacaoFiltrada();
    P.programacao={ n:pg.length, naFonte:pg.every(p=>!!p.m.$fontes), progAtualOk:pg.every(p=>perto(p.progAtual, p.m.$base.porFonte.filter(pf=>pf.fonte===A).reduce((t,pf)=>t+somaAnoArray(pf.serie,'Programado',E.cfg.presenteFim),0))) };
    set('progFonte',[]);
    out.panorama=P;

    // ===== Continuidade
    set('continFonte',[A]); renderFase2();
    out.continuidade={ cartoes:$('#cartoesContinuidade').textContent.replace(/\\s+/g,' ').slice(0,200) };
    set('continFonte',[]); renderFase2();
    out.continuidadeSem=$('#cartoesContinuidade').textContent.replace(/\\s+/g,' ').slice(0,200);

    out.errosFinais=window.__erros.slice(0,8);
    return out;
  })()`);
  console.log(JSON.stringify(r,null,1));
  console.log('tempo',Math.round((Date.now()-t0)/1000),'s');
  process.exit(0);
})().catch(e=>{ console.error('FALHA',e); process.exit(1); });
