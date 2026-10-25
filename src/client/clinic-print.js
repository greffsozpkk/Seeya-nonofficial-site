'use strict';

const ROOT_ID='clinicPrintRoot';

function printClone(node){
 const clone=node.cloneNode(true);
 for(const el of [clone,...clone.querySelectorAll('*')]){
  el.removeAttribute('id');
  el.removeAttribute('tabindex');
  el.removeAttribute('aria-labelledby');
 }
 return clone;
}

function makePage(doc,number){
 const sheet=doc.createElement('section');sheet.className='clinic-print-sheet';sheet.dataset.page=String(number);
 const flow=doc.createElement('div');flow.className='clinic-print-flow';
 const content=doc.createElement('article');content.className='clinic-print-content';flow.append(content);
 const footer=doc.createElement('footer');footer.className='clinic-print-page-number';
 const label=doc.createElement('span');label.textContent=number===1?'씨야 과몰입 진단서 · 성향과 점수':'씨야 과몰입 진단서 · 해설과 처방';
 const count=doc.createElement('span');count.textContent=number+' / 2';footer.append(label,count);sheet.append(flow,footer);
 return {sheet,flow,content};
}

function fitPage(page){
 const {sheet,flow,content}=page;
 content.style.transform='none';content.style.marginLeft='0';sheet.classList.remove('clinic-print-dense');
 const available=flow.clientHeight;
 if(!available)return;
 let natural=content.getBoundingClientRect().height;
 if(natural>available){
  sheet.classList.add('clinic-print-dense');natural=content.getBoundingClientRect().height;
 }
 const scale=Math.min(1,(available-1)/Math.max(1,natural));
 // Scale only a complete page, never cut its content into another page.
 content.style.transform='scale('+scale+')';
 content.style.marginLeft=((flow.clientWidth*(1-scale))/2)+'px';
 sheet.dataset.scale=scale.toFixed(4);
 sheet.dataset.contentHeight=String(Math.ceil(natural));
 sheet.dataset.availableHeight=String(available);
}

function prepare(certificate){
 if(!certificate?.querySelector('.clinic-profile'))throw Error('진단서를 먼저 발급한 뒤 인쇄해 주세요.');
 const doc=certificate.ownerDocument;
 doc.getElementById(ROOT_ID)?.remove();
 const root=doc.createElement('div');root.id=ROOT_ID;root.className='clinic-print-root';root.setAttribute('aria-hidden','true');
 const pages=[makePage(doc,1),makePage(doc,2)];
 let second=false;
 for(const node of certificate.children){
  if(node.matches('.clinic-profile'))second=true;
  pages[second?1:0].content.append(printClone(node));
 }
 const masthead=certificate.querySelector('.clinic-masthead'),patient=certificate.querySelector('.clinic-patient'),type=certificate.querySelector('.clinic-type-title');
 const continuation=doc.createElement('header');continuation.className='clinic-print-continuation';
 if(masthead)continuation.append(printClone(masthead));
 const title=doc.createElement('h2');title.textContent='성향 해설과 오늘의 처방전';continuation.append(title);
 if(patient)continuation.append(printClone(patient));
 if(type){const subtitle=doc.createElement('p'),code=type.querySelector('.clinic-type-code'),name=type.querySelector('.clinic-type-name');subtitle.className='clinic-print-type-summary';subtitle.textContent=code&&name?code.textContent+' — '+name.textContent:type.textContent;continuation.append(subtitle);}
 pages[1].content.prepend(continuation);
 for(const page of pages)root.append(page.sheet);
 doc.body.append(root);doc.body.classList.add('clinic-printing');
 const fit=()=>pages.forEach(fitPage);fit();
 const cleanup=()=>{root.remove();if(!doc.getElementById(ROOT_ID))doc.body.classList.remove('clinic-printing');};
 cleanup.fit=fit;cleanup.root=root;
 return cleanup;
}

function install(getCertificate,win=window){
 let current=null;
 const api={
  prepare(){api.cleanup();const certificate=getCertificate();if(!certificate)return null;current=prepare(certificate);return current;},
  cleanup(){if(current){current();current=null;}},
  dispose(){api.cleanup();win.removeEventListener('beforeprint',before);win.removeEventListener('afterprint',after);}
 };
 const before=()=>{if(current)current.fit();else api.prepare();},after=()=>api.cleanup();
 win.addEventListener('beforeprint',before);win.addEventListener('afterprint',after);
 return api;
}

module.exports={prepare,install};
