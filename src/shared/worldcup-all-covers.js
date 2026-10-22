'use strict';
// Broadcast entries are shared so corrections do not create two separately maintained copies.
module.exports=()=>({
 id:'covers-all',title:'씨야 커버곡 월드컵',description:'방송 · 멤버 공식 채널 · 공식 라이브 콘텐츠를 한자리에',
 tag:'ALL COVER SONGS',unit:'편',pickLabel:'이 커버 선택',version:'covers-all-20261023-v1',rounds:[32,64,'all'],
 scopeNote:'방송·공식 채널·라이브·짧은 커버 챌린지를 담았습니다.\n같은 멤버의 같은 곡은 한 번만 포함했습니다.',
 candidates:[...require('../data/worldcup-covers.json').candidates,...require('../data/worldcup-cover-extras.json')]
});
