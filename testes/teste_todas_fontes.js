const { carregar }=require('./carregar');
carregar().then(win=>{
  console.log(win.eval(`(function(){
    const st=MULTIS.fFonte; ['fSecretaria','fOrgao','fPrograma','fAno','fRegra','fEstagio','fRevisao','fExec','fConfianca','fManif'].forEach(i=>MULTIS[i].escolha.clear());
    st.escolha.clear(); const base=filtrar(); const s0=somaSaldo(base);
    st.lista.forEach(p=>st.escolha.add(p[0])); const L=filtrar();
    const semFonteNaLinha=E.diag.noUniverso.filter(m=>m.porFonte.some(pf=>!pf.fonte)).length;
    const difs=L.filter(m=>Math.abs(m.saldo-m.$base.saldo)>0.01).length;
    return JSON.stringify({opcoes:st.lista.length, n:L.length, nBase:base.length, soma:somaSaldo(L), somaBase:s0, iguais:Math.abs(somaSaldo(L)-s0)<0.01, linhasDiferentes:difs, mappsComFonteVazia:semFonteNaLinha});
  })()`)); process.exit(0);
});
