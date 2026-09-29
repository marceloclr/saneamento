// Grupos de fonte embutidos (planilha modelos/grupos-fontes.xlsx): valem ao abrir a página, sem
// upload; FONTES COGERF no filtro equivale a marcar as suas fontes à mão. Uso: node teste_grupos_embutidos.js [pagina]
const { carregar }=require('./carregar');
const ok=c=>c?'OK':'FALHOU';
carregar(process.argv[2]).then(win=>{
  const E=win.eval('E'), M=win.eval('MULTIS'), R={};
  const j=win.gruposVigentes();
  const fontes=win.fontesDaBase(), cogerf=fontes.filter(f=>win.grupoDaFonte(f)==='FONTES COGERF');
  R.embutidos={ vigentes:!!j, doUpload:!!E.gruposFonte, grupos:j&&Object.keys(j.grupos).join(','),
    opcoes:win.opcoesGrupoFonte().map(p=>p[0]).join(','), cogerf:cogerf.length,
    semGrupo:fontes.filter(f=>win.grupoDaFonte(f)===win.eval('SEM_GRUPO')).length,
    fonte501:win.grupoDaFonte('(500)-(501) Tesouro'), fonte702:win.grupoDaFonte('(702)-(086) Governo Municipal') };
  R.embutidos.ok=ok(R.embutidos.vigentes && !R.embutidos.doUpload && R.embutidos.cogerf===32 && R.embutidos.semGrupo===0 &&
    R.embutidos.fonte501==='FONTES COGERF' && R.embutidos.fonte702==='OUTRAS FONTES');
  /* equivalência no Panorama: grupo × fontes marcadas */
  const medir=()=>{ const l=win.mappsPanorama(); return l.length+'|'+win.somaSaldo(l).toFixed(2); };
  const marcar=(id,v)=>{ M[id].escolha=new Set(v); win.aplicarMulti(id); };
  if(!M.panFonte) win.montarMulti('#panFonte');
  marcar('panGrupoFonte',['FONTES COGERF']); const porGrupo=medir();
  marcar('panGrupoFonte',[]); marcar('panFonte',cogerf); const porFonte=medir(); marcar('panFonte',[]);
  R.equivalencia={ porGrupo, porFonte, ok:ok(porGrupo===porFonte && !/^0\|/.test(porGrupo)) };
  R.erros=win.__erros.slice(0,5);
  console.log(JSON.stringify(R,null,1)); console.log('FIM grupos-embutidos'); process.exit(0);
}).catch(e=>{ console.log('ERRO',e&&e.stack||e); process.exit(1); });
