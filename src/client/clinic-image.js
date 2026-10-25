'use strict';
const html2canvas=require('../vendor/html2canvas/html2canvas.min.js');

// Render the certificate DOM itself, including its logo, ratio bars and prescription box.
async function capture(certificate){
 if(!certificate)throw Error('저장할 진단서를 찾지 못했어요. 진단서를 다시 열어주세요.');
 if(document.fonts?.ready)await document.fonts.ready;
 await Promise.all([...certificate.querySelectorAll('img')].map(async img=>{
  if(img.decode)await img.decode();
  else if(!img.complete)await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});});
  if(!img.naturalWidth)throw Error('진단서 로고를 불러오지 못했어요. 잠시 후 다시 저장해주세요.');
 }));
 const rect=certificate.getBoundingClientRect(),width=Math.ceil(rect.width),height=Math.ceil(Math.max(rect.height,certificate.scrollHeight));
 if(!width||!height)throw Error('진단서 화면을 연 다음 저장해주세요.');
 // Keep long mobile certificates within conservative canvas memory/dimension limits.
 const scale=Math.min(2,Math.sqrt(12000000/(width*height)),8192/height,8192/width);
 const canvas=await html2canvas(certificate,{scale,backgroundColor:'#fffcfa',width,height,
  logging:false,allowTaint:false,useCORS:false,removeContainer:true,
  ignoreElements:el=>el.id==='clinicPrintRoot'||el.classList?.contains('clinic-image-dialog')});
 const blob=await new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 만들지 못했어요. 다시 시도해주세요.')),'image/png');}catch{reject(Error('이미지를 저장하지 못했어요. 브라우저를 새로 열어 다시 시도해주세요.'));}});
 return {blob,width:canvas.width,height:canvas.height};
}
module.exports={capture};
