/** Opt-in study link collector. Ordinary app visits never contact UX-Lab. */
import {screens} from './screens/registry';
import './uxLab.css';

type Link={study:string;token:string;api:string};
type Visit={id:string;study:string;session:string;page:string;timestamp:number;vw:number;vh:number;context:{signature:string;scrolls:number[][]}};
type Click={id:string;study:string;session:string;seq:number;page:string;version:string;target:string;x:number;y:number;vw:number;vh:number;rw:number;rh:number;scroll_x:number;scroll_y:number;timestamp:number;context:{signature:string;scrolls:number[][];element:{label:string;rect:number[]}}};
type TaskEvent={id:string;study:string;session:string;kind:string;taskId:string;timestamp:number;page:string;vw:number;vh:number;value?:string;label?:string};
type Task={id:string;title:string;instruction:string};
type Attempt={taskId:string;title:string;scenario:string;ordinal:number;finishedAt:number|null;revision:string};
type Run={activeTaskId:string|null;finishedAt:number|null;finishedTasks:number;totalTasks:number;tasks:Attempt[]};
type Policy={enabled:boolean;roundClosedAt?:number|null;collectClicks:boolean;collectVisits:boolean;mode:'free'|'scenario';studyTitle:string;tasks:Task[]};
type Pending={kind:'visit';data:Visit}|{kind:'click';data:Click}|{kind:'task';data:TaskEvent};
const LINK_KEY='uxlab-biletberu-link-v1';
const routes=new Set(screens.flatMap(screen=>[screen.route,...(screen.states||[]).map(state=>state.route)]));
const uuid=()=>crypto.randomUUID();
const hash=(value:string)=>{let a=2166136261,b=3335557771;for(const char of value){a=Math.imul(a^char.charCodeAt(0),16777619);b=Math.imul(b^char.charCodeAt(0),2246822519);}return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0')};
const dimension=(value:number,min:number)=>Math.max(min,Math.round(value));
function linkFromUrl():Link|null{
  if(new URLSearchParams(location.search).has('ux_preview'))return null;
  const query=new URLSearchParams(location.search),fragment=new URLSearchParams(location.hash.slice(1));
  const study=query.get('ux_study'),token=fragment.get('ux_token'),api=fragment.get('ux_api');
  if(study&&token&&api){
    try{
      const parsed=new URL(api);
      if(!/^[a-zA-Z0-9_.:-]{1,120}$/.test(study)||!/^[a-f0-9]{64}$/.test(token)||parsed.protocol!=='https:'||parsed.hostname!=='dashboard-woad-one-64.vercel.app')return null;
      const link={study,token,api:parsed.origin};
      sessionStorage.setItem(LINK_KEY,JSON.stringify(link));
      history.replaceState(history.state,'',location.pathname+location.search);
      return link;
    }catch{return null;}
  }
  try{return JSON.parse(sessionStorage.getItem(LINK_KEY)||'null') as Link|null;}catch{return null;}
}
function page(){
  const base=import.meta.env.BASE_URL.replace(/\/$/,'');
  const path=location.pathname.slice(base.length).replace(/^\/app/,'')||'/main';
  return routes.has(path)?`bb-${path.slice(1).replaceAll('/','--')}`:null;
}
function context(){
  const scrolls:number[][]=[];
  if(scrollX||scrollY)scrolls.push([-1,Math.round(scrollX),Math.round(scrollY)]);
  return {signature:hash(`${page()}:${innerWidth}:${innerHeight}:${document.body.childElementCount}`),scrolls};
}
function targetInfo(element:Element){
  const target=element.closest('button,a,[role="button"],[role="link"],input,select,textarea')||element;
  const box=target.getBoundingClientRect();
  const label=target.tagName==='BUTTON'?'Кнопка':target.tagName==='A'?'Ссылка':target.matches('input,select,textarea')?'Поле ввода':'Область';
  const parts:string[]=[];let current:Element|null=target;
  for(let i=0;current&&i<4;i++,current=current.parentElement){
    const sibling=current.parentElement?[...current.parentElement.children].filter(item=>item.tagName===current!.tagName).indexOf(current):0;
    parts.push(`${current.tagName}:${sibling}`);
  }
  return {target:`el-${hash(parts.join('/'))}`,element:{label,rect:[box.left/innerWidth,box.top/innerHeight,box.width/innerWidth,box.height/innerHeight].map(value=>Math.max(0,Math.min(1,Math.round(value*10000)/10000)))}};
}
export function installMobileStudyCollector(){
  const link=linkFromUrl();if(!link)return;
  const {study,token,api}=link;
  const sessionKey=`uxlab-bb-session:${study}`,queueKey=`uxlab-bb-queue:${study}`;
  let session=sessionStorage.getItem(sessionKey);if(!session){session=uuid();sessionStorage.setItem(sessionKey,session);}
  let queue:Pending[]=[];try{queue=JSON.parse(sessionStorage.getItem(queueKey)||'[]') as Pending[];}catch{/* A corrupt tab queue starts empty. */}
  let enabled=false,clicks=false,visits=false,busy=false,lastPage='',sequence=Number(sessionStorage.getItem(`${sessionKey}:seq`)||'0');
  let policy:Policy|null=null,run:Run|null=null,panel:HTMLElement|null=null,dialog:HTMLDialogElement|null=null,shownTask='';
  try{run=JSON.parse(sessionStorage.getItem(`${sessionKey}:run`)||'null') as Run|null;}catch{/* Await the next task response. */}
  const persist=()=>{try{sessionStorage.setItem(queueKey,JSON.stringify(queue));}catch{/* Keep pending events in memory. */}};
  const headers={'Content-Type':'application/json','X-UXLab-Participant':token};
  const url=(path:string)=>`${api}${path}?study=${encodeURIComponent(study)}`;
  const taskEvent=(kind:string,value='',label='')=>{
    const current=page();if(!enabled||policy?.mode!=='scenario'||!current)return;
    if(kind==='started'&&run)return;
    if(kind!=='started'&&!run?.activeTaskId)return;
    const data:TaskEvent={id:uuid(),study,session,kind,taskId:kind==='started'?'':run?.activeTaskId||'',
      timestamp:Date.now(),page:current,vw:dimension(innerWidth,240),vh:dimension(innerHeight,200)};
    if(value)data.value=value;if(label)data.label=label.slice(0,200);
    queue.push({kind:'task',data});persist();void tick();
  };
  const renderTask=()=>{
    if(!enabled||policy?.mode!=='scenario'||!policy.tasks?.length){panel?.remove();panel=null;dialog=null;return;}
    if(!panel){
      panel=document.createElement('aside');panel.className='uxlab-study';panel.dataset.uxlabOverlay='true';
      panel.innerHTML='<button type="button" class="uxlab-study-open">Задание</button><dialog class="uxlab-study-dialog" aria-label="Задание исследования"><p class="uxlab-study-caption"></p><h2 class="uxlab-study-title"></h2><p class="uxlab-study-instruction"></p><p class="uxlab-study-status" role="status"></p><div class="uxlab-study-actions"><button type="button" class="uxlab-study-finish">Завершить задание</button><button type="button" class="uxlab-study-close">К приложению</button></div></dialog>';
      document.body.append(panel);dialog=panel.querySelector('dialog');
      panel.querySelector('.uxlab-study-open')?.addEventListener('click',()=>dialog?.showModal());
      panel.querySelector('.uxlab-study-close')?.addEventListener('click',()=>dialog?.close());
      panel.querySelector('.uxlab-study-finish')?.addEventListener('click',()=>{if(run?.activeTaskId&&!queue.some(item=>item.kind==='task'&&item.data.kind==='finished'))taskEvent('finished');renderTask();});
    }
    const attempt=run?.tasks.find(item=>item.taskId===run?.activeTaskId);
    const fallback=policy.tasks[0];
    const title=attempt?.title||fallback.title;
    const instruction=attempt?.scenario||fallback.instruction;
    const ordinal=attempt?.ordinal??0,total=run?.totalTasks||policy.tasks.length;
    const complete=Boolean(run&&!run.activeTaskId);
    panel.querySelector('.uxlab-study-open')!.textContent=complete?'Задания завершены':`Задание ${ordinal+1}/${total}`;
    panel.querySelector('.uxlab-study-caption')!.textContent=policy.studyTitle;
    panel.querySelector('.uxlab-study-title')!.textContent=complete?'Спасибо за участие':title;
    panel.querySelector('.uxlab-study-instruction')!.textContent=complete?'Все задания этого исследования завершены.':instruction;
    panel.querySelector('.uxlab-study-status')!.textContent=complete?'':run?`Выполнено ${run.finishedTasks} из ${total}`:'Загрузка задания…';
    (panel.querySelector('.uxlab-study-finish') as HTMLButtonElement).hidden=complete||!run?.activeTaskId;
    (panel.querySelector('.uxlab-study-finish') as HTMLButtonElement).disabled=queue.some(item=>item.kind==='task'&&item.data.kind==='finished');
    const key=attempt?`${attempt.taskId}:${attempt.revision}`:fallback.id;
    if(!complete&&key!==shownTask){shownTask=key;if(!dialog?.open)dialog?.showModal();}
  };
  const recordVisit=()=>{
    const current=page();if(!enabled||!current||current===lastPage)return;
    if(visits)queue.push({kind:'visit',data:{id:uuid(),study,session,page:current,timestamp:Date.now(),vw:dimension(innerWidth,240),vh:dimension(innerHeight,200),context:context()}});
    lastPage=current;persist();taskEvent('screen_visited');
  };
  const onClick=(event:MouseEvent)=>{
    const current=page();if(!enabled||!current||!(event.target instanceof Element)||event.target.closest('[data-uxlab-overlay]'))return;
    const info=targetInfo(event.target);
    taskEvent('element_clicked',info.target,info.element.label);
    if(!clicks)return;
    sequence++;sessionStorage.setItem(`${sessionKey}:seq`,String(sequence));
    const view=context();
    queue.push({kind:'click',data:{id:uuid(),study,session,seq:sequence,page:current,version:'biletberu-v1',target:info.target,
      x:Math.max(0,Math.min(1,event.clientX/innerWidth)),y:Math.max(0,Math.min(1,event.clientY/innerHeight)),
      vw:dimension(innerWidth,240),vh:dimension(innerHeight,200),rw:Math.min(10000,dimension(document.documentElement.scrollWidth,1)),
      rh:Math.min(50000,dimension(document.documentElement.scrollHeight,1)),scroll_x:scrollX,scroll_y:scrollY,
      timestamp:Date.now(),context:{...view,element:info.element}}});persist();
  };
  document.addEventListener('click',onClick,true);
  addEventListener('ux-success-signal',(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.kind==='prototype_event'&&typeof detail.value==='string'&&detail.value.length<=200)taskEvent('prototype_event',detail.value);});
  const afterNavigation=()=>requestAnimationFrame(()=>{recordVisit();});
  const push=history.pushState,replace=history.replaceState;
  history.pushState=function(...args){push.apply(this,args);afterNavigation();};
  history.replaceState=function(...args){replace.apply(this,args);afterNavigation();};
  addEventListener('popstate',afterNavigation);
  async function tick(){
    if(busy)return;busy=true;
    try{
      const response=await fetch(url('/api/project/config'),{headers,signal:AbortSignal.timeout(12000)});
      if(response.ok){
        policy=await response.json() as Policy;
        const wasEnabled=enabled;enabled=Boolean(policy.enabled&&!policy.roundClosedAt);
        clicks=enabled&&policy.collectClicks!==false;visits=enabled&&policy.collectVisits!==false;
        if(enabled&&!wasEnabled)lastPage='';
        recordVisit();
        if(enabled&&policy.mode==='scenario'&&!run&&!queue.some(item=>item.kind==='task'&&item.data.kind==='started'))taskEvent('started');
        renderTask();
      }else if(response.status===400||response.status===403||response.status===404){enabled=false;clicks=false;visits=false;}
      for(const item of [...queue].slice(0,25)){
        const path=item.kind==='visit'?'/api/project/visit':item.kind==='task'?'/api/project/task-events':'/api/heatmap/events';
        const body=item.kind==='visit'?item.data:{events:[item.data]};
        const sent=await fetch(url(path),{method:'POST',headers,body:JSON.stringify(item.kind==='task'?item.data:body),signal:AbortSignal.timeout(12000)});
        if(!sent.ok)break;
        if(item.kind==='task'){
          const result=await sent.json() as {run?:Run|null};
          const previous=run?.activeTaskId;
          if(result.run!==undefined){run=result.run;try{sessionStorage.setItem(`${sessionKey}:run`,JSON.stringify(run));}catch{/* Keep the task in memory. */}}
          if(run?.activeTaskId&&!previous)taskEvent('screen_visited');
        }
        queue=queue.filter(other=>other.data.id!==item.data.id);persist();
        if(item.kind==='task')renderTask();
      }
    }catch{/* Keep the queue until the API is available. */}
    finally{busy=false;}
  }
  setInterval(()=>void tick(),2000);addEventListener('online',()=>void tick());void tick();
}
