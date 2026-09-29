// Gera o bloco 12 da versão simplificada (grupos de fonte e seleção de colunas) a partir do
// bloco 12 da versão completa, com os ajustes da simplificada. Rodar de novo sempre que o bloco
// da completa mudar: o trecho entre BLOCO12:INICIO e BLOCO12:FIM é substituído por inteiro.
// Uso: node testes/gerar_bloco12_simplificado.js
const fs=require('fs'), path=require('path');
const RAIZ=path.resolve(__dirname,'..');
const completa=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8');
const arqSimpl=path.join(RAIZ,'simplificado','index.html');
let simpl=fs.readFileSync(arqSimpl,'utf8');

/* bloco 12 da completa: do JSON embutido ao </script> do bloco seguinte */
const ini=completa.indexOf('<script type="application/json" id="gruposFontePadrao">');
if(ini<0) throw new Error('gruposFontePadrao não encontrado na completa');
const iniBloco=completa.indexOf('<script>',ini), fim=completa.indexOf('</script>',iniBloco)+'</script>'.length;
let bloco=completa.slice(ini,fim);
/* trecho do modelo (codigoFonte, descricaoFonte, montarModeloGruposFonte) */
const modelo=/\/\* MODELO-GRUPOS-FONTE:INICIO[\s\S]*?\/\* MODELO-GRUPOS-FONTE:FIM \*\//.exec(completa)[0];

const trocar=(de,para)=>{ if(bloco.indexOf(de)<0) throw new Error('trecho não encontrado: '+de.slice(0,70)); bloco=bloco.split(de).join(para); };

trocar('   Grupos de fonte e seleção de colunas.\n',
  '   Grupos de fonte e seleção de colunas — versão simplificada.\n'+
  '   GERADO de ../index.html por testes/gerar_bloco12_simplificado.js: não editar\n'+
  '   aqui; alterar a completa e gerar de novo. Sem sessão: os grupos carregados\n'+
  '   valem enquanto a janela estiver aberta.\n');
/* auxiliares que a simplificada não tem, e o trecho do modelo */
trocar('/* Fontes distintas da base importada, como aparecem nela. */',
  '/* Auxiliares presentes na completa e ausentes aqui. */\n'+
  'function cyrb53(str,seed){\n'+
  '  let h1=0xdeadbeef^(seed||0), h2=0x41c6ce57^(seed||0);\n'+
  '  for(let i=0,ch;i<str.length;i++){ ch=str.charCodeAt(i); h1=Math.imul(h1^ch,2654435761); h2=Math.imul(h2^ch,1597334677); }\n'+
  '  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);\n'+
  '  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);\n'+
  '  return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);\n'+
  '}\n'+
  'function baixarBlob(blob,nome){\n'+
  '  const url=URL.createObjectURL(blob);\n'+
  '  const a=document.createElement(\'a\'); a.href=url; a.download=nome; document.body.appendChild(a); a.click(); a.remove();\n'+
  '  setTimeout(function(){ URL.revokeObjectURL(url); },4000);\n'+
  '}\n'+
  'function lerComoBuffer(file){\n'+
  '  return new Promise(function(ok,falha){\n'+
  '    const fr=new FileReader();\n'+
  '    fr.onload=function(){ ok(fr.result); };\n'+
  '    fr.onerror=function(){ falha(new Error(\'Não foi possível ler \'+file.name+\'.\')); };\n'+
  '    fr.readAsArrayBuffer(file);\n'+
  '  });\n'+
  '}\n'+modelo+'\n\n/* Fontes distintas da base importada, como aparecem nela. */');
trocar("fetch('modelos/grupos-fonte-modelo.xlsx')","fetch('../modelos/grupos-fonte-modelo.xlsx')");
trocar("'. Eles entram na próxima versão gravada da sessão.'","'. Valem enquanto a janela estiver aberta.'");
trocar("'Carregue os grupos de fonte em Configurações › Grupos de fonte para usar este filtro.'",
  "'Carregue os grupos de fonte (link “Carregar grupos de fonte”, junto do filtro) para usar este filtro.'");
