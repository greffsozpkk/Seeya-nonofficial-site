'use strict';
const imageExport=require('./clinic-image');
const C=require('../shared/clinic-scoring');
const {esc:E}=require('../shared/common');

function renderMarkup({name,date,modeLabel,model:s}){
 if(!s?.profile?.prescription)throw Error('진단서를 먼저 발급한 뒤 저장해주세요.');
 const rx=s.profile.prescription,hasType=!!s.typeCode;
 const ratios=C.axes.map(axis=>{
  const def=C.bank.axes[axis],v=s.axisRatios[axis];
  const right=v.ready?Math.max(0,Math.min(100,Number(v.right))):50;
  return `<div class="clinic-summary-axis"><div class="clinic-summary-axis-labels"><span><b>${E(def.left)}</b> ${E(def.leftLabel)} <em>${v.ready?E(v.left)+'%':'—'}</em></span><span><b>${E(def.right)}</b> ${E(def.rightLabel)} <em>${v.ready?E(v.right)+'%':'—'}</em></span></div><div class="clinic-summary-bar${v.ready?'':' clinic-summary-unready'}"><span style="width:${right}%"></span></div></div>`;
 }).join('');
 return `<article class="clinic-summary-card" aria-label="씨야 과몰입 진단서 요약"><div class="clinic-summary-viewport"><div class="clinic-summary-content"><div class="clinic-summary-head"><img src="/images/common/clinic-logo.png" alt="SEEYA" width="76"><div><h2>과몰입 진단서</h2><small>FAN CHECK CLINIC</small></div></div><div class="clinic-summary-patient"><div>성명 <strong>${E(String(name||'').trim()||'익명의 씨야 팬')}</strong></div><span>${E(date)} · ${E(modeLabel)}</span></div><div class="clinic-summary-type${hasType?'':' clinic-summary-pending'}"><span class="clinic-summary-eyebrow">나의 팬 성향</span>${hasType?`<strong class="clinic-summary-code">${E(s.typeCode)}</strong><h3>${E(s.title)} 형</h3>`:`<h3>${E(s.title)}</h3>`}<p>${E(s.profile.tagline)}</p></div><div class="clinic-summary-score"><div><span>과몰입 지수</span> <strong>${s.depthReady?E(s.depthDisplay):'—'}</strong> <span>/ 100</span></div><p>마음 ${E(C.rangeText(s.emotion.display))} / 60 <i>·</i> 행동 ${E(C.rangeText(s.behavior.display))} / 40</p></div><div class="clinic-summary-directions"><h4>마음이 향하는 네 방향</h4>${ratios}</div><div class="clinic-summary-rx"><span>℞ 오늘의 처방전</span><h4>${E(rx.medicine)}</h4><p>${E(rx.dose)}</p></div><div class="clinic-summary-foot"><span>씨야를 좋아하는 나만의 방식</span><span>seeya-fanpage.com</span></div></div></div></article>`;
}

async function capture(data){
 const host=document.createElement('div');host.className='clinic-summary-host';host.setAttribute('aria-hidden','true');host.innerHTML=renderMarkup(data);document.body.append(host);
 try{
  if(document.fonts?.ready)await document.fonts.ready;
  const card=host.querySelector('.clinic-summary-card'),content=card.querySelector('.clinic-summary-content'),viewport=card.querySelector('.clinic-summary-viewport');
  await Promise.all([...card.querySelectorAll('img')].map(img=>img.decode?img.decode():Promise.resolve()));
  // Fit the complete summary, including a long nickname or an unresolved type.
  // The card itself stays 540 × 675 CSS pixels, exported at 2× by clinic-image.
  const available=viewport.clientHeight,natural=content.getBoundingClientRect().height;
  if(natural>available){const scale=(available-1)/natural;content.style.transform='scale('+scale+')';content.style.marginLeft=(viewport.clientWidth*(1-scale)/2)+'px';}
  // Explicit CSS dimensions avoid a one-pixel rounding drift under browser zoom.
  const result=await imageExport.capture(card,{width:540,height:675,scale:2});
  if(result.width!==1080||result.height!==1350)throw Error('요약 이미지 크기를 맞추지 못했어요. 다시 저장해주세요.');
  return result;
 }finally{host.remove();}
}
module.exports={capture,renderMarkup};
