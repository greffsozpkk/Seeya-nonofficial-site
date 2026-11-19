'use strict';
const library=require('../shared/our-stage-motion-library'),tracks=require('../data/our-stage-choreography.json'),channels=require('../shared/our-stage-motion-channels');
// Shuffle complete phrases, not four-second songs. The scent/greeting pair stays together.
function makeQueue(random=Math.random){let bag=[],last=null;return ()=>{if(!bag.length){let groups=[['scent','greeting'],['marry'],['voice']];for(let i=groups.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[groups[i],groups[j]]=[groups[j],groups[i]];}if(groups[0][0]===last)[groups[0],groups[1]]=[groups[1],groups[0]];bag=groups.flat();}last=bag.shift();return last;};}
function framesFor(track,member,transform,previous,bridge,duration){const total=bridge+duration,out=previous?[{offset:0,transform:transform(previous)}]:[];for(const f of track.frames)out.push({offset:(bridge+f.time/(track.end-track.start)*duration)/total,transform:transform(f.members[member])});return out;}
function create({random=Math.random,reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches}={}){
 let stage=null,animations=[],generation=0,held=false,previous=null,next=null;
 function stop(){generation++;for(const a of animations)a.cancel();animations=[];stage=null;previous=null;held=false;}
 function run(entrance=0){if(!stage?.isConnected)return;const token=generation,id=next(),track=tracks[id],duration=library[id].seconds/library[id].speed*1000,bridge=previous?650:0;
  stage.dataset.motion=id;const before=animations;animations=[];
  for(const member of ['br','gr','yj']){const actor=stage.querySelector(`[data-member="${member}"]`);if(!actor)continue;
   for(const [part,transform] of Object.entries(channels)){const target=part?actor.querySelector(part.trim()):actor;if(!target?.animate)continue;
    const animation=target.animate(framesFor(track,member,transform,previous?.[member],bridge,duration),{duration:duration+bridge,delay:entrance,fill:'both',easing:'linear'});animations.push(animation);if(held)animation.pause();
   }
  }
  for(const a of before)a.cancel();previous=track.frames.at(-1).members;
  if(animations.length)animations[0].finished.then(()=>{if(token===generation&&stage?.isConnected)run();}).catch(()=>{});
 }
 function mount(target,entrance=0){stop();stage=target;if(!stage)return;next=makeQueue(random);stage.classList.add('concert-motion-mix');if(!reduced())run(entrance);}
 function pause(value){held=value;for(const a of animations)value?a.pause():a.play();}
 return {mount,pause,stop};
}
module.exports=create;module.exports.makeQueue=makeQueue;module.exports.framesFor=framesFor;
