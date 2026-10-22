'use strict';
// Broadcast entries are shared so corrections do not create two separately maintained copies.
module.exports=()=>({
 id:'covers-all',title:'씨야 커버곡 월드컵',description:'방송 · 멤버 공식 채널 · 공식 라이브 콘텐츠를 한자리에',
 tag:'ALL COVER SONGS',unit:'편',pickLabel:'이 커버 선택',version:'covers-all-20261023-v1',rounds:[32,64,'all'],
 scopeNote:'방송 무대와 보람씨야·김연지 공식 채널, 남규리의 공식 라이브 콘텐츠를 모은 128편입니다. 32강·64강은 매번 무작위 선정하며 전체 참가는 128편 모두 참여합니다. 같은 멤버의 같은 곡은 한 번만 담고, 본인 발표곡 재가창·메들리·짧은 챌린지와 외부 재생이 제한된 영상은 제외했습니다. 모든 커버 이력을 망라한 목록은 아니며, 확인한 영상부터 계속 보강합니다.',
 candidates:[...require('../data/worldcup-covers.json').candidates,...require('../data/worldcup-cover-extras.json')]
});