trocar('o filtro Grupo de fonte fica desabilitado até o envio da planilha.','o filtro Grupo de fonte fica desabilitado até carregar a planilha.');
trocar("const PARES_FONTE={ panFonte:'panGrupoFonte', progFonte:'progGrupoFonte', fFonte:'fGrupoFonte',\n  sFonte:'sGrupoFonte', continFonte:'continGrupoFonte', adFonte:'adGrupoFonte' };",
  "const PARES_FONTE={ fFonte:'fGrupoFonte', bsFonte:'bsGrupoFonte' };");
trocar("const TABELAS_COLUNAS=['tabSaldo','tabInconsNP','tabProgramacao','tabCarCruzada','tabCarTop','tabEstagios',\n  'tabIntersecoes','tabClassificacao','tabDiag','tabAchado','tabTitulos','tabSaneamento','tabRodadas','tabManif',\n  'tabAntesDepois','tabQuadroMapp','tabContinuidade'];",
  "const TABELAS_COLUNAS=['tabEstagios','tabParametros','tabDiag','tabSaneada','tabExcluidos'];");
/* nomes de coluna do arquivo (linhasMapp, linhasExcluidos) → rótulo da grade */
trocar("const ALIAS_COLUNAS={\n  tabSaldo:function(k){ const m=/^EXERC\\. (\\d{4})/.exec(k); return m ? m[1] : (/^NP — /.test(k) ? 'NOVO PROGRAMADO 2027' : k); }\n};",
  "const ALIAS_COLUNAS={\n"+
  "  tabSaneada:function(k){\n"+
  "    const m=/^SALDO (\\d{4})( \\(= PROGRAMADO\\))?$/.exec(k); if(m) return m[2]?'PROG. '+m[1]:k;\n"+
  "    if(k==='REGRAS ATENDIDAS') return 'REGRA';\n"+
  "    if(k==='AÇÃO NA BASE SANEADA') return 'AÇÃO DO SANEAMENTO';\n"+
  "    if(/^PROGRAMADO APÓS \\d{4}/.test(k)) return 'PROGRAMADO FUTURO';\n"+
  "    return k;\n"+
  "  },\n"+
  "  tabExcluidos:function(k){ return { 'REGRAS ATENDIDAS':'REGRA', 'DATA DA EXCLUSÃO':'EXCLUÍDO EM' }[k] || k; }\n"+
  "};");
/* carga dos grupos por link junto do filtro (a simplificada não tem Configurações) */
trocar("  pintarGruposFonte();\n}\nif(document.readyState",
  "  const bc=$('#btnCarregarGruposFonte');\n"+
  "  if(bc && inp && !area){\n"+
  "    bc.addEventListener('click',function(ev){ ev.preventDefault(); inp.click(); });\n"+
  "    inp.addEventListener('change',function(){ const f=inp.files[0]; inp.value=''; importarGruposFonte(f); });\n"+
  "  }\n"+
  "  pintarGruposFonte();\n}\nif(document.readyState");

const novo='<!-- BLOCO12:INICIO (gerado por testes/gerar_bloco12_simplificado.js) -->\n'+bloco+'\n<!-- BLOCO12:FIM -->';
const re=/<!-- BLOCO12:INICIO[\s\S]*?<!-- BLOCO12:FIM -->/;
if(re.test(simpl)) simpl=simpl.replace(re,()=>novo);
else { const k=simpl.lastIndexOf('</body>'); if(k<0) throw new Error('</body> não encontrado'); simpl=simpl.slice(0,k)+novo+'\n'+simpl.slice(k); }
fs.writeFileSync(arqSimpl,simpl);
console.log('bloco 12 gerado na simplificada:',bloco.length,'caracteres');
