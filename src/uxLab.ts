/** Opt-in study link collector. Ordinary app visits never contact UX-Lab. */
import {screens} from './screens/registry';
import {createSnapshotSender} from './uxSnapshot';
import './uxLab.css';

type Link={study:string;token:string;api:string};
type Visit={id:string;study:string;session:string;page:string;timestamp:number;vw:number;vh:number;context:{signature:string;scrolls:number[][]}};
type Click={id:string;study:string;session:string;seq:number;page:string;version:string;target:string;x:number;y:number;vw:number;vh:number;rw:number;rh:number;scroll_x:number;scroll_y:number;timestamp:number;context:{signature:string;scrolls:number[][];snapshot?:string;element:{label:string;rect:number[]}}};
type TaskEvent={id:string;study:string;session:string;kind:string;taskId:string;timestamp:number;page:string;vw:number;vh:number;value?:string;label?:string};
type Verification={method:'automatic'|'manual';type?:'screen'|'element'|'event';value?:string;page?:string};
type Task={id:string;title:string;instruction:string;verification?:Verification};
type Attempt={taskId:string;title:string;scenario:string;ordinal:number;finishedAt:number|null;revision:string;status:string;verification?:Verification};
type Run={activeTaskId:string|null;finishedAt:number|null;finishedTasks:number;totalTasks:number;tasks:Attempt[]};
type Policy={enabled:boolean;roundClosedAt?:number|null;collectClicks:boolean;collectVisits:boolean;mode:'free'|'scenario';studyTitle:string;tasks:Task[]};
type Pending={kind:'visit';data:Visit}|{kind:'click';data:Click}|{kind:'task';data:TaskEvent;priority?:boolean};
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
  const handedSession=new URLSearchParams(location.hash.slice(1)).get('ux_session');
  let session=handedSession&&/^[a-f0-9-]{36}$/.test(handedSession)?handedSession:sessionStorage.getItem(sessionKey);
  if(!session)session=uuid();
  sessionStorage.setItem(sessionKey,session);
  const handedSequence=Number(new URLSearchParams(location.hash.slice(1)).get('ux_seq')||0);
  let sequence=Math.max(Number(sessionStorage.getItem(`${sessionKey}:seq`)||0),Number.isSafeInteger(handedSequence)&&handedSequence>=0?handedSequence:0);
  sessionStorage.setItem(`${sessionKey}:seq`,String(sequence));
  const linkedUrl=(input:string|URL)=>{
    const next=new URL(input,location.href);
    if(next.origin!==location.origin||!next.pathname.includes('/app/'))return input.toString();
    next.searchParams.set('ux_study',study);
    next.hash=new URLSearchParams({ux_token:token,ux_api:api,ux_session:session,ux_seq:String(sequence)}).toString();
    return next.pathname+next.search+next.hash;
  };
  history.replaceState(history.state,'',linkedUrl(location.href));
  const captureSnapshot=createSnapshotSender(study,api,token);
  let queue:Pending[]=[];try{queue=JSON.parse(sessionStorage.getItem(queueKey)||'[]') as Pending[];}catch{/* A corrupt tab queue starts empty. */}
  let enabled=false,clicks=false,visits=false,policyBusy=false,tasksBusy=false,backgroundBusy=false,lastPage='';
  let taskSaveFailed=false;
  let announcedPendingTask='';
  let policy:Policy|null=null,run:Run|null=null,panel:HTMLElement|null=null,dialog:HTMLDialogElement|null=null,shownTask='',completionDismissed=false;
  let highlightTimer:ReturnType<typeof setTimeout>|undefined;
  const bodyStyle=document.body.style;
  const previousLayout={height:bodyStyle.getPropertyValue('--app-height'),bar:bodyStyle.getPropertyValue('--uxlab-taskbar-height'),overflow:bodyStyle.overflow};
  const clearTaskbar=()=>{
    clearTimeout(highlightTimer);
    if(dialog?.open)dialog.close();panel?.remove();panel=null;dialog=null;shownTask='';
    for(const [name,value] of [['--app-height',previousLayout.height],['--uxlab-taskbar-height',previousLayout.bar]]){
      if(value)bodyStyle.setProperty(name,value);else bodyStyle.removeProperty(name);
    }
    bodyStyle.overflow=previousLayout.overflow;
  };
  try{run=JSON.parse(sessionStorage.getItem(`${sessionKey}:run`)||'null') as Run|null;}catch{/* Await the next task response. */}
  const persist=()=>{try{sessionStorage.setItem(queueKey,JSON.stringify(queue));}catch{/* Keep pending events in memory. */}};
  const headers={'Content-Type':'application/json','X-UXLab-Participant':token};
  const url=(path:string)=>`${api}${path}?study=${encodeURIComponent(study)}`;
  const telegram=/Telegram/i.test(navigator.userAgent)||/https?:\/\/(?:t\.me|telegram\.me|telegram\.org)\b/i.test(document.referrer)||'TelegramWebviewProxy' in window;
  if(telegram&&!sessionStorage.getItem(`${sessionKey}:browser-tip`)){
    const banner=document.createElement('aside');banner.className='uxlab-browser-tip';banner.dataset.uxlabOverlay='true';
    banner.innerHTML='<p>Для большего экрана откройте меню Telegram и выберите «Открыть в браузере».</p><div><button type="button" data-copy>Скопировать ссылку</button><button type="button" data-close>Продолжить здесь</button></div>';
    document.body.append(banner);
    banner.querySelector('[data-copy]')?.addEventListener('click',async()=>{
      const full=new URL(linkedUrl(location.href),location.origin).href;
      try{await navigator.clipboard.writeText(full);banner.querySelector('[data-copy]')!.textContent='Ссылка скопирована';}
      catch{prompt('Скопируйте ссылку и откройте её в браузере',full);}
    });
    banner.querySelector('[data-close]')?.addEventListener('click',()=>{sessionStorage.setItem(`${sessionKey}:browser-tip`,'1');banner.remove();});
  }
  const activeVerification=()=>run?.tasks.find(item=>item.taskId===run?.activeTaskId)?.verification;
  const matchesSuccess=(data:TaskEvent)=>{
    const check=activeVerification();
    if(check?.method!=='automatic'||data.taskId!==run?.activeTaskId)return false;
    if(data.kind==='screen_visited')return check.type==='screen'&&check.value===data.page&&check.page===data.page;
    if(data.kind==='element_clicked')return check.type==='element'&&check.value===data.value&&check.page===data.page;
    return data.kind==='prototype_event'&&check.type==='event'&&check.value===data.value&&!check.page;
  };
  // Persist priority with the event: later tasks must never reinterpret an old action.
  // Legacy queues without this field retain their original task-event ordering.
  const urgent=(item:Pending)=>item.kind==='task'&&item.priority!==false;
  const taskEvent=(kind:string,value='',label='')=>{
    const current=page(),scenario=policy?.mode==='scenario';
    const catalogSignal=kind==='screen_visited'||kind==='element_clicked'||kind==='prototype_event';
    if(!enabled||!current||(!scenario&&!catalogSignal))return;
    if(kind==='started'&&run)return;
    if(scenario&&kind!=='started'&&!run?.activeTaskId)return;
    const data:TaskEvent={id:uuid(),study,session,kind,taskId:scenario&&kind!=='started'?run?.activeTaskId||'':'',
      timestamp:Date.now(),page:current,vw:dimension(innerWidth,240),vh:dimension(innerHeight,200)};
    if(value)data.value=value;if(label)data.label=label.slice(0,200);
    const priority=!catalogSignal||(scenario&&(!activeVerification()||matchesSuccess(data)));
    queue.push({kind:'task',data,priority});persist();renderTask();
    void flushTasks();void flushBackground();
  };
  const skipTask=()=>{
    if(run?.activeTaskId&&!queue.some(item=>item.kind==='task'&&item.data.taskId===run?.activeTaskId&&['finished','skipped'].includes(item.data.kind)))taskEvent('skipped');
    renderTask();
  };
  const renderTask=()=>{
    if(!enabled||policy?.mode!=='scenario'||!policy.tasks?.length||completionDismissed){if(panel)clearTaskbar();return;}
    const completed=Boolean(run&&!run.activeTaskId);
    if(!panel){
      panel=document.createElement('aside');panel.className='uxlab-study';panel.dataset.uxlabOverlay='true';panel.dataset.uxlabTaskbar='true';
      panel.innerHTML='<button type="button" class="uxlab-study-open" aria-haspopup="dialog"><span class="uxlab-study-count"></span><span class="uxlab-study-goal">Загрузка задания…</span></button><button type="button" class="uxlab-study-skip">Пропустить</button><span class="uxlab-study-announcement" role="status" aria-live="polite" aria-atomic="true"></span><dialog class="uxlab-study-dialog" aria-label="Задание исследования"><h2 class="uxlab-study-title"></h2><p class="uxlab-study-instruction"></p><p class="uxlab-study-status" role="status"></p><div class="uxlab-study-actions"><button type="button" class="uxlab-study-finish">Завершить задание</button><button type="button" class="uxlab-study-close">К приложению</button></div></dialog>';
      bodyStyle.setProperty('--uxlab-taskbar-height','40px');
      bodyStyle.setProperty('--app-height','calc(100dvh - var(--uxlab-taskbar-height))');
      bodyStyle.overflow='hidden';
      document.body.insertBefore(panel,document.getElementById('root'));dialog=panel.querySelector('dialog');
      panel.querySelector('.uxlab-study-open')?.addEventListener('click',()=>dialog?.showModal());
      panel.querySelector('.uxlab-study-skip')?.addEventListener('click',skipTask);
      panel.querySelector('.uxlab-study-close')?.addEventListener('click',()=>{dialog?.close();if(run&&!run.activeTaskId){completionDismissed=true;clearTaskbar();}});
      panel.querySelector('.uxlab-study-finish')?.addEventListener('click',()=>{
        const attempt=run?.tasks.find(item=>item.taskId===run?.activeTaskId);
        if(run?.activeTaskId&&!queue.some(item=>item.kind==='task'&&item.data.taskId===run?.activeTaskId&&['finished','skipped'].includes(item.data.kind))) taskEvent(attempt?.verification?.method==='automatic'?'skipped':'finished');
        renderTask();
      });
    }
    const attempt=run?.tasks.find(item=>item.taskId===run?.activeTaskId);
    const fallback=policy.tasks[0];
    const title=attempt?.title||fallback.title;
    const instruction=attempt?.scenario||fallback.instruction;
    const ordinal=attempt?.ordinal??0,total=run?.totalTasks||policy.tasks.length;
    if(completed&&run){
      const succeeded=run.tasks.filter(task=>task.status==='succeeded').length,skipped=run.tasks.filter(task=>task.status==='skipped').length;
      panel.querySelector('.uxlab-study-count')!.textContent='';
      panel.querySelector('.uxlab-study-goal')!.textContent='Тест завершён';
      panel.querySelector('.uxlab-study-open')!.setAttribute('aria-label','Открыть результаты прохождения');
      (panel.querySelector('.uxlab-study-skip') as HTMLButtonElement).hidden=true;
      panel.querySelector('.uxlab-study-title')!.textContent='Спасибо за участие!';
      panel.querySelector('.uxlab-study-instruction')!.textContent=`Все ${total} заданий пройдены. Результаты сохранены.`;
      (panel.querySelector('.uxlab-study-instruction') as HTMLElement).hidden=false;
      panel.querySelector('.uxlab-study-status')!.textContent=`Выполнено ${succeeded} из ${total}`+(skipped?` · Пропущено ${skipped}`:'');
      (panel.querySelector('.uxlab-study-finish') as HTMLButtonElement).hidden=true;
      if(shownTask!=='complete'){shownTask='complete';if(!dialog?.open)dialog?.showModal();}
      return;
    }
    panel.querySelector('.uxlab-study-count')!.textContent=`${ordinal+1}/${total}`;
    const successPending=queue.some(item=>item.kind==='task'&&matchesSuccess(item.data));
    panel.querySelector('.uxlab-study-goal')!.textContent=successPending?(taskSaveFailed?'✓ Действие выполнено · повторяем сохранение…':'✓ Выполнено · сохраняем…'):title;
    if(successPending&&announcedPendingTask!==run?.activeTaskId){
      announcedPendingTask=run?.activeTaskId||'';
      panel.querySelector('.uxlab-study-announcement')!.textContent='Задание выполнено. Сохраняем результат.';
    }else if(!successPending)announcedPendingTask='';
    panel.querySelector('.uxlab-study-open')!.setAttribute('aria-label',`Задание ${ordinal+1} из ${total}: ${title}. Открыть подробности`);
    panel.querySelector('.uxlab-study-title')!.textContent=title;
    panel.querySelector('.uxlab-study-instruction')!.textContent=instruction;
    (panel.querySelector('.uxlab-study-instruction') as HTMLElement).hidden=instruction.trim().replace(/\s+/g,' ')===title.trim().replace(/\s+/g,' ');
    const automatic=(attempt?.verification??fallback.verification)?.method==='automatic';
    const pending=successPending||queue.some(item=>item.kind==='task'&&item.data.taskId===run?.activeTaskId&&['finished','skipped'].includes(item.data.kind));
    panel.querySelector('.uxlab-study-status')!.textContent=pending?'Сохраняем переход. Если нет связи, повторим автоматически…':!run?'Загрузка задания…':automatic?'Задание завершится автоматически, когда вы выполните действие.':`Завершено ${run.finishedTasks} из ${total}`;
    const finish=panel.querySelector('.uxlab-study-finish') as HTMLButtonElement;
    finish.textContent=automatic?'Пропустить':'Завершить задание';
    finish.hidden=!run?.activeTaskId;
    finish.disabled=pending;
    const skip=panel.querySelector('.uxlab-study-skip') as HTMLButtonElement;
    skip.hidden=false;
    skip.disabled=!run?.activeTaskId||pending;
    skip.textContent=pending?'Сохраняем…':'Пропустить';
    const key=attempt?`${attempt.taskId}:${attempt.revision}`:fallback.id;
    if(key!==shownTask){
      const previous=shownTask;shownTask=key;
      if(dialog?.open)dialog.close();
      panel.querySelector('.uxlab-study-announcement')!.textContent=`Задание ${ordinal+1} из ${total}. ${title}`;
      if(previous){
        const currentPanel=panel;
        clearTimeout(highlightTimer);
        currentPanel.removeAttribute('data-task-changed');
        requestAnimationFrame(()=>{currentPanel.dataset.taskChanged='true';highlightTimer=setTimeout(()=>currentPanel.removeAttribute('data-task-changed'),900);});
      }
    }
  };
  const recordVisit=()=>{
    const current=page();if(!enabled||!current||current===lastPage)return;
    if(visits)queue.push({kind:'visit',data:{id:uuid(),study,session,page:current,timestamp:Date.now(),vw:dimension(innerWidth,240),vh:dimension(innerHeight,200),context:context()}});
    lastPage=current;persist();taskEvent('screen_visited');
    if(['bb-plan','bb-plan--add','bb-no-ticket'].includes(current))taskEvent('prototype_event','planning_opened');
    void flushBackground();
  };
  const onClick=(event:MouseEvent)=>{
    const current=page();if(!enabled||!current||!(event.target instanceof Element)||event.target.closest('[data-uxlab-overlay]'))return;
    const info=targetInfo(event.target);
    taskEvent('element_clicked',info.target,info.element.label);
    if(!clicks)return;
    sequence++;sessionStorage.setItem(`${sessionKey}:seq`,String(sequence));
    history.replaceState(history.state,'',location.href);
    const view=context(),snapshot=captureSnapshot();
    queue.push({kind:'click',data:{id:uuid(),study,session,seq:sequence,page:current,version:'biletberu-v1',target:info.target,
      x:Math.max(0,Math.min(1,event.clientX/innerWidth)),y:Math.max(0,Math.min(1,event.clientY/innerHeight)),
      vw:dimension(innerWidth,240),vh:dimension(innerHeight,200),rw:Math.min(10000,dimension(document.documentElement.scrollWidth,1)),
      rh:Math.min(50000,dimension(document.documentElement.scrollHeight,1)),scroll_x:scrollX,scroll_y:scrollY,
      timestamp:Date.now(),context:{...view,...(snapshot?{snapshot}:{}),element:info.element}}});persist();void flushBackground();
  };
  document.addEventListener('click',onClick,true);
  addEventListener('ux-success-signal',(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.kind==='prototype_event'&&typeof detail.value==='string'&&detail.value.length<=200)taskEvent('prototype_event',detail.value);});
  const afterNavigation=()=>requestAnimationFrame(()=>{recordVisit();});
  const push=history.pushState,replace=history.replaceState;
  history.pushState=function(data,unused,url){push.call(this,data,unused,url?linkedUrl(url):url);afterNavigation();};
  history.replaceState=function(data,unused,url){replace.call(this,data,unused,url?linkedUrl(url):url);afterNavigation();};
  addEventListener('popstate',afterNavigation);
  async function refreshPolicy(){
    if(policyBusy)return;policyBusy=true;
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
      void flushTasks();void flushBackground();
    }catch{/* The last known policy remains usable while the request is retried. */}
    finally{policyBusy=false;}
  }
  async function send(item:Pending){
    const path=item.kind==='visit'?'/api/project/visit':item.kind==='task'?'/api/project/task-events':'/api/heatmap/events';
    const body=item.kind==='click'?{events:[item.data]}:item.data;
    const sent=await fetch(url(path),{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
    if(!sent.ok)throw new Error('Study event not saved');
    return item.kind==='task'?await sent.json() as {run?:Run|null;paused?:boolean}:{};
  }
  async function flushTasks(){
    if(tasksBusy||!policy||!enabled)return;tasksBusy=true;
    try{
      let item:Pending|undefined;
      while(enabled&&(item=queue.find(urgent))){
        const result=await send(item);
        const previous=run?.activeTaskId;
        if(result.run!==undefined){run=result.run;try{sessionStorage.setItem(`${sessionKey}:run`,JSON.stringify(run));}catch{/* Keep the task in memory. */}}
        const savedId=item.data.id;
        queue=queue.filter(other=>other.data.id!==savedId);persist();taskSaveFailed=false;
        if(result.paused){enabled=false;clicks=false;visits=false;}
        renderTask();
        if(run?.activeTaskId&&!previous)taskEvent('screen_visited');
      }
    }catch{taskSaveFailed=true;renderTask();/* Durable queue retries on the timer or online event. */}
    finally{tasksBusy=false;void flushBackground();}
  }
  async function flushBackground(){
    if(backgroundBusy||tasksBusy||!policy||!enabled||queue.some(urgent))return;backgroundBusy=true;
    try{
      // Analytics never hold up a task transition. A late catalog response must
      // not overwrite the newer run already returned by the priority request.
      for(let count=0;count<25&&!tasksBusy&&!queue.some(urgent);count++){
        const item=queue.find(other=>!urgent(other));if(!item)break;
        await send(item);
        queue=queue.filter(other=>other.data.id!==item.data.id);persist();
      }
    }catch{/* Keep analytics in the durable queue without blocking task progress. */}
    finally{backgroundBusy=false;}
  }
  const tick=()=>{void refreshPolicy();void flushTasks();void flushBackground();};
  setInterval(tick,2000);addEventListener('online',tick);tick();
}
