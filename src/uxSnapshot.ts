/** Save an inert, redacted copy of the visible app state at a click. */
type Snapshot={id:string;study:string;html:string;width:number;height:number};
const MAX_BYTES=4*1024*1024;
const hash=(value:string)=>{let a=2166136261,b=3335557771;for(const char of value){a=Math.imul(a^char.charCodeAt(0),16777619);b=Math.imul(b^char.charCodeAt(0),2246822519);}return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0')};
const absoluteAssetUrls=(value:string)=>value.replace(/url\(\s*(["']?)(\/assets\/[^"')\s]+)\1\s*\)/g,(_match,_quote,path)=>`url("${location.origin}${path}")`);

export function createSnapshotSender(study:string,api:string,token:string){
  const typed=new Set<string>(),pending=new Map<string,Snapshot>();
  document.addEventListener('input',event=>{
    const field=event.target;
    if((field instanceof HTMLInputElement||field instanceof HTMLTextAreaElement)&&field.value)typed.add(field.value);
  },true);
  const database=new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open(`uxlab-bb-snapshots:${study}`,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('pending',{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  }).catch(()=>null);
  let flushing=false;
  async function flush(){
    if(flushing)return;flushing=true;
    try{
      const db=await database;
      const saved=db?await new Promise<Snapshot[]>((resolve,reject)=>{
        const request=db.transaction('pending').objectStore('pending').getAll();
        request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
      }):[];
      for(const item of new Map([...saved,...pending.values()].map(entry=>[entry.id,entry])).values()){
        try{
          const response=await fetch(`${api}/api/heatmap/snapshots?study=${encodeURIComponent(study)}`,{
            method:'POST',headers:{'Content-Type':'application/json','X-UXLab-Participant':token},
            body:JSON.stringify(item),signal:AbortSignal.timeout(12000)});
          if(response.status===400||response.status===413){
            pending.delete(item.id);
            db?.transaction('pending','readwrite').objectStore('pending').delete(item.id);
            continue;
          }
          if(!response.ok)break;
          pending.delete(item.id);
          db?.transaction('pending','readwrite').objectStore('pending').delete(item.id);
        }catch{break;}
      }
    }catch{/* Retry when storage or network is available. */}
    finally{flushing=false;}
  }
  setInterval(()=>void flush(),3000);addEventListener('online',()=>void flush());
  void flush();

  return function capture():string|undefined{
    try{
      const source=document.body,clone=source.cloneNode(true) as HTMLBodyElement;
      const originals=[source,...source.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
      const secrets=new Set(typed);
      originals.forEach((element,index)=>{
        const copy=copies[index];
        if(element instanceof HTMLInputElement||element instanceof HTMLTextAreaElement){
          if(element.value)secrets.add(element.value);
          copy.removeAttribute('value');
          if(copy instanceof HTMLInputElement){copy.value='';copy.removeAttribute('checked');}
          if(copy instanceof HTMLTextAreaElement){copy.value='';copy.textContent='';}
        }
        if(element instanceof HTMLElement&&(element.scrollTop||element.scrollLeft))
          copy.setAttribute('data-ux-scroll',`${element.scrollLeft},${element.scrollTop}`);
        if(copy instanceof HTMLElement){
          copy.style.fontFamily=getComputedStyle(element).fontFamily;
          const style=copy.getAttribute('style');
          if(style)copy.setAttribute('style',absoluteAssetUrls(style));
        }
        for(const attribute of [...copy.attributes])
          if(attribute.name.startsWith('on')||['srcdoc','action','formaction','autofocus','value'].includes(attribute.name))copy.removeAttribute(attribute.name);
        if(copy instanceof HTMLAnchorElement)copy.removeAttribute('href');
        if(copy instanceof HTMLImageElement){copy.src=element instanceof HTMLImageElement?element.currentSrc||element.src:copy.src;copy.removeAttribute('srcset');}
      });
      const taskbar=clone.querySelector('[data-uxlab-taskbar]');
      if(taskbar){
        const spacer=document.createElement('div');
        spacer.dataset.uxlabSpacer='true';
        spacer.style.cssText='height:var(--uxlab-taskbar-height);width:min(100%,430px);margin:0 auto;background:var(--color-background-secondary)';
        const liveTaskbar=source.querySelector('[data-uxlab-taskbar]');
        if(liveTaskbar)spacer.style.backgroundColor=getComputedStyle(liveTaskbar).backgroundColor;
        taskbar.replaceWith(spacer);
      }
      clone.querySelectorAll('script,style,link,iframe,object,embed,meta,base,[data-uxlab-overlay],[data-ux-private],[contenteditable]').forEach(element=>element.remove());
      const hidden=[...secrets].filter(value=>value.trim()).sort((a,b)=>b.length-a.length);
      const redact=(text:string)=>hidden.reduce((result,value)=>result.split(value).join('•••'),text);
      const walker=document.createTreeWalker(clone,NodeFilter.SHOW_TEXT);
      while(walker.nextNode())walker.currentNode.textContent=redact(walker.currentNode.textContent||'');
      clone.querySelectorAll('*').forEach(element=>{
        for(const attribute of [...element.attributes]){
          if(['title','aria-label','aria-description','placeholder'].includes(attribute.name))
            element.setAttribute(attribute.name,redact(attribute.value));
        }
      });
      let css='';
      for(const sheet of [...document.styleSheets])try{css += [...sheet.cssRules].map(rule=>rule.cssText).join('\n');}catch{/* Ignore cross-origin CSS. */}
      css=css.replace(/url\((['"]?)(?!data:|https?:|#)([^)'"\s]+)\1\)/g,(_all,quote,path)=>`url(${quote}${new URL(path,location.origin).href}${quote})`);
      css+='\n*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html,body{overflow:hidden!important}';
      const html=`<!doctype html><html><head><meta charset="utf-8"><style>${css.replace(/<\/style/gi,'<\\/style')}</style></head>${clone.outerHTML}</html>`;
      const item={id:`s3-${hash(`${innerWidth}:${innerHeight}:${html}`)}`,study,html,width:innerWidth,height:innerHeight};
      if(new TextEncoder().encode(JSON.stringify(item)).length>MAX_BYTES)return undefined;
      pending.set(item.id,item);
      void database.then(db=>{db?.transaction('pending','readwrite').objectStore('pending').put(item);}).catch(()=>{});
      void flush();
      return item.id;
    }catch{return undefined;}
  };
}
