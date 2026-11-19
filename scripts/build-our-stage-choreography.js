'use strict';
// Manually observed reference cues, not motion capture. Cutaways are bridged conservatively.
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
// x, y, body lean, head tilt, left shoulder/elbow, right shoulder/elbow, left/right step.
const rest=[0,0,0,0,0,0,0,0,0,0];
const sing=[0,0,0,-2,8,-18,100,90,0,0];
const chest=[0,0,0,0,-18,-112,100,90,0,0];
const folded=[0,0,0,0,-20,-120,20,120,0,0];
const open=[0,0,0,-2,42,-22,100,90,0,0];
const p=(base,changes={})=>base.map((v,i)=>changes[i]??v);
const cue=(time,note,br,gr,yj)=>({time,note,members:{br,gr,yj}});
const scent=[
cue(0,'61s: 후렴 진입. 가운데 보컬, 양옆은 넓은 발 간격.',p(rest,{0:-3,8:5,9:-5}),chest,p(rest,{0:3,8:5,9:-5})),
cue(2,'앞뒤 관찰 자세를 잇는 체중 이동.',p(folded,{0:-5,1:2,2:-3,8:7,9:-3}),p(sing,{1:1,4:20,5:-65}),p(folded,{0:5,1:2,2:3,8:3,9:-7})),
cue(4,'65s: 옆 멤버는 팔을 허리 쪽에 모으고, 보컬은 마이크 유지.',p(folded,{0:-5,2:-3,4:-10,5:-90}),p(chest,{0:1,3:-3}),p(folded,{0:5,2:3,4:-10,5:-90})),
cue(6.5,'70s 동작으로 진입: 무릎을 굽히며 팔을 올림.',p(rest,{0:-7,1:3,2:-4,4:75,5:-20,8:9,9:-2}),p(sing,{1:3,4:-15,5:-95,8:4,9:-4}),p(rest,{0:7,1:3,2:4,4:60,5:-20,8:2,9:-9})),
cue(9,'70s: 옆 멤버의 머리 위 팔선과 굽힌 무릎. 보컬은 노래 유지.',p(rest,{0:-7,1:3,2:-4,4:140,5:-25,6:-25,7:60,8:11,9:-3}),p(chest,{1:3,2:2,8:4,9:-4}),p(rest,{0:7,1:3,2:4,4:125,5:-20,6:-20,7:50,8:3,9:-11})),
cue(11,'올렸던 손을 어깨선으로 내리고 발을 모으는 연결.',p(rest,{0:-4,1:1,4:80,5:-65,6:10,7:40,8:4,9:0}),p(open,{0:2,2:2}),p(rest,{0:4,1:1,4:65,5:-55,6:10,7:35,8:0,9:-4})),
cue(13,'오케스트라 화면 전환 앞뒤를 잇는 중립 자세.',p(rest,{0:-3,4:15,5:-25}),p(chest,{3:-3}),p(rest,{0:3,4:12,5:-20})),
cue(19,'75–80s 오케스트라 컷: 보이지 않는 안무는 새로 만들지 않고 호흡만 유지.',p(rest,{0:-3,1:1,3:2}),p(chest,{1:1,3:-1}),p(rest,{0:3,1:1,3:-2})),
cue(23,'다음 보컬 파트로 마이크를 올리는 연결.',p(sing,{0:-2,3:1}),p(folded,{0:1}),p(rest,{0:3,3:-1})),
cue(29,'90s 짧은 머리 보컬 클로즈업: 고개를 기울여 노래.',p(chest,{0:-2,3:4,2:1}),p(rest,{0:1,4:-10,5:-25}),p(rest,{0:3,4:10,5:-25})),
cue(32,'보컬의 손을 가슴 앞에서 조금 펼침.',p(open,{0:-1,3:2,4:30,5:-65}),p(rest,{0:2,3:1}),p(rest,{0:4,3:-1})),
cue(34,'95s: 가운데 보컬과 양옆 낮은 팔선, 넓어진 대형.',p(chest,{0:0,1:-2,3:-2,8:4,9:-4}),p(rest,{0:-7,1:1,2:-3,8:3}),p(rest,{0:7,1:1,2:3,9:-3})),
cue(39,'100s: 양옆은 앞으로, 보컬은 뒤쪽에 남는 대형을 작게 해석.',p(sing,{0:0,1:-3,4:-10,5:-70}),p(rest,{0:-8,1:2,4:8}),p(rest,{0:8,1:2,4:12})),
cue(42,'다음 보컬로 전환. 앞뒤 화면에서 확인되는 마이크 이동.',p(folded,{0:-3,1:0}),p(rest,{0:-4,1:1}),p(sing,{0:5,1:1,3:2})),
cue(44,'105s 긴 머리 보컬 클로즈업: 마이크와 상체 중심.',p(rest,{0:-4}),p(rest,{0:-3}),p(sing,{0:4,3:3,4:-12,5:-85})),
cue(49,'110s: 자유 손을 윗배/가슴 아래에 두고 고개를 기울임.',p(rest,{0:-4,3:1}),p(rest,{0:-3,3:-1}),p(chest,{0:3,3:5,2:1,4:-12,5:-105})),
cue(53,'클로즈업으로 보이지 않는 하체는 큰 동작 없이 유지.',p(rest,{0:-3,1:1}),p(folded,{0:-2,1:1}),p(chest,{0:2,1:1,3:2})),
cue(57,'다음 목소리로 넘기는 연결.',p(rest,{0:-2}),p(sing,{0:0,3:-1}),p(folded,{0:2})),
cue(59,'120s 앞머리 보컬 클로즈업: 마이크를 입에 두고 고개를 들기.',p(rest,{0:-2,3:1}),p(sing,{0:0,3:-4,4:-12,5:-92}),p(rest,{0:2,3:-1})),
cue(64,'125s까지의 노래 자세를 이어 마침. 원본에 없는 피날레 동작은 넣지 않음.',p(rest,{0:-3,8:5,9:-5}),chest,p(rest,{0:3,8:5,9:-5}))
];
const greeting=require('./our-stage-greeting-cues')({cue,p,rest,folded});
const extra=require('./our-stage-extra-cues')({cue,rest});
const tracks={
 scent:{source:'https://www.youtube.com/watch?v=rFCNRIpPukY',start:61,end:125,frames:scent},
 greeting:{source:'https://www.youtube.com/watch?v=63sCks2FLBI',start:92,end:120,frames:greeting},
 marry:{source:'https://www.youtube.com/watch?v=D-mng72Hx1w',start:143,end:167,frames:extra.marry},
 voice:{source:'https://www.youtube.com/watch?v=i9tx0-ldVYc',start:47,end:67,frames:extra.voice}
};
fs.writeFileSync(path.join(root,'src/data/our-stage-choreography.json'),JSON.stringify(tracks,null,2)+'\n');
const ui="#ourStage .motion-preview{--motion:1.25;--motion-speed:2}\n#ourStage .motion-preview>p{font-size:14px;line-height:1.65;color:#615363}\n#ourStage .motion-size{display:flex;gap:8px;border:0;padding:0;margin:18px 0}\n#ourStage .motion-size legend{font-size:14px;font-weight:700;margin-bottom:8px}\n#ourStage .motion-size button{flex:1;min-height:44px}\n#ourStage .motion-size [aria-pressed=true]{background:#7b3f61;color:#fff;border-color:#7b3f61}\n#ourStage .motion-preview-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}\n#ourStage .motion-preview-controls a{font-size:13px}\n#ourStage .motion-paused .stage-art *{animation-play-state:paused!important}\n#ourStage .motion-preview .stage-trio>div{height:200px}\n#ourStage .motion-preview .stage-audience{height:52px;padding-top:8px}\n@media(max-width:650px){#ourStage .motion-preview .stage-trio>div{height:160px}}\n#ourStage .motion-song-picker{display:flex;gap:8px;margin:14px 0}\n#ourStage .motion-song-picker button{flex:1;min-height:42px;font-size:13px;padding:8px}\n#ourStage .motion-song-picker [aria-pressed=true]{border-color:#8d4b70;background:#f8eaf2;color:#632d4b}\n#ourStage .motion-tuning{display:grid;grid-template-columns:1.4fr 1fr;gap:16px}\n#ourStage .motion-tuning .motion-size{margin:12px 0}\n#ourStage .motion-tuning button{padding:8px 6px;font-size:13px}\n@media(max-width:420px){#ourStage .motion-tuning{grid-template-columns:1fr;gap:0}#ourStage .motion-tuning .motion-size{margin:7px 0}}";
let css=`/* Generated by scripts/build-our-stage-choreography.js from observed source cues. */
#ourStage .scent-choreo{--motion:1.25;--motion-speed:2;--phrase:calc(64s / var(--motion-speed))}
#ourStage .greeting-choreo{--motion-speed:1;--phrase:calc(28s / var(--motion-speed))}
#ourStage .motion-preview .scent-choreo{--motion:inherit;--motion-speed:inherit}
#ourStage .scent-choreo .stage-mic{display:none}
#ourStage .scent-choreo .member-sprite{overflow:visible}
#ourStage .scent-choreo .stage-trio{padding-bottom:8px}
#ourStage .scent-choreo .scent-free-arm{transform-origin:66px 50px}
#ourStage .scent-choreo .scent-singing-arm{transform-origin:168px 50px}
#ourStage .scent-choreo .scent-elbow-left{transform-origin:42px 112px}
#ourStage .scent-choreo .scent-elbow-right{transform-origin:192px 112px}
#ourStage .scent-choreo .scent-leg-left{transform-origin:90px 210px}
#ourStage .scent-choreo .scent-leg-right{transform-origin:148px 210px}
#ourStage .scent-choreo .sprite-hair{transform-origin:220px 340px}
#ourStage .stage-entrance.scent-choreo .stage-performer{--phrase-delay:var(--arrival)!important}
#ourStage .greeting-choreo .scent-leg-left{transform-origin:90px 195px}
#ourStage .greeting-choreo .scent-leg-right{transform-origin:148px 195px}
`;
const channels=require('../src/shared/our-stage-motion-channels');
css+=`#ourStage .scent-choreo .scent-facing-body{transform-origin:220px 500px}
#ourStage .scent-choreo[data-motion=marry]{--motion-speed:1;--phrase:calc(24s / var(--motion-speed))}
#ourStage .scent-choreo[data-motion=voice]{--motion-speed:1;--phrase:calc(20s / var(--motion-speed))}
`;
for(const [type,track] of Object.entries(tracks))for(const member of ['br','gr','yj'])for(const [i,[part,transform]] of Object.entries(channels).entries()){
 const name=`source-${type}-${member}-${i}`,selector=`#ourStage .scent-choreo[data-motion="${type}"].live .stage-performer[data-member="${member}"]${part}`;
 css+=selector+`{animation:${name} var(--phrase) linear var(--phrase-delay) 1 both}\n`;
 css+=`@keyframes ${name}{`+track.frames.map(f=>`${f.time/(track.end-track.start)*100}%{transform:${transform(f.members[member])}}`).join('')+'}\n';
}
// Faces remain front-facing; body turns and crossing steps remain.
css+=ui+'\n@media(prefers-reduced-motion:reduce){#ourStage .scent-choreo.live *{animation:none!important}}\n';
fs.writeFileSync(path.join(root,'src/styles/our-stage-choreo.css'),css);
console.log('Built source-timed sequences: scent 64s, greeting 28s, marry 24s, voice 20s.');
