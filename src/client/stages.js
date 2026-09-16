function initStages(){
 const root=document.querySelector('[data-stage-browser]');if(!root)return;
 const catalog=root.dataset.stageBrowser==='catalog',items=[...root.querySelectorAll('[data-stage-item]')],grid=items[0]?.parentElement;
 const form=root.querySelector('form'),pager=root.querySelector('.stage-pagination'),status=root.querySelector('.stage-result');
 const size=Number(root.dataset.pageSize),defaultSort=catalog?'release':'newest';
 const defaults={q:'',album:'all',type:'all',year:'all',member:'all',sort:defaultSort,page:1};let state;
 function fromURL(){const q=new URLSearchParams(location.search);state={...defaults};for(const key in defaults)if(q.has(key))state[key]=q.get(key);state.page=Math.max(1,Number.parseInt(state.page,10)||1);for(const field of form.elements){if(!field.name)continue;if(field.tagName==='SELECT'&&![...field.options].some(o=>o.value===state[field.name]))state[field.name]=defaults[field.name];field.value=state[field.name];}if(!['all','broadcast','concert','live'].includes(state.type))state.type='all';}
 function updateURL(push){const url=new URL(location.href);for(const key in defaults){url.searchParams.delete(key);if(String(state[key])!==String(defaults[key]))url.searchParams.set(key,state[key]);}if(url.href!==location.href)history[push?'pushState':'replaceState'](null,'',url);}
 function render(push=false){
  const needle=state.q.toLowerCase().replace(/\s+/g,'');
  const matches=items.filter(item=>{const d=item.dataset;return catalog?(!needle||d.search.toLowerCase().replace(/\s+/g,'').includes(needle))&&(state.album==='all'||d.album===state.album):(state.type==='all'||d.type===state.type)&&(state.year==='all'||d.date.startsWith(state.year))&&(state.member==='all'||d.members.split('|').includes(state.member));});
  matches.sort((a,b)=>state.sort==='name'?a.dataset.name.localeCompare(b.dataset.name,'ko'):state.sort==='count'?Number(b.dataset.count)-Number(a.dataset.count)||a.dataset.name.localeCompare(b.dataset.name,'ko'):state.sort==='oldest'?a.dataset.date.localeCompare(b.dataset.date):b.dataset.date.localeCompare(a.dataset.date));
  const pages=Math.max(1,Math.ceil(matches.length/size));state.page=Math.min(state.page,pages);items.forEach(item=>item.hidden=true);
  matches.forEach((item,i)=>{grid.append(item);item.hidden=i<(state.page-1)*size||i>=state.page*size;});
  status.textContent=`${matches.length}${catalog?'곡':'개 무대'}${matches.length?' · '+state.page+' / '+pages+' 페이지':''}`;
  root.querySelector('.stage-empty').hidden=matches.length>0;
  root.querySelectorAll('[data-stage-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stageType===state.type)));
  const button=(p,label,disabled=false)=>`<button type="button" data-stage-page="${p}"${disabled?' disabled':''}${p===state.page&&!isNaN(Number(label))?' aria-current="page"':''}>${label}</button>`;
  pager.hidden=pages<=1;pager.innerHTML=pages<=1?'':button(state.page-1,'이전',state.page===1)+Array.from({length:pages},(_,i)=>button(i+1,String(i+1))).join('')+button(state.page+1,'다음',state.page===pages);updateURL(push);
 }
 form.addEventListener('submit',e=>e.preventDefault());
 form.addEventListener('input',e=>{if(e.target.type==='search'){state.q=e.target.value;state.page=1;render();}});
 form.addEventListener('change',e=>{if(e.target.tagName==='SELECT'){state[e.target.name]=e.target.value;state.page=1;render(true);}});
 root.addEventListener('click',e=>{const type=e.target.closest('[data-stage-type]'),page=e.target.closest('[data-stage-page]'),reset=e.target.closest('[data-stage-reset]');if(type){state.type=type.dataset.stageType;state.page=1;render(true);}if(page){state.page=Number(page.dataset.stagePage);render(true);status.tabIndex=-1;status.focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:'auto'});}if(reset){state={...defaults};for(const f of form.elements)if(f.name)f.value=state[f.name];render(true);}});
 window.addEventListener('popstate',()=>{fromURL();render();});fromURL();render();
}
module.exports={initStages};
