'use strict';
// Resize only the displayed canvas. Export pixels and layer coordinates stay unchanged.
module.exports=function viewport(app,canvas){
 const layout=app.querySelector('.pp-maker-layout'),wrap=app.querySelector('.pp-canvas-wrap'),stage=app.querySelector('.pp-edit-stage');
 const home=document.createComment('editor home');layout.before(home);
 const bar=document.createElement('div');bar.className='pp-zoom-bar';
 bar.innerHTML='<button type="button" data-expand>크게 편집 ↗</button><label>화면 확대 <select aria-label="미리보기 확대"><option value="1">폭 맞춤</option><option value="fit">전체 보기</option><option value="1.5">150%</option><option value="2">200%</option><option value="3">300%</option></select></label>';
 const area=document.createElement('div');area.className='pp-preview-scroll';area.tabIndex=0;area.setAttribute('aria-label','이미지 편집 미리보기 · 확대 시 스크롤로 이동');
 stage.before(bar,area);area.append(stage);
 const hint=document.createElement('p');hint.className='pp-help';hint.textContent='확대하면 미리보기 안을 스크롤해 이동할 수 있어요. 요소 이동을 마치면 ‘완료’를 눌러 화면을 이동하세요.';area.after(hint);
 const dialog=document.createElement('dialog');dialog.className='pp-editor-dialog passport-page';dialog.setAttribute('aria-labelledby','ppBigEditorTitle');
 dialog.innerHTML='<header class="pp-big-header"><h2 id="ppBigEditorTitle">이미지 크게 편집</h2><button type="button" data-collapse>편집 화면 닫기</button></header><div class="pp-big-body"></div>';
 app.append(dialog);
 const scale=bar.querySelector('select'),expand=bar.querySelector('[data-expand]'),close=dialog.querySelector('[data-collapse]');let disposed=false,overflow='';
 function resize(){if(disposed||!canvas.width)return;const available=Math.max(1,area.clientWidth-24),ratio=canvas.height/canvas.width,width=scale.value==='fit'?Math.min(available,Math.max(1,parseFloat(getComputedStyle(area).maxHeight)-26)/ratio):available*Number(scale.value);stage.style.width=width+'px';canvas.style.width=width+'px';canvas.style.height=width*canvas.height/canvas.width+'px';}
 const observer=new ResizeObserver(resize);observer.observe(area);
 scale.onchange=()=>{resize();area.scrollTo(0,0);};
 function restore(){home.after(layout);expand.hidden=false;document.body.style.overflow=overflow;resize();expand.focus();}
 expand.onclick=()=>{overflow=document.body.style.overflow;dialog.querySelector('.pp-big-body').append(layout);expand.hidden=true;dialog.showModal();document.body.style.overflow='hidden';resize();close.focus();};
 close.onclick=()=>dialog.close();dialog.addEventListener('close',restore);
 resize();
 return {resize,dispose(){disposed=true;observer.disconnect();dialog.removeEventListener('close',restore);if(dialog.open){dialog.close();document.body.style.overflow=overflow;}dialog.remove();}};
};
