// Excluir pelo usuário (plano excluir-pelo-usuario), com os MAPPs da SEPA: o excluído sai como
// os das regras, a rejeição não salva o MAPP, os cartões da Decisão somam e o Resultado não
// conta o excluído duas vezes. Uso: node teste_exclusao.js [pagina]
const { carregar }=require('./carregar');
const ok=c=>c?'OK':'FALHOU';

carregar(process.argv[2]).then(async win=>{
  const E=win.eval('E'), doc=win.document, R={};
  const ORG='SEPA';
  const sepa=E.mapps.filter(m=>m.orgao===ORG), porCod=c=>sepa.find(m=>m.codigo===c);
  const cods=l=>l.filter(m=>m.orgao===ORG).map(m=>m.codigo).sort((a,b)=>a-b).join(',');
  const agora=new Date().toISOString();
  const decidir=(c,s)=>{ E.decisoes[porCod(c).chave]={situacao:s,acao:'',justificativa:'teste',responsavel:'teste',data:agora}; };
  const excluir=c=>{ E.exclusoes[porCod(c).chave]={motivo:'teste',responsavel:'teste',data:agora}; };
  const linhaSEPA=()=>{ win.eval("document.getElementById('adEstrato').value='orgao'"); const a=win.apurarAntesDepois(); return a.estratos.get(ORG); };
  const npSEPA=()=>Math.round(win.sobreviventes().filter(m=>m.orgao===ORG).reduce((t,m)=>t+win.npDoMapp(m).valor,0));
  /* invariante: no universo, sobrevive ⇔ fora do conjunto da Decisão */
  const invariante=()=>{ const cs=new Set(win.conjuntoSaneamento().map(m=>m.chave));
    return E.diag.noUniverso.every(m=>win.sobrevive(m)!==cs.has(m.chave)); };

  R.inicio={ sepa:sepa.length, sobreviventes:cods(win.sobreviventes()), np:npSEPA(), seletorProjecao:!!doc.getElementById('adBase') };
  R.inicio.ok=ok(sepa.length===10 && R.inicio.sobreviventes==='2' && R.inicio.np===9668515 && !R.inicio.seletorProjecao);

  /* ---------- A: 14 acatada, 17 rejeitada, 18 excluída, 20 acatada e excluída ---------- */
  decidir('14','acatada'); decidir('17','rejeitada'); excluir('18'); decidir('20','acatada'); excluir('20');
  win.renderSaneamento();
  const o=linhaSEPA();
  const mant=win.mantidos().filter(m=>m.orgao===ORG), exc=win.excluidos().filter(m=>m.orgao===ORG);
  const sd=c=>win.situacaoDepois(porCod(c));
  const somaRegras=Object.values(o.regras).reduce((t,x)=>t+x,0);
  const cartoes=Array.from(doc.querySelectorAll('#cartoesSaneamento .cartao, #cartoesSaneamento > *')).map(c=>c.textContent.replace(/\s+/g,' ').trim().slice(0,60));
  R.A={ sobreviventes:cods(win.sobreviventes()), np:npSEPA(), mantidos:mant.length, excluidos:exc.length,
    rejeitadaSobrevive:win.sobrevive(porCod('17')), sd17:sd('17'), sd18:sd('18'), sd20:sd('20'),
    resultado:{ antes:o.antes, depois:o.depois, regras:o.regras, exc:o.exc, fecha:o.depois===o.antes-somaRegras-o.exc },
    ativoDepois:sepa.filter(m=>m.dentroUniverso&&win.situacaoDepois(m)==='Ativo').length,
    invariante:invariante(), cartoes };
  R.A.ok=ok(R.A.sobreviventes==='2' && R.A.np===9668515 && R.A.mantidos===9 && R.A.excluidos===2 && !R.A.rejeitadaSobrevive &&
    R.A.sd17==='Pendente' && R.A.sd18==='Excluído pelo usuário' && R.A.sd20==='Excluído pelo usuário' &&
    o.antes===10 && o.depois===1 && o.exc===2 && o.regras['1a']===4 && o.regras['1b']===2 && o.regras['1.2']===1 && R.A.resultado.fecha &&
    R.A.ativoDepois===1 && R.A.invariante);

  /* ---------- coluna Regra da Decisão e filtro "Excluído pelo usuário" ---------- */
  win.eval("MULTIS.sRegra.escolha=new Set(['excluido']); aplicarMulti('sRegra');");
  const filtrados=win.filtrarSaneamento();
  win.renderSaneamento();
  const linhas=Array.from(doc.querySelectorAll('#tabSaneamento tbody tr[data-chave-san]'));
  const comEtiqueta=linhas.filter(tr=>/Excluído pelo usuário/.test(tr.textContent)).length;
  R.decisao={ filtrados:cods(filtrados), linhas:linhas.length, comEtiqueta };
  R.decisao.ok=ok(R.decisao.filtrados==='18,20' && linhas.length===2 && comEtiqueta===2);

  /* ---------- B: excluir o MAPP 2 (sem regra) pelo caminho do botão ---------- */
  E.motivoExclusao='teste'; E.perguntarExclusao=false;
  await win.ocultarMapps([porCod('2').chave],'2');
  const o2=linhaSEPA();
  win.renderSaneamento();
  R.B={ sobreviventes:cods(win.sobreviventes()), np:npSEPA(), naDecisao:cods(win.filtrarSaneamento()),
    depois:o2.depois, exc:o2.exc, sd2:sd('2'), invariante:invariante(),
    exportacao:win.linhasExcluidos().filter(l=>l['ÓRGÃO']===ORG||l['ORGAO']===ORG).length,
    colunasExport:Object.keys(win.linhasExcluidos()[0]||{}).filter(k=>/EXCLUS|MOTIVO|RESPONS|DATA/.test(k)).join('|') };
  R.B.ok=ok(R.B.sobreviventes==='' && R.B.np===0 && R.B.naDecisao==='2,18,20' && R.B.depois===0 && R.B.exc===3 &&
    R.B.sd2==='Excluído pelo usuário' && R.B.invariante && R.B.exportacao===3);

  /* ---------- restabelecer devolve o MAPP 2 aos sobreviventes ---------- */
  win.restabelecerMapps([porCod('2').chave]);
  R.restabelecer={ sobreviventes:cods(win.sobreviventes()), np:npSEPA() };
  R.restabelecer.ok=ok(R.restabelecer.sobreviventes==='2' && R.restabelecer.np===9668515);

  /* ---------- nomes e botões (etapa 2) ---------- */
  win.eval("MULTIS.sRegra.escolha=new Set(); aplicarMulti('sRegra');");
  win.renderSaneamento();
  const botoes=Array.from(doc.querySelectorAll('#tabSaneamento tbody [data-ocultar]')).map(b=>b.textContent);
  win.abrirFicha(porCod('18').chave);
  const ficha=doc.getElementById('fichaCorpo');
  R.nomes={ lote:doc.getElementById('btnOcultarLote').textContent, botoes:Array.from(new Set(botoes)).join(','),
    fichaBotoes:ficha.querySelectorAll('button[data-ficha]').length, fichaMostraExclusao:/Excluído pelo usuário/.test(ficha.textContent),
    ocultarVisivel:/Ocultar/.test(doc.getElementById('p-saneamento').textContent) };
  R.nomes.ok=ok(R.nomes.lote==='Excluir selecionados' && /Excluir/.test(R.nomes.botoes) && !/Ocultar/.test(R.nomes.botoes) &&
    R.nomes.fichaBotoes===0 && R.nomes.fichaMostraExclusao && !R.nomes.ocultarVisivel);

  R.erros=win.__erros.slice(0,5);
  console.log(JSON.stringify(R,null,1));
  console.log('FIM exclusao'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
