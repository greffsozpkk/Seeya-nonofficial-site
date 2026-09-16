function initConcerts(){
 const detail=document.querySelector('[data-concert-detail]');
 if(detail){
  const panels=[...detail.querySelectorAll('[data-concert-panel]')];
  let event,view;
  function render(push=false){
   panels.forEach(p=>{p.hidden=p.dataset.concertPanel!==event;p.querySelectorAll('[data-concert-content]').forEach(s=>s.hidden=s.dataset.concertContent!==view);});
   detail.querySelectorAll('[data-concert-event]').forEach(a=>{a.href='?'+new URLSearchParams({event:a.dataset.concertEvent,view});a.classList.toggle('active',a.dataset.concertEvent===event);if(a.dataset.concertEvent===event)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
   detail.querySelectorAll('[data-concert-view]').forEach(a=>{a.href='?'+new URLSearchParams({event,view:a.dataset.concertView});a.classList.toggle('active',a.dataset.concertView===view);if(a.dataset.concertView===view)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
   const panel=panels.find(p=>p.dataset.concertPanel===event);detail.querySelector('[role=status]').textContent=panel.dataset.label+' · '+(view==='record'?'공연 기록':'영상·자료');
   const url=new URL(location.href);url.searchParams.set('event',event);if(view==='record')url.searchParams.delete('view');else url.searchParams.set('view',view);if(url.href!==location.href)history[push?'pushState':'replaceState'](null,'',url);
  }
  function restore(){const q=new URLSearchParams(location.search);event=panels.some(p=>p.dataset.concertPanel===q.get('event'))?q.get('event'):detail.dataset.initialEvent;view=q.get('view')==='media'?'media':'record';render();}
  detail.addEventListener('click',e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const region=e.target.closest('[data-concert-event]'),tab=e.target.closest('[data-concert-view]');if(!region&&!tab)return;e.preventDefault();if(region)event=region.dataset.concertEvent;if(tab)view=tab.dataset.concertView;render(true);});
  window.addEventListener('popstate',restore);restore();
 }
 const root=document.querySelector('[data-concert-library]');if(!root)return;
 const cards=[...root.querySelectorAll('[data-concert-card]')],grid=root.querySelector('.concert-grid'),form=root.querySelector('form'),pager=root.querySelector('.concert-pagination'),status=root.querySelector('[role=status]');
 const defaults={q:'',category:'all',year:'all',sort:'recommended',page:1};let state;
 function render(push=false){
  const q=state.q.toLowerCase().replace(/\s+/g,'');const found=cards.filter(c=>(!q||c.dataset.search.toLowerCase().replace(/\s+/g,'').includes(q))&&(state.category==='all'||c.dataset.category===state.category)&&(state.year==='all'||c.dataset.years.split('|').includes(state.year)));
  found.sort((a,b)=>state.sort==='newest'?b.dataset.last.localeCompare(a.dataset.last):state.sort==='oldest'?a.dataset.date.localeCompare(b.dataset.date):Number(a.dataset.order)-Number(b.dataset.order));
  const pages=Math.max(1,Math.ceil(found.length/9));state.page=Math.min(pages,state.page);cards.forEach(c=>c.hidden=true);found.forEach((c,i)=>{grid.append(c);c.hidden=i<(state.page-1)*9||i>=state.page*9;});
  status.textContent=found.length+'개 기록관'+(found.length?' · '+state.page+' / '+pages+' 페이지':'');root.querySelector('.concert-empty').hidden=found.length>0;pager.hidden=pages<=1;
  const button=(p,label,disabled)=>`<button type="button" data-concert-page="${p}"${disabled?' disabled':''}${String(p)===label&&p===state.page?' aria-current="page"':''}>${label}</button>`;
  pager.innerHTML=pages<=1?'':button(state.page-1,'이전',state.page===1)+Array.from({length:pages},(_,i)=>button(i+1,String(i+1))).join('')+button(state.page+1,'다음',state.page===pages);
  const url=new URL(location.href);for(const k in defaults){url.searchParams.delete(k);if(String(state[k])!==String(defaults[k]))url.searchParams.set(k,state[k]);}if(url.href!==location.href)history[push?'pushState':'replaceState'](null,'',url);
 }
 function restore(){const q=new URLSearchParams(location.search);state={...defaults};for(const k in defaults)if(q.has(k))state[k]=q.get(k);state.page=Math.max(1,parseInt(state.page,10)||1);for(const f of form.elements){if(!f.name)continue;if(f.tagName==='SELECT'&&![...f.options].some(o=>o.value===state[f.name]))state[f.name]=defaults[f.name];f.value=state[f.name];}render();}
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',e=>{if(e.target.name==='q'){state.q=e.target.value;state.page=1;render();}});form.addEventListener('change',e=>{if(e.target.tagName==='SELECT'){state[e.target.name]=e.target.value;state.page=1;render(true);}});
 root.addEventListener('click',e=>{const reset=e.target.closest('[data-concert-reset]'),page=e.target.closest('[data-concert-page]');if(reset){state={...defaults};for(const f of form.elements)if(f.name)f.value=state[f.name];render(true);}if(page){state.page=Number(page.dataset.concertPage);render(true);status.tabIndex=-1;status.focus({preventScroll:true});root.scrollIntoView({block:'start'});}});window.addEventListener('popstate',restore);restore();
}
module.exports={initConcerts};
