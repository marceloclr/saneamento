// Grupos de fonte: modelo, crítica, filtro Grupo → Fonte em cada tela (equivalência com
// marcar as fontes à mão), Resultado (aditividade), agrupamento por grupo e sessão.
const XLSX=require('xlsx'), ExcelJS=require('exceljs');
const { carregar }=require('./carregar');
const t0=Date.now(), seg=()=>Math.round((Date.now()-t0)/1000);
const ok=c=>c?'OK':'FALHOU', perto=(a,b)=>Math.abs(a-b)<0.01;

carregar().then(async win=>{
  console.log('carga',seg(),'s');
  const E=win.eval('E'), M=win.eval('MULTIS'), R={};
  const marcar=(id,vals)=>{ const st=M[id]; st.escolha=new Set(vals); win.aplicarMulti(id); };

  /* ---------- modelo ---------- */
  const fontes=win.fontesDaBase();
  /* O construtor roda fora do jsdom, como no gerador: listas criadas dentro da página não
     são reconhecidas como listas pelo ExcelJS do Node, e as linhas sairiam vazias. */
  const html=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
  const trecho=/\/\* MODELO-GRUPOS-FONTE:INICIO[\s\S]*?\/\* MODELO-GRUPOS-FONTE:FIM \*\//.exec(html)[0];
  const montar=new Function(trecho+'\nreturn montarModeloGruposFonte;')();
  const buf=await montar(ExcelJS,Array.from(fontes,String));
  const wm=XLSX.read(Buffer.from(buf),{type:'buffer'});
  const FM=XLSX.utils.sheet_to_json(wm.Sheets['FONTES'],{header:1});
  const wr=XLSX.readFile(require('path').join(__dirname,'..','modelos','grupos-fonte-modelo.xlsx'));
  R.modelo={ abas:wm.SheetNames.join(','), fontes:FM.length-1, cab:FM[0].join('|'),
    igualAoRepositorio:JSON.stringify(XLSX.utils.sheet_to_json(wr.Sheets['FONTES'],{header:1}))===JSON.stringify(FM),
    ok:ok(wm.SheetNames.join(',')==='INSTRUCOES,GRUPOS,FONTES' && FM.length-1===fontes.length) };

  /* ---------- crítica ---------- */
  const crit=(g,f)=>win.criticarGruposFonte({GRUPOS:g,FONTES:f},'t.xlsx');
  const GC=['CÓDIGO','DESCRIÇÃO'], FC=['CÓDIGO','DESCRIÇÃO','GRUPO','FONTE NA BASE'];
  const linhaF=(nm,g)=>[win.codigoFonte(nm),win.descricaoFonte(nm),g,nm];
  const tes=fontes.filter(f=>/Tesouro/i.test(f)), cred=fontes.filter(f=>/Crédito/i.test(f) && !tes.includes(f));   /* cada fonte num só grupo */
  const semAba=win.criticarGruposFonte({GRUPOS:[GC],FONTES:null},'t.xlsx');
  const ruim=crit([GC,['TES','Tesouro'],['TES','Outro'],['','Sem código'],['VAZIO','Grupo vazio']],
    [FC,linhaF(tes[0],'TES'),linhaF(tes[0],'TES'),linhaF(cred[0],'XX'),['','Qualquer','TES',''],['999-999','Fonte fantasma','TES',''],
     [win.codigoFonte(tes[1]),'Descrição trocada','TES','']]);
  const tem=(re,l)=>l.some(x=>re.test(x));
  R.critica={ semAba:semAba.erros, erros:ruim.erros, avisos:ruim.avisos.map(a=>a.slice(0,90)),
    ok:ok(tem(/FONTES não encontrada/,semAba.erros) && tem(/código TES repetido/,ruim.erros) && tem(/CÓDIGO vazio \(Sem código\)/,ruim.erros)
      && tem(/repetida/,ruim.erros) && tem(/grupo XX não existe/,ruim.erros) && tem(/CÓDIGO vazio \(Qualquer\)/,ruim.erros)
      && tem(/não está na base/,ruim.avisos) && tem(/difere da base/,ruim.avisos) && tem(/VAZIO .*sem nenhuma fonte/,ruim.avisos)
      && tem(/sem grupo/,ruim.avisos)) };

  /* ---------- importação real: grupos TES e CRED ---------- */
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([GC,['TES','Tesouro Estadual'],['CRED','Operações de crédito']]),'GRUPOS');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([FC].concat(tes.map(f=>linhaF(f,'TES')),cred.map(f=>linhaF(f,'CRED')))),'FONTES');
  await win.importarGruposFonte(new win.File([XLSX.write(wb,{type:'buffer',bookType:'xlsx'})],'grupos.xlsx'));
  console.log('grupos importados',seg());
  R.importacao={ grupos:win.opcoesGrupoFonte().map(p=>p[0]).join(','), tes:tes.length, cred:cred.length,
    grupoDe500:win.grupoDaFonte(tes[0]), semGrupo:win.grupoDaFonte(fontes.find(f=>!tes.includes(f)&&!cred.includes(f))),
    ok:ok(win.opcoesGrupoFonte().map(p=>p[0]).join(',')==='CRED,TES,(sem grupo)' && E.gruposFonte && E.gruposFonte.hash) };

  /* ---------- equivalência: grupo TES × fontes do TES marcadas à mão ---------- */
  win.renderTudo(); console.log('renderTudo',seg());
  const medidas={
    pan:()=>{ const l=win.mappsPanorama(); return l.length+'|'+win.somaSaldo(l).toFixed(2); },
    f:()=>{ win.eval('E.filtro=lerFiltros(); renderDiagnostico();'); return win.document.querySelector('#resumoFiltro').textContent.split(' · ')[0]; },
    s:()=>{ const l=win.filtrarSaneamento(); return l.length+'|'+win.somaSaldo(win.listaNaFonte(l,E.filtroSan.fonte)).toFixed(2); },
    prog:()=>{ const l=win.programacaoFiltrada(); return String(l.length); },
    contin:()=>{ win.renderFase2(); return String(win.document.querySelectorAll('#tabContinuidade tbody tr[data-chave]').length); },
    ad:()=>{ win.renderAntesDepois(); const q=win.linhasQuadroMapp(false); let s=0; q.linhas.forEach(v=>s+=+v[q.c27+1]||0);
      return E.ad.npQ.total.toFixed(2)+'|'+q.linhas.length+'|'+s.toFixed(2); }
  };
  const pref={ pan:'pan', f:'f', s:'s', prog:'prog', contin:'contin', ad:'ad' };
  R.equivalencia={};
  for(const k of Object.keys(medidas)){
    const idG=pref[k]+'GrupoFonte', idF=pref[k]+'Fonte';
    if(!M[idF]) win.montarMulti('#'+idF);
    const sem=medidas[k]();
    marcar(idG,['TES']);
    const cascata=M[idF].lista.every(p=>win.grupoDaFonte(p[0])==='TES') && M[idF].lista.length>0;
    const porGrupo=medidas[k]();
    marcar(idG,[]); marcar(idF,tes.filter(f=>M[idF].lista.some(p=>p[0]===f)));
    const porFonte=medidas[k]();
    marcar(idF,[]);
    R.equivalencia[k]={ semFiltro:sem, porGrupo, porFonte, cascata, ok:ok(porGrupo===porFonte && cascata && porGrupo!==sem) };
    console.log('tela',k,seg());
  }

  /* ---------- Resultado: TES + CRED + (sem grupo) = total ---------- */
  const somaQuadro=()=>{ const q=win.linhasQuadroMapp(false); let a=0,b=0; q.linhas.forEach(v=>{ a+=+v[q.c27]||0; b+=+v[q.c27+1]||0; }); return [a,b,q.linhas.length]; };
  const tot=somaQuadro(); const partes=['TES','CRED','(sem grupo)'].map(g=>{ marcar('adGrupoFonte',[g]); return somaQuadro(); }); marcar('adGrupoFonte',[]);
  const soma=partes.reduce((s,p)=>[s[0]+p[0],s[1]+p[1],s[2]+p[2]],[0,0,0]);
  marcar('adGrupoFonte',['TES']);
  const exp={ np:win.linhasNPPorFonte(), org:win.linhasResultadoPorOrgao(), par:win.linhasParametrosResultado([]) };
  const npTES=exp.np[exp.np.length-1]['NOVO PROGRAMADO 2027'], orgTES=exp.org[exp.org.length-1]['NOVO PROGRAMADO 2027'];
  const topo=win.document.querySelector('#resultadoResumoTopo').textContent;
  marcar('adGrupoFonte',[]);
  R.resultado={ total:tot.map(x=>+x.toFixed(2)), soma:soma.map(x=>+x.toFixed(2)), exportNP:npTES, exportOrgao:orgTES, quadroTES:partes[0][1],
    parametro:(exp.par.find(p=>/Filtros aplicados/.test(p.ITEM))||{}).VALOR, topo,
    ok:ok(perto(tot[0],soma[0]) && perto(tot[1],soma[1]) && tot[2]===soma[2] && perto(npTES,partes[0][1]) && perto(orgTES,partes[0][1]) && /grupo de fonte/.test(topo)) };

  /* ---------- agrupamento por grupo ---------- */
  win.document.querySelector('#saldoAgrupamento').value='grupo'; win.renderSaldo();
  const a=E.saldo; const npG=a.grupos.reduce((s,g)=>s+g.np,0);
  win.document.querySelector('#adEstrato').value='grupo'; win.renderAntesDepois();
  let npE=0; E.ad.estratos.forEach(o=>npE+=o.novoProgramado);
  R.agrupamento={ saldoLinhas:a.grupos.map(g=>g.nome).join(', '), saldoNP:[npG,a.np.total], resultadoNP:[npE,E.ad.npQ.total],
    ok:ok(perto(npG,a.np.total) && perto(npE,E.ad.npQ.total) && a.grupos.length===3) };
  win.document.querySelector('#saldoAgrupamento').value='orgao'; win.document.querySelector('#adEstrato').value='orgao';

  /* ---------- sessão ---------- */
  win.eval('diagnosticar=function(){}; renderTudo=function(){};');
  const s=JSON.parse(JSON.stringify(win.montarSessao('x.json')));
  win.aplicarSessao(Object.assign({},s,{gruposFonte:null}),'teste');
  const semGrupos=!win.temGruposFonte() && M['fGrupoFonte'].bt.disabled;
  win.aplicarSessao(s,'teste');
  R.sessao={ grava:!!s.gruposFonte, semGruposDesabilita:semGrupos, retomada:win.temGruposFonte(), ok:ok(!!s.gruposFonte && semGrupos && win.temGruposFonte()) };

  R.erros=win.__erros.slice(0,5);
  console.log(JSON.stringify(R,null,1));
  console.log('FIM grupo-fonte'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
