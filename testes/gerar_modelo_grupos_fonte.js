// Gera modelos/grupos-fonte-modelo.xlsx com o MESMO construtor do sistema
// (trecho MODELO-GRUPOS-FONTE do index.html) e as fontes da base real.
// Uso: node gerar_modelo_grupos_fonte.js [planilha.xlsx]
const fs=require('fs'), path=require('path');
const XLSX=require('xlsx'), ExcelJS=require('exceljs');
const RAIZ=path.resolve(__dirname,'..');

const html=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8');
const m=/\/\* MODELO-GRUPOS-FONTE:INICIO[\s\S]*?\/\* MODELO-GRUPOS-FONTE:FIM \*\//.exec(html);
if(!m) throw new Error('trecho MODELO-GRUPOS-FONTE não encontrado no index.html');
const { montarModeloGruposFonte, codigoFonte }=new Function(m[0]+'\nreturn { montarModeloGruposFonte, codigoFonte };')();

const base=process.argv[2]||path.join(RAIZ,'mapps-regis18-09.xlsx');
const wb=XLSX.readFile(base,{dense:true});
const aba=wb.SheetNames.find(s=>/base de dados/i.test(s))||wb.SheetNames[0];
const linhas=XLSX.utils.sheet_to_json(wb.Sheets[aba],{header:1,defval:null});
const i=linhas[0].findIndex(c=>/^FONTE$/i.test(String(c||'').trim()));
if(i<0) throw new Error('coluna FONTE não encontrada em '+aba);
const fontes=[...new Set(linhas.slice(1).map(l=>l[i]).filter(v=>v!=null&&String(v).trim()).map(String))];

montarModeloGruposFonte(ExcelJS,fontes).then(buf=>{
  const destino=path.join(RAIZ,'modelos','grupos-fonte-modelo.xlsx');
  fs.mkdirSync(path.dirname(destino),{recursive:true});
  fs.writeFileSync(destino,Buffer.from(buf));
  const cods=fontes.map(codigoFonte), rep=cods.filter((c,k)=>cods.indexOf(c)!==k);
  console.log(destino,'·',fontes.length,'fontes',rep.length?'· códigos repetidos: '+[...new Set(rep)].join(', '):'· códigos únicos');
});
