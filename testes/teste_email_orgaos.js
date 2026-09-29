// Envio por e-mail aos órgãos: cadastro de destinatários (crítica), planilhas da
// rodada (planilhasDaRodada) e sessão. Sem rede: nada é enviado.
const XLSX=require('xlsx');
const { carregar }=require('./carregar');
const t0=Date.now();
const ok=(c)=>c?'OK':'FALHOU';

carregar().then(async win=>{
  console.log('carga',Math.round((Date.now()-t0)/1000),'s');
  const E=win.eval('E');
  const R={};
  const baixados=[];
  win.eval('baixarBlob=function(b,n){ window.__baixados.push({blob:b,nome:n}); }; window.__baixados=[];');
  win.__baixados=baixados;

  /* ---------- 1. Crítica do cadastro ---------- */
  const orgs=win.eval('Array.from(new Set(conjuntoEnquadrado().map(m=>m.orgao))).sort()');
  const [o1,o2,o3]=orgs;
  const crit=(m)=>win.criticarDestinatarios(m,'teste.xlsx');
  const CAB=['ÓRGÃO','NOME','E-MAIL','TIPO'];
  const bom=crit([CAB,[o1,'Ana','ana@orgao1.ce.gov.br','Para'],[o1,'Bia','bia@orgao1.ce.gov.br','Cc'],[o2.toLowerCase(),'Caio','caio@orgao2.ce.gov.br',''],[o3,'','','Para']]);
  R.cadastroBom={ erros:bom.erros, linhas:bom.linhas.length, orgaoCanonico:bom.linhas[2]&&bom.linhas[2].orgao===o2,
    avisoSemCadastro:bom.avisos.some(a=>/sem destinatário no cadastro/.test(a)), ok:ok(!bom.erros.length && bom.linhas.length===3) };
  const semCol=crit([['ÓRGÃO','NOME','EMAIL_X'],[o1,'Ana','a@b.gov.br']]);
  R.semColuna={ erros:semCol.erros, ok:ok(semCol.erros.length===1 && /E-MAIL/.test(semCol.erros[0])) };
  const ruim=crit([CAB,
    [o1,'Ana','ana(at)orgao','Para'],          // e-mail inválido
    [o1,'Bia','bia@orgao1.ce.gov.br','Cópia'], // tipo inválido
    [o1,'Caio','caio@orgao1.ce.gov.br','Para'],
    [o1,'Caio 2','CAIO@orgao1.ce.gov.br','Para'], // repetido (caixa)
    [o2,'Duda','','Para'],                     // e-mail vazio com nome
    ['','Eva','eva@x.gov.br','Para'],          // órgão vazio
    [o3,'Fábio','fabio@gmail.com','Cc'],       // só Cc + domínio fora
    [o1.slice(0,-1)+' XYZ','Gil','gil@y.ce.gov.br','Para']]); // órgão inexistente
  const tem=(re,l)=>l.some(x=>re.test(x));
  R.cadastroRuim={ erros:ruim.erros, avisos:ruim.avisos.filter(a=>!/sem destinatário no cadastro/.test(a)),
    ok:ok(tem(/e-mail inválido/,ruim.erros)&&tem(/TIPO .* inválido/,ruim.erros)&&tem(/repetido/,ruim.erros)&&tem(/E-MAIL vazio/,ruim.erros)
      &&tem(/ÓRGÃO vazio/,ruim.erros)&&tem(/só tem destinatários em Cc/,ruim.erros)&&tem(/não existe na base/,ruim.avisos)&&tem(/não é de domínio \.gov\.br/,ruim.avisos)) };
  const vazio=crit([CAB,[o1,'','','Para']]);
  R.soModelo={ erros:vazio.erros, ok:ok(vazio.erros.length===1 && /só tem o cabeçalho/.test(vazio.erros[0])) };

  console.log('crítica ok',Math.round((Date.now()-t0)/1000));
  /* importação real de .xlsx: recusado mantém o anterior; aceito substitui */
  const arq=(m,nome)=>{ const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(m),'DESTINATARIOS');
    return new win.File([XLSX.write(wb,{type:'buffer',bookType:'xlsx'})],nome); };
  await win.importarDestinatarios(arq([CAB,[o1,'Ana','ana@orgao1.ce.gov.br','Para'],[o2,'Caio','caio@orgao2.ce.gov.br','Para']],'dest_ok.xlsx'));
  const aceito=E.destinatarios && E.destinatarios.arquivo;
  await win.importarDestinatarios(arq([CAB,[o1,'Ana','invalido','Para']],'dest_ruim.xlsx'));
  R.importacao={ aceito, mantidoAposRecusa:E.destinatarios&&E.destinatarios.arquivo,
    tela:win.document.querySelector('#destCritica').textContent.slice(0,220),
    paraDoOrgao1:win.destinatariosDoOrgao(o1).para.map(l=>l.email),
    ok:ok(aceito==='dest_ok.xlsx' && E.destinatarios.arquivo==='dest_ok.xlsx' && /Recusado/.test(win.document.querySelector('#destCritica').textContent)) };

  console.log('importação ok',Math.round((Date.now()-t0)/1000));
  /* modelo */
  win.baixarModeloDestinatarios();
  /* no Node, XLSX.writeFile grava em disco: confere e apaga */
  const fs=require('fs'); const fm=fs.readdirSync('.').find(n=>/^destinatarios_modelo_.*\.xlsx$/.test(n));
  let linhasModelo=0; if(fm){ const wbm=XLSX.readFile(fm); linhasModelo=XLSX.utils.sheet_to_json(wbm.Sheets['DESTINATARIOS'],{header:1}).length; fs.unlinkSync(fm); }
  R.modelo={ gerado:!!fm, linhas:linhasModelo, orgaosEnquadrados:orgs.length, ok:ok(!!fm && linhasModelo===orgs.length+1) };

  /* ---------- 2. Rodada e planilhasDaRodada ---------- */
  win.eval(`E.ultimaGravacao={nome:'teste.json',onde:['teste'],em:new Date().toISOString()}; E.destinoFixo='local';
    window.__conj=conjuntoRodada; conjuntoRodada=function(){ const o=${JSON.stringify([o1,o2])}; return window.__conj().filter(m=>o.indexOf(m.orgao)>=0); };`);
  baixados.length=0;
  console.log('gerando rodada',Math.round((Date.now()-t0)/1000));
  await win.gerarRodada();
  console.log('rodada ok',Math.round((Date.now()-t0)/1000));
  let r=E.rodadas[E.rodadas.length-1];
  const zip=baixados.find(b=>/planilhas\.zip$/.test(b.nome));
  const p=await win.planilhasDaRodada(r,null);
  const JSZip=require('jszip');
  const z=await JSZip.loadAsync(Buffer.from(await zip.blob.arrayBuffer()));
  const celulas=(buf)=>{ const wb=XLSX.read(Buffer.from(buf),{type:'buffer'}); return JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets['MAPPS'],{header:1})); };
  let iguais=0;
  for(const a of p.arquivos){ const f=z.file(a.nome); if(f && celulas(await f.async('nodebuffer'))===celulas(a.buf)) iguais++; }
  const p1=await win.planilhasDaRodada(r,1);
  R.rodada={ id:r.id, orgaos:r.orgaos.map(o=>o.orgao+' ('+Object.keys(o.itens).length+')'), noZip:Object.keys(z.files).length,
    planilhas:p.arquivos.length, conteudoIgualAoZip:iguais, soOrgao1:p1.arquivos.map(a=>a.orgao+' '+a.mapps),
    ok:ok(p.arquivos.length===2 && iguais===2 && p1.arquivos.length===1 && p1.arquivos[0].orgao===r.orgaos[1].orgao) };

  console.log('planilhas ok',Math.round((Date.now()-t0)/1000));
  /* ---------- sessão ---------- */
  /* retomada sem recalcular o diagnóstico inteiro (lento no jsdom); só os campos da sessão interessam */
  win.eval('window.__diag=diagnosticar; window.__rt=renderTudo; diagnosticar=function(){}; renderTudo=function(){ renderManifestacoes(); };');
  const s=JSON.parse(JSON.stringify(win.montarSessao('x.json')));
  E.destinatarios=null;
  win.aplicarSessao(s,'teste');
  const antiga=Object.assign({},s); delete antiga.destinatarios;
  const sessaoOk=E.destinatarios && E.destinatarios.linhas.length===2;
  win.aplicarSessao(antiga,'teste');
  R.sessao={ gravaDestinatarios:!!s.destinatarios, retomada:!!sessaoOk, sessaoAntigaSemCadastro:E.destinatarios===null,
    ok:ok(!!s.destinatarios && sessaoOk && E.destinatarios===null) };

  console.log('sessão ok',Math.round((Date.now()-t0)/1000));

  /* ---------- 3 e 4. Envio pelo Gmail (Google e rede simulados) ---------- */
  r=E.rodadas.find(x=>x.id===r.id);
  await win.importarDestinatarios(arq([CAB,[o1,'Ana Sá','ana@orgao1.ce.gov.br','Para'],[o1,'Bia','bia@orgao1.ce.gov.br','Cc'],[o2,'Caio','caio@orgao2.ce.gov.br','Para']],'dest_envio.xlsx'));
  E.google.clientId='123-abc.apps.googleusercontent.com';
  let janelas=0, falharOrgao2=true;
  win.google={ accounts:{ oauth2:{
    initTokenClient:(cfg)=>({ requestAccessToken:()=>{ janelas++; cfg.callback({ access_token:'tok-'+janelas, expires_in:3600 }); } }),
    hasGrantedAllScopes:()=>true } } };
  const enviadas=[];
  win.fetch=async(url,op)=>{
    if(/userinfo/.test(url)) return { ok:true, status:200, json:async()=>({ email:'teste@gmail.com' }) };
    if(/messages\/send/.test(url)){
      const raw=JSON.parse(op.body).raw;
      const mime=Buffer.from(raw.replace(/-/g,'+').replace(/_/g,'/'),'base64').toString('latin1');
      const para=(/^To: (.*)$/m.exec(mime)||[])[1]||'';
      if(falharOrgao2 && /caio@/.test(para)) return { ok:false, status:400, json:async()=>({ error:{ message:'Invalid To header' } }) };
      enviadas.push({ mime, auth:op.headers.Authorization });
      return { ok:true, status:200, json:async()=>({ id:'msg'+enviadas.length, threadId:'thr'+enviadas.length }) };
    }
    throw new Error('rede não simulada: '+url);
  };
  const perguntas=[];
  win.eval(`perguntar=function(op){ window.__perg.push(op); return Promise.resolve(op.confirmar===false?null:{ ok:true, dados:{ assunto:'Teste {orgao} até {dataLimite}', corpo:'Olá, órgão {orgao}: {mapps} MAPP(s) no anexo {arquivo}. Ação: ç ã é.', reenviar:false } }); }; window.__perg=[];`);
  win.__perg=perguntas;
  baixados.length=0;
  await win.enviarRodadaEmail(r.id,null,'todos');
  const reg=(k)=>r.orgaos[k].emails||[];
  const m1=enviadas[0]?enviadas[0].mime:'';
  const dec=(s)=>s.replace(/=\?UTF-8\?B\?([^?]+)\?=/g,(t,b)=>Buffer.from(b,'base64').toString('utf8'));
  const partes=m1.split(/--=_saneamento_[a-z0-9]+/);
  const texto=partes[1]?Buffer.from(partes[1].split('\r\n\r\n')[1].replace(/\r\n/g,''),'base64').toString('utf8'):'';
  const anexoB64=partes[2]?partes[2].split('\r\n\r\n')[1].replace(/\r\n/g,''):'';
  const anexo=Buffer.from(anexoB64,'base64');
  const pRef=await win.planilhasDaRodada(r,0);
  const iOrg1=r.orgaos.findIndex(o=>o.orgao===o1);
  R.envio={ janelasGoogle:janelas, enviadas:enviadas.length, auth:enviadas[0]&&enviadas[0].auth,
    para:dec((/^To: (.*)$/m.exec(m1)||[])[1]||''), cc:(/^Cc: (.*)$/m.exec(m1)||[])[1], assunto:dec((/^Subject: (.*)$/m.exec(m1)||[])[1]||''),
    texto, nomeAnexo:(/filename="([^"]+)"/.exec(m1)||[])[1],
    anexoIgualPlanilha: celulas(anexo)===celulas(pRef.arquivos[0].buf),
    hashConfere: reg(iOrg1)[0] && reg(iOrg1)[0].hashPlanilha===win.cyrb53(anexoB64),
    registros:r.orgaos.map(o=>({ orgao:o.orgao, emails:(o.emails||[]).map(x=>x.situacao+(x.erro?' ('+x.erro+')':'')+' '+x.para.join(',')+' '+x.idMensagem) })),
    sessaoGravada:baixados.some(b=>/\.json$/.test(b.nome)),
    celula:win.document.querySelector('#tabRodadas tbody').textContent.includes('Falha'),
    botaoFalhas:/Reenviar falhas/.test(win.document.querySelector('#rodadasAcoes').textContent) };
  R.envio.ok=ok(enviadas.length===1 && /ana@orgao1/.test(R.envio.para) && /Ana Sá/.test(R.envio.para) && /bia@orgao1/.test(R.envio.cc||'') &&
    R.envio.assunto.startsWith('Teste '+o1) && /ç ã é/.test(texto) && R.envio.anexoIgualPlanilha && R.envio.hashConfere &&
    reg(iOrg1)[0].situacao==='enviado' && reg(1-iOrg1)[0].situacao==='falha' && R.envio.sessaoGravada && R.envio.celula && R.envio.botaoFalhas);

  falharOrgao2=false;
  await win.enviarRodadaEmail(r.id,null,'falhas');
  const n2=enviadas.length;
  await win.enviarRodadaEmail(r.id,null,'todos');   // todos já receberam: nada sai
  R.reenvio={ enviadasAposFalhas:n2, enviadasAposTodos:enviadas.length, tentativasOrgao2:reg(1-iOrg1).map(x=>x.situacao),
    janelasGoogle:janelas, ok:ok(n2===2 && enviadas.length===2 && reg(1-iOrg1).length===2 && reg(1-iOrg1)[1].situacao==='enviado' && janelas===1) };

  /* bloqueio: órgão da rodada sem destinatário */
  await win.importarDestinatarios(arq([CAB,[o1,'Ana','ana@orgao1.ce.gov.br','Para']],'dest_parcial.xlsx'));
  const antes=enviadas.length; perguntas.length=0;
  await win.enviarRodadaEmail(r.id,null,'todos');
  R.bloqueio={ titulo:perguntas[0]&&perguntas[0].titulo, enviadas:enviadas.length-antes,
    ok:ok(perguntas.length===1 && /bloqueado/.test(perguntas[0].titulo) && enviadas.length===antes) };

  const s2=win.montarSessao('y.json');
  R.sessaoEmail={ emailsNaSessao:s2.rodadas.some(x=>x.orgaos.some(o=>o.emails&&o.emails.length)), clientId:s2.cfgSessao.google.clientId,
    modelo:s2.cfgSessao.modeloEmail&&s2.cfgSessao.modeloEmail.assunto, exportacao:win.linhasEnviosEmail().length,
    ok:ok(s2.cfgSessao.google.clientId===E.google.clientId && win.linhasEnviosEmail().length===3) };

  R.erros=win.__erros.filter(e=>!/rede não simulada|Invalid To/.test(e)).slice(0,5);
  console.log(JSON.stringify(R,null,1));
  console.log('FIM email-orgaos'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
