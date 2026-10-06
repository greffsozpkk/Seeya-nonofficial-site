'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function resolvePlaces(config,archive){
 const byId=new Map(archive.map(row=>[row.id,row]));
 return config.places.flatMap(place=>{
  const row=byId.get(place.recordId);
  // Deleted or merged records are excluded; archive dates and names are resolved at build time.
  if(!row||row.hidden||row.mergedInto)return [];
  if(!Array.isArray(place.coordinates)||place.coordinates.length!==2||!place.coordinates.every(Number.isFinite))throw Error('Invalid place coordinates: '+place.id);
  return [{...place,name:row.venue,title:row.title,date:row.date,time:row.calendar?.time||'',eventState:row.eventState||'',members:row.members||[],category:'공연장',source:row.source,checkedAt:config.checkedAt}];
 });
}
function filterPlaces(rows,{query='',member='전체',region='전체',category='전체',bounds=null,sort='tour'}={}){
 const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return rows.filter(p=>words.every(w=>[p.name,p.city,p.locality,p.address,p.title,...p.members].join(' ').toLocaleLowerCase().includes(w))&&(member==='전체'||member==='씨야'||p.members.includes(member))&&(region==='전체'||p.region===region)&&(category==='전체'||p.category===category)&&(!bounds||(p.coordinates[0]>=bounds.south&&p.coordinates[0]<=bounds.north&&p.coordinates[1]>=bounds.west&&p.coordinates[1]<=bounds.east))).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'ko'):sort==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
}
function badge(p){return p.eventState==='cancelled'?'공연 취소':p.eventState==='scheduled'?'공연 예정':'공연 기록';}
function cards(rows,selected){return rows.map((p,i)=>`<li><button type="button" class="map-place-card ${p.id===selected?'is-selected':''}" data-place="${esc(p.id)}" aria-pressed="${p.id===selected}"><span class="map-ticket map-ticket-${i%4}" aria-hidden="true"><small>THE FAN</small><strong>${esc(p.city)}</strong><span>20TH ANNIVERSARY</span></span><span class="map-card-copy"><strong>${esc(p.name)}</strong><span class="map-location">⌖ ${esc(p.locality||p.address.split(' ').slice(0,2).join(' '))}</span><span class="map-card-meta"><span class="map-tag">공연장</span><time>${esc(p.date.replaceAll('-','.'))}</time></span></span><span class="map-card-arrow" aria-hidden="true">›</span></button></li>`).join('');}
function detail(p){
 const directions='https://map.kakao.com/link/to/'+encodeURIComponent(p.name)+','+p.coordinates.join(',');
 return `<button type="button" id="mapBack" class="map-back">← 장소 목록</button><div class="map-detail-cover"><span>SEEYA · 20TH ANNIVERSARY TOUR</span><strong>THE FAN</strong><span>${esc(p.city)} · ${esc(p.date.replaceAll('-','.'))}</span></div><span class="map-tag">공연장 · ${badge(p)}</span><h2 id="mapDetailTitle" tabindex="-1">${esc(p.name)}</h2><p class="map-story">씨야 20주년 전국 투어 ‘THE FAN’ ${esc(p.city)} 공연이 연결된 장소입니다.</p><dl><dt>공연</dt><dd>${esc(p.date)}${p.time?' · '+esc(p.time):''}<br>씨야 · 남규리 · 김연지 · 이보람</dd><dt>주소</dt><dd id="mapAddress">${esc(p.address)}</dd></dl><div class="map-detail-actions"><button id="mapCopy" type="button">주소 복사</button><a href="${esc(directions)}" target="_blank" rel="noopener">길찾기 ↗</a></div><p id="mapCopyStatus" class="map-small" role="status"></p>${p.note?'<p class="map-place-note">'+esc(p.note)+'</p>':''}<div class="map-record-links"><a href="/archive/?record=${encodeURIComponent(p.recordId)}" target="_blank" rel="noopener">공연 아카이브 보기 ↗</a>${p.source?.url&&/^https?:\/\//.test(p.source.url)?`<a href="${esc(p.source.url)}" target="_blank" rel="noopener">${esc(p.source.label||'기록 출처')} ↗</a>`:''}<a href="/archive/concerts/the-fan-2026/" target="_blank" rel="noopener">20주년 콘서트 기록관 ↗</a></div><details class="map-evidence"><summary>장소 정보 출처</summary><a href="${esc(p.addressSource)}" target="_blank" rel="noopener">주소 확인 자료 ↗</a><a href="${esc(p.coordinateSource)}" target="_blank" rel="noopener">OpenStreetMap 시설 위치 ↗</a><p>위치 확인 ${esc(p.checkedAt)} · 건물·시설 단위의 위치입니다. 입장 시간과 출입구는 공연 안내를 확인해 주세요.</p></details>`;
}
// Screen-space grouping only; no extra clustering plugin or additional map requests.
function groupPins(rows,project,radius=44){
 const groups=[];
 for(const p of rows){const point=project(p.coordinates);const g=groups.find(g=>Math.hypot(point.x-g.x,point.y-g.y)<radius);if(g)g.items.push(p);else groups.push({x:point.x,y:point.y,items:[p]});}
 return groups;
}
module.exports={resolvePlaces,filterPlaces,cards,detail,groupPins,esc};
