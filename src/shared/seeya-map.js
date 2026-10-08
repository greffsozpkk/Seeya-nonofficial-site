'use strict';
const {recordsByPlace}=require('./map-archive');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>/^https?:\/\//.test(url||'')?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`:'';
function resolvePlaces(config,archive){
 const byId=new Map(archive.map(row=>[row.id,row])),grouped=recordsByPlace(archive);
 return config.places.flatMap(({archiveExclusion,...place})=>{
  const records=grouped.get(place.id)||[];
  if(!Array.isArray(place.coordinates)||place.coordinates.length!==2||!place.coordinates.every(Number.isFinite))throw Error('Invalid place coordinates: '+place.id);
  if(place.archiveOnly){
   if(!records.length)return [];
   const current=records[0],members=[...new Set(records.flatMap(r=>r.members))];
   return [{...place,recordId:current.id,title:current.title,date:current.date,dateBasis:current.dateBasis,eventState:current.eventState,members,group:records.some(r=>r.members.length===3)?'씨야':'멤버',source:current.source,records,checkedAt:config.checkedAt}];
  }
  const row=byId.get(place.recordId);
  // Concert metadata stays joined to the archive. Other places retain their own identity.
  if(!place.name&&(!row||row.hidden||row.mergedInto))return [];
  if(!Array.isArray(place.coordinates)||place.coordinates.length!==2||!place.coordinates.every(Number.isFinite))throw Error('Invalid place coordinates: '+place.id);
  if(place.name)return [{...place,recordId:row&&!row.hidden&&!row.mergedInto?row.id:null,records,checkedAt:config.checkedAt}];
  return [{...place,tourVenue:true,name:row.venue,title:row.title,date:row.date,dateBasis:'공연일',time:row.calendar?.time||'',eventState:row.eventState||'',members:row.members||[],group:'씨야',category:'공연장',relations:['공연'],source:row.source,records,checkedAt:config.checkedAt}];
 });
}
function filterPlaces(rows,{query='',member='전체',region='전체',category='전체',relation='전체',bounds=null,sort='tour'}={}){
 const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return rows.filter(p=>words.every(w=>[p.name,p.city,p.locality,p.address,p.title,p.story,...(p.records||[]).flatMap(r=>[r.title,r.venue]),...p.members,...p.relations].join(' ').toLocaleLowerCase().includes(w))&&(member==='전체'||(member==='씨야'?p.group==='씨야':p.members.includes(member)))&&(region==='전체'||p.region===region)&&(category==='전체'||p.category===category)&&(relation==='전체'||p.relations.includes(relation))&&(!bounds||(p.coordinates[0]>=bounds.south&&p.coordinates[0]<=bounds.north&&p.coordinates[1]>=bounds.west&&p.coordinates[1]<=bounds.east))).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'ko'):sort==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
}
function promoStatus(p,now=p.checkedAt+'T12:00:00+09:00'){
 if(!p.promotion)return '';
 const t=new Date(now).getTime(),start=new Date(p.promotion.start+'T00:00:00+09:00').getTime(),end=new Date(p.promotion.endsAt||p.promotion.end+'T23:59:59+09:00').getTime();
 return t<start?'혜택 예정':t>end?'혜택 종료':'혜택 기간';
}
function badge(p,now){return p.operatingStatus==='closed'?'영업 종료 · 과거 기록':p.promotion?promoStatus(p,now):p.category==='공연장'?(p.eventState==='cancelled'?'공연 취소':p.eventState==='scheduled'?'공연 예정':p.relations.includes('팬 행사')?'팬 행사 기록':'공연 기록'):p.relations.join(' · ');}
const tone=p=>({'공연장':'venue','카페':'cafe','식당':'food','문화공간':'culture','여행·자연':'nature','쇼핑':'shopping'}[p.category]||'culture');
function cards(rows,selected,now){return rows.map(p=>`<li><button type="button" class="map-place-card ${p.id===selected?'is-selected':''}" data-place="${esc(p.id)}" aria-pressed="${p.id===selected}"><span class="map-card-copy"><strong>${esc(p.name)}</strong><span class="map-location">⌖ ${esc(p.locality||p.address.split(' ').slice(0,2).join(' '))}</span><span class="map-card-meta"><span class="map-tag map-tag-${tone(p)}">${esc(p.category)}</span><span class="map-card-status">${esc(badge(p,now))}</span></span><span class="map-card-date">${esc(p.date.replaceAll('-','.'))} · ${esc(p.dateBasis)}</span></span><span class="map-card-arrow" aria-hidden="true">›</span></button></li>`).join('');}
function detail(p,now){
 const concert=p.tourVenue===true,area=p.locationPrecision==='area',closed=p.operatingStatus==='closed',overseas=p.country&&p.country!=='KR',directions=overseas?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.coordinates.join(',')):'https://map.kakao.com/link/'+(area||closed?'map/':'to/')+encodeURIComponent(p.name)+','+p.coordinates.join(','),record=p.relatedRecordId||p.recordId;
 const activities=(p.records||[]).length?`<section class="map-activities" aria-label="이곳의 씨야 기록"><h3>이곳의 씨야 기록 <span>${p.records.length}</span></h3><ul>${p.records.map(r=>`<li><span class="map-activity-date">${esc(r.date)} · ${esc(r.dateBasis)}${r.eventState==='scheduled'?' · 예정':r.eventState==='cancelled'?' · 취소':''}</span><a class="map-activity-title" href="/archive/?record=${encodeURIComponent(r.id)}">${esc(r.title)}</a>${r.venue?`<p>${esc(r.venue)}</p>`:''}<div>${link(r.source?.url,r.source?.label||'원본 자료 보기')}</div></li>`).join('')}</ul></section>`:'';
 const promotion=p.promotion?`<section class="map-promotion ${promoStatus(p,now)==='혜택 종료'?'is-ended':''}"><strong>${esc(promoStatus(p,now))}</strong><p>${esc(p.promotion.benefit)}</p><p>${esc(p.promotion.start)}${p.promotion.end!==p.promotion.start?' ~ '+esc(p.promotion.end):''}${p.promotion.endsAt?' · 10월 11일 새벽 1시 종료':''}</p><p>${esc(p.promotion.condition)}</p>${link(p.promotion.sourceUrl,'혜택 원문 확인')}</section>`:'';
 return `<button type="button" id="mapSheetHandle" class="map-sheet-handle" aria-label="장소 요약으로 접기"><span></span></button><button type="button" id="mapBack" class="map-back">← 장소 목록</button><div class="map-detail-cover map-cover-${tone(p)}"><span>${concert?'SEEYA · 20TH ANNIVERSARY TOUR':esc(p.category+' · '+p.relations.join(' / '))}</span><strong>${concert?'THE FAN':esc(p.city)}</strong><span>${esc(p.city)} · ${esc(p.date.replaceAll('-','.'))} ${esc(p.dateBasis)}</span></div><span class="map-tag map-tag-${tone(p)}">${esc(badge(p,now))}</span><h2 id="mapDetailTitle" tabindex="-1">${esc(p.name)}</h2><p class="map-story">${esc(p.story||`씨야 20주년 전국 투어 ‘THE FAN’ ${p.city} 공연이 연결된 장소입니다.`).replace(/\n/g,'<br>')}</p><dl><dt>${concert?'공연':'멤버'}</dt><dd>${concert?esc(p.date)+(p.time?' · '+esc(p.time):'')+'<br>':''}${esc(p.members.join(' · '))}</dd><dt>주소</dt><dd id="mapAddress">${esc(p.address)}</dd></dl><div class="map-detail-actions"><button id="mapCopy" type="button">주소 복사</button><a href="${esc(directions)}" target="_blank" rel="noopener">${closed?'옛 위치 보기':overseas?'지도 보기':area?'지역 지도':'길찾기'} ↗</a></div><p id="mapCopyStatus" class="map-small" role="status"></p>${promotion}${activities}${p.note?'<p class="map-place-note">'+esc(p.note)+'</p>':''}<div class="map-record-links">${record&&!activities?`<a href="/archive/?record=${encodeURIComponent(record)}" target="_blank" rel="noopener">관련 아카이브 보기 ↗</a>`:''}${link(p.source?.url,p.source?.label||'기록 출처')}${(p.evidence||[]).map(e=>link(e.url,e.label)).join('')}${concert?'<a href="/archive/concerts/the-fan-2026/" target="_blank" rel="noopener">20주년 콘서트 기록관 ↗</a>':''}</div><details class="map-evidence"><summary>장소 정보 출처</summary>${link(p.addressSource,'주소 확인 자료')}${link(p.coordinateSource,'지도 위치 확인 자료')}<p>자료 확인 ${esc(p.checkedAt)} · ${area?'지역·시설의 대표 위치이며 정확한 촬영 지점은 아닙니다.':'건물·매장 단위의 위치입니다.'} ${concert?'입장 시간과 출입구는 공연 안내를 확인해 주세요.':['식당','카페'].includes(p.category)?'영업 시간·이전·휴무 여부는 방문 전 매장 안내를 확인해 주세요.':'방문 가능한 구역과 운영 안내는 해당 장소의 최신 안내를 확인해 주세요.'}</p></details>`;
}
function groupPins(rows,project,radius=44){
 const groups=[];
 for(const p of rows){const point=project(p.coordinates);const g=groups.find(g=>Math.hypot(point.x-g.x,point.y-g.y)<radius);if(g)g.items.push(p);else groups.push({x:point.x,y:point.y,items:[p]});}
 return groups;
}
module.exports={resolvePlaces,filterPlaces,cards,detail,groupPins,esc,promoStatus,tone};
