// One-time proposal from already archived titles. Review before changing the evidence file.
const fs=require('fs');
const titlesArg=process.argv.indexOf('--titles');
const titleMetadata=titlesArg>=0?JSON.parse(fs.readFileSync(process.argv[titlesArg+1],'utf8')):{};
const archive=require('../data/archive.json'),tour=require('../src/data/concerts.json')[0];
const stage=require('../src/data/stage-songs.json'),tracks=require('../src/data/worldcup-songs.json').candidates;
const norm=s=>s.toLowerCase().replace(/[\s,·.()Ⅲ]/g,'');
const chosen=['여인의 향기','구두','미친 사랑의 노래','사랑의 인사','결혼할까요','슬픈 발걸음','그래도 좋아','Hot Girl','그 놈 목소리','내겐 너무 멋진 그대','Stay','계절은 돌고 돌아','봄처럼 그댄','I Believe','그럼에도, 우린','안돼요','잔향','우리 Live Ver.','미워요','감동을 주세요','그 사람이 나를 사랑해요','I Wish','Loving You','솜사탕','바보'];
const songs=chosen.map(title=>{const t=tracks.find(t=>t.songRef===title);const s=stage.find(s=>norm(s.name)===norm(title));if(!t)throw Error(title);return {id:s?.id||'group-'+t.id,trackId:t.id,...(s?{stageId:s.id}:{}),...(title==='우리 Live Ver.'?{displayName:'우리'}:{})};});
const sessions=tour.events.flatMap(e=>(e.passportDates||[archive.find(r=>r.id===e.id).date]).map(date=>({id:'the-fan-'+date.replaceAll('-',''),archiveId:e.id,date,label:e.label+(e.passportDates?' '+(date.endsWith('29')?'첫날':'둘째 날'):''),setlistCompleteness:'partial'})));
const evidence=[],candidateGroups=[];
for(const session of sessions){const row=archive.find(r=>r.id===session.archiveId);
 for(let i=0;i<songs.length;i++){
  const title=chosen[i],name=title==='우리 Live Ver.'?'우리':title;
  const possible=[row.source,...row.additionalSources].map(s=>{let v;try{v=titleMetadata[new URL(s.url).searchParams.get('v')];}catch{}return v?.public&&v.title?{...s,label:s.label+' · '+v.title,videoTitle:v.title}:s;}).filter(s=>{
   if(!s.url.includes('youtube.com/watch?'))return false;
   const label=s.label||'';const dates=[...label.matchAll(/(?<!\d)(?:2026|26)[.\s/-]?(0[1-9]|1[012])[.\s/-]?([012]\d|3[01])(?!\d)/g)].map(m=>'2026-'+m[1]+'-'+m[2]);
   if(dates.length ? new Set(dates).size!==1||dates[0]!==session.date : (session.label.startsWith('서울')||!label.includes(session.label)||!label.includes('콘서트')))return false;
   if(/퇴근|게스트|비하인드|리허설|노래방|모음집|playlist|브이로그/i.test(label))return false;
   if(name==='우리')return /(?<![가-힣])우리\s*(?:\(|@|Fancam|Live|직캠|[-,]|$)/i.test(label.split('#')[0]);
   if(name==='구두'&&/구두\s*(?:[ⅡⅢ]|II|2|3|\|\|\|)/i.test(label))return false;
   const titlePart=label.replace(/\[#/g,'[').split('#')[0];
   const aliases=name==='Hot Girl'?['Hot Girl','핫걸']:name==='그 사람이 나를 사랑해요'?['그 사람이 나를 사랑해요','그사람(구두3)','그사람 (구두 III)']:[name];
   return aliases.some(alias=>norm(titlePart).includes(norm(alias)))&&!/구두\s*시리즈/.test(label);
  }).sort((a,b)=>Number(/메들리|일부|한소절|shorts/i.test(a.label))-Number(/메들리|일부|한소절|shorts/i.test(b.label)));
  candidateGroups.push({sessionId:session.id,songId:songs[i].id,name,sources:possible});
  if(possible.length){const source=possible[0];evidence.push({sessionId:session.id,songId:songs[i].id,status:'confirmed',sources:[{url:source.url,scope:/메들리|일부|한소절|shorts/i.test(source.label)?'excerpt':'documented'}]});if(!process.argv.includes('--candidates'))console.log(session.date,name,'|',source.label);}
 }
}
const data={tourId:tour.id,checkedAt:'2026-11-24',scopeNote:'씨야 발표곡 25곡의 기존 아카이브 영상 제목을 기준으로 회차별 무대을 정리한 첫 미리보기입니다. 솔로곡·외부 커버곡과 전체 셋리스트 검토는 아직 포함하지 않았습니다.',songs,sessions,evidence};
if(process.argv.includes('--candidates'))fs.writeFileSync('output/live-video-audit/candidates.json',JSON.stringify(candidateGroups,null,2)+'\n');
else fs.writeFileSync('src/data/live-evidence.json',JSON.stringify(data,null,2)+'\n');
console.log('TOTAL',songs.length,sessions.length,evidence.length);
