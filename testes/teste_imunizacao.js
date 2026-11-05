// Imunizar (Quadro de diagnóstico › Providência), com os MAPPs da SEPA: o imunizado sobrevive
// às regras aplicadas, recebe o NP 2027, sai da Decisão e da Manifestação; revogar devolve o
// efeito; a exclusão prevalece; regra nova (fora da imunidade) volta a valer.
// Uso: node teste_imunizacao.js [pagina]
const { carregar }=require('./carregar');
const ok=c=>c?'OK':'FALHOU';

carregar(process.argv[2]).then(async win=>{
  const E=win.eval('E'), doc=win.document, R={};
  const ORG='SEPA';
  const sepa=E.mapps.filter(m=>m.orgao===ORG), porCod=c=>sepa.find(m=>m.codigo===c);
  const cods=l=>l.filter(m=>m.orgao===ORG).map(m=>m.codigo).sort((a,b)=>a-b).join(',');
  const npSEPA=()=>Math.round(win.sobreviventes().filter(m=>m.orgao===ORG).reduce((t,m)=>t+win.npDoMapp(m).valor,0));
  const invariante=()=>{ const cs=new Set(win.conjuntoSaneamento().map(m=>m.chave));
    return E.diag.noUniverso.every(m=>win.sobrevive(m)!==cs.has(m.chave)); };
  const alvo=sepa.find(m=>m.dentroUniverso && m.d.regras.length && m.estagio!=='CANCELADO' && m.estagio!=='PARALISADO');
  const k=alvo.chave;

  R.inicio={ alvo:alvo.codigo, regras:alvo.d.regras.join('+'), sobreviventes:cods(win.sobreviventes()), np:npSEPA() };

  /* botão na coluna Providência do quadro */
  win.eval("MULTIS.fOrgao.escolha=new Set(['SEPA']); rotularMulti('fOrgao');");
  win.renderDiagnostico();
  const btn=()=>doc.querySelector('#tabDiag tbody [data-imunizar="'+k+'"]');
  const semRegra=sepa.find(m=>m.dentroUniverso && !m.d.regras.length);
  R.botao={ texto:btn()&&btn().textContent, semRegraSemBotao:!doc.querySelector('#tabDiag tbody [data-imunizar="'+(semRegra&&semRegra.chave)+'"]') };
  R.botao.ok=ok(R.botao.texto==='Imunizar' && R.botao.semRegraSemBotao);

  /* imunizar (o diálogo é substituído por confirmação automática) */
  win.dialogo=async()=>({ motivo:'execução em curso' });
  await win.alternarImunizacao(k);
  const sd=win.situacaoDepois(alvo), sa=win.situacaoAntes(alvo);
  R.imune={ sobreviventes:cods(win.sobreviventes()), np:npSEPA(), naDecisao:win.conjuntoSaneamento().some(m=>m.chave===k),
    naManif:win.conjuntoEnquadrado().some(m=>m.chave===k), situacao:sd===sa, motivo:win.motivoSobrevive(alvo),
    botao:btn()&&btn().textContent, revisao:/Imunizado/.test(doc.querySelector('#tabDiag tbody tr[data-chave="'+k+'"]').textContent),
    regraRiscada:!!doc.querySelector('#tabDiag tbody tr[data-chave="'+k+'"] .regra-imune'),
    export:win.contextoRegra(alvo)['IMUNIZAÇÃO'], sessao:!!win.montarSessao('t').imunizacoes[k], invariante:invariante() };
  R.imune.ok=ok(win.sobrevive(alvo) && R.imune.np>R.inicio.np && !R.imune.naDecisao && !R.imune.naManif && R.imune.situacao &&
    R.imune.motivo==='Imunizado' && R.imune.botao==='Revogar imunidade' && R.imune.revisao && R.imune.regraRiscada && R.imune.sessao &&
    /^Imune a /.test(R.imune.export) && R.imune.invariante);

  /* exclusão prevalece */
  E.exclusoes[k]={motivo:'t',responsavel:'t',data:new Date().toISOString()};
  R.exclusao={ sobrevive:win.sobrevive(alvo), invariante:invariante() };
  R.exclusao.ok=ok(!R.exclusao.sobrevive && R.exclusao.invariante);
  delete E.exclusoes[k];

  /* regra fora da imunidade volta a valer */
  const guardado=E.imunizacoes[k].regras; E.imunizacoes[k].regras=['__outra'];
  R.regraNova={ sobrevive:win.sobrevive(alvo), invariante:invariante() };
  R.regraNova.ok=ok(!R.regraNova.sobrevive && R.regraNova.invariante);
  E.imunizacoes[k].regras=guardado;

  /* revogar pelo botão */
  btn().click(); await new Promise(r=>setTimeout(r,50));
  R.revogar={ sobreviventes:cods(win.sobreviventes()), np:npSEPA(), imunizacoes:Object.keys(E.imunizacoes).length };
  R.revogar.ok=ok(R.revogar.sobreviventes===R.inicio.sobreviventes && R.revogar.np===R.inicio.np && R.revogar.imunizacoes===0);

  R.erros=win.__erros.slice(0,5);
  console.log(JSON.stringify(R,null,1));
  console.log('FIM imunizacao'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
