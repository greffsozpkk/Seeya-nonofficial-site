'use strict';
function memberCounts(rows){return ['남규리','김연지','이보람'].map(member=>({member,count:rows.filter(r=>String(r.artist||'').includes(member)).length}));}
function descriptionLines(data){const notes={
 group:['씨야 앨범 수록곡과 OST·협업곡을 담았습니다.','솔로 발매곡과 반주곡은 제외했습니다.'],
 solo:['멤버들의 솔로곡·OST·정식 리메이크·공개 자작곡을 담았습니다.','같은 곡은 한 번만 포함했습니다.'],
 mv:['씨야 뮤직비디오를 담았습니다.','Stay는 연출이 다른 두 버전을 포함합니다.','일부 과거 영상은 팬 업로드입니다.'],
 film:['드라마·영화·연극의 배역을 담았습니다.','특별출연을 포함하며, 가명은 같은 배역으로 묶었습니다.'],
 album4:['4집 보컬곡 9곡이 모두 참여합니다.','반주곡은 제외하며, 8번의 선택으로 우승곡을 정합니다.'],
 covers:['방송 공식 채널의 커버 무대와 듀엣·합동 무대를 담았습니다.','같은 멤버의 같은 곡은 한 번만 포함했습니다.'],
 'covers-all':['방송·공식 채널·라이브·짧은 커버 챌린지를 담았습니다.','같은 멤버의 같은 곡은 한 번만 포함했습니다.']
};return [...(notes[data.id]||String(data.scopeNote||'').split(/(?<=[.!?])\s+|\n/).filter(Boolean)),'새 게임의 후보와 대진은 무작위입니다.',...(data.rounds.includes('all')?['전체 참가는 모든 후보가 참여하며, 필요한 부전승은 무작위로 정합니다.']:[])];}
function isCover(c){return ['covers','covers-all'].includes(c?.id);}
function scopeLabel(c){return c.id==='covers'?'방송 무대만':'전체';}
function title(c,includeScope=false){return isCover(c)?'씨야 커버곡 월드컵'+(includeScope?' · '+scopeLabel(c):''):c.title;}
function hubCollections(list){return list.filter(c=>c.id!=='covers'||!list.some(x=>x.id==='covers-all'));}
module.exports={memberCounts,descriptionLines,isCover,scopeLabel,title,hubCollections};
