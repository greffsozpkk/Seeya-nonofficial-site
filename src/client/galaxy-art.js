'use strict';

const palette = [
 ['살구빛', '#f5d9bf'], ['하늘빛', '#bfcdf9'], ['보랏빛', '#dfc6fc'],
 ['분홍빛', '#f4b9d3'], ['민트빛', '#90e2cc'], ['금빛', '#ffcf60']
];

function letterColor(letter) {
 const value=letter.color;
 if (/^#[a-f0-9]{6}$/i.test(value)) {
  // Old test letters could store any RGB value. Display the closest swatch.
  const channels=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const rgb=channels(value);
  const distance=hex=>channels(hex).reduce((sum,c,i)=>sum+(c-rgb[i])**2,0);
  return palette.reduce((best,item)=>distance(item[1])<distance(best[1])?item:best)[1];
 }
 const index=['씨야','남규리','김연지','이보람'].indexOf(letter.recipient);
 return palette[Math.max(0,index)][1];
}

function paintLight(ctx,x,y,color,radius) {
 const halo = ctx.createRadialGradient(x,y,0,x,y,radius*3);
 halo.addColorStop(0,color);
 halo.addColorStop(.30,color+'ad');
 halo.addColorStop(1,color+'00');
 ctx.fillStyle=halo;
 ctx.fillRect(x-radius*3,y-radius*3,radius*6,radius*6);
 ctx.fillStyle=color;
 ctx.beginPath();ctx.arc(x,y,radius*.66,0,2*Math.PI);ctx.fill();
 ctx.fillStyle='#fff8f1';
 ctx.beginPath();ctx.arc(x,y,radius*.32,0,2*Math.PI);ctx.fill();
}

function starEditor(form) {
 let color=palette[0][1];
 const colors=document.getElementById('glPalette');
 let customColor=false;
 function syncPalette(){
  for(const button of colors.children)button.setAttribute('aria-pressed',String(button.dataset.color===color));
 }
 for(const [name,value] of palette){
  const button=document.createElement('button');button.type='button';
  button.title=name;button.setAttribute('aria-label',name);button.dataset.color=value;
  button.style.setProperty('--swatch',value);button.onclick=()=>{customColor=true;color=value;syncPalette();};colors.append(button);
 }
 form.elements.recipient.addEventListener('change',()=>{
  if(!customColor)color=letterColor({recipient:form.elements.recipient.value});
  syncPalette();
 });
 return {
  open(letter){
   color=letterColor(letter||{recipient:form.elements.recipient.value});
   customColor=Boolean(letter?.color);
   syncPalette();
  },
  values(){return {color};}
 };
}

module.exports={starEditor,letterColor,paintLight};
