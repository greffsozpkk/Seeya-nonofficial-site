'use strict';

const {spine} = require('../shared/galaxy-layout');
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
 const place=form.elements.starPlace;
 let color=palette[0][1];
 const canvas=document.getElementById('glPlacePreview'),ctx=canvas.getContext('2d');
 const colors=document.getElementById('glPalette');
 let placed=false,customColor=false;
 function preview(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const t=Number(place.value)/100;
  paintLight(ctx,canvas.width*t,canvas.height*spine(t),color,8);
  for(const button of colors.children)button.setAttribute('aria-pressed',String(button.dataset.color===color));
 }
 for(const [name,value] of palette){
  const button=document.createElement('button');button.type='button';
  button.title=name;button.setAttribute('aria-label',name);button.dataset.color=value;
  button.style.setProperty('--swatch',value);button.onclick=()=>{customColor=true;color=value;preview();};colors.append(button);
 }
 place.oninput=()=>{placed=true;preview();};
 canvas.onclick=e=>{
  const rect=canvas.getBoundingClientRect();
  place.value=String(Math.round(100*(e.clientX-rect.left)/rect.width));
  placed=true;preview();
 };
 form.elements.recipient.addEventListener('change',()=>{
  if(!customColor)color=letterColor({recipient:form.elements.recipient.value});
  preview();
 });
 return {
  open(letter,originalPosition){
   color=letterColor(letter||{recipient:form.elements.recipient.value});
   customColor=Boolean(letter?.color);
   placed=!letter||Number.isFinite(letter.place);
   place.value=String(Math.round(100*(letter?.place??originalPosition??(.1+Math.random()*.8))));
   preview();
  },
  values(){return {color:color,...(placed?{place:Number(place.value)/100}:{})};}
 };
}

module.exports={starEditor,letterColor,paintLight};
