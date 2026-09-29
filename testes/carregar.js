// Carrega index.html no jsdom, importa a planilha real e expõe `win` para os testes.
const fs=require('fs'), path=require('path');
const { JSDOM }=require('jsdom');
const XLSX=require('xlsx');
const RAIZ=path.resolve(__dirname,'..');

async function carregar(pagina){
  pagina=pagina||'index.html';
  let html=fs.readFileSync(path.join(RAIZ,pagina),'utf8');
  html=html.replace(/<script src="[^"]*"><\/script>/g,'');
  const dom=new JSDOM(html,{ runScripts:'dangerously', pretendToBeVisual:true, url:'http://127.0.0.1/'+pagina,
    beforeParse(w){
      const X=Object.create(XLSX);
      X.read=function(d,o){
        if(d && typeof d.byteLength==='number'){
          const u = d.buffer ? new Uint8Array(d.buffer,d.byteOffset||0,d.byteLength) : new Uint8Array(d);
          d=Buffer.from(u); o=Object.assign({},o,{type:'buffer'});
        }
        return XLSX.read(d,o);
      };
      w.XLSX=X;
      /* ExcelJS e JSZip (CDN no navegador) para as planilhas de manifestação */
      try{ w.ExcelJS=require('exceljs'); w.JSZip=require('jszip'); }catch(e){}
      /* presentes em todo navegador, ausentes no jsdom */
      if(!w.TextEncoder){ const u=require('util'); w.TextEncoder=u.TextEncoder; w.TextDecoder=u.TextDecoder; }
      w.matchMedia=w.matchMedia||function(){ return { matches:false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }; };
      w.IntersectionObserver=function(){ return { observe(){}, disconnect(){}, unobserve(){} }; };
      w.ResizeObserver=function(){ return { observe(){}, disconnect(){}, unobserve(){} }; };
      /* No jsdom, querySelector('#id') percorre a página inteira a cada chamada; com a página
         cheia, as leituras por MAPP levavam minutos. Vai direto ao getElementById. */
      const qs=w.Document.prototype.querySelector;
      w.Document.prototype.querySelector=function(s){ return /^#[\w-]+$/.test(s) ? this.getElementById(s.slice(1)) : qs.call(this,s); };
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.scrollTo=function(){}; w.scrollBy=function(){};
      w.__erros=[];
      w.addEventListener('error',function(e){ w.__erros.push(String(e.message||e.error)); });
      w.console.error=function(){ w.__erros.push(Array.prototype.map.call(arguments,String).join(' ')); };
      w.console.warn=function(){};
    }});
  const win=dom.window;
  await new Promise(r=>setTimeout(r,500));
  const buf=fs.readFileSync(path.join(RAIZ,'mapps-regis18-09.xlsx'));
  const file=new win.File([buf],'mapps-regis18-09.xlsx');
  win.selecionarArquivo(file);
  const t0=Date.now();
  await new Promise(r=>setTimeout(r,200));
  while(win.eval('E.importando') && Date.now()-t0<600000) await new Promise(r=>setTimeout(r,500));
  return win;
}
module.exports={ carregar };
