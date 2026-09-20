function galleryHeader(active){return `<div class="gallery-head">
 <div class="eye">SEEYA · GALLERY</div><h1 style="font-size:55px;margin:10px 0 4px">GALLERY</h1><div class="gallery-tagline">SeeYa in Pictures</div>
 </div><nav class="music-subnav gallery-subnav" aria-label="갤러리 종류">
 <a href="/gallery/"${active==='photos'?' class="active" aria-current="page"':''}>사진</a>
 <a href="/gallery/characters/"${active==='characters'?' class="active" aria-current="page"':''}>캐릭터 이미지</a>
 <a href="/gallery/fans/"${active==='fans'?' class="active" aria-current="page"':''}>팬이 담은 씨야</a>
 </nav>`;}
module.exports={galleryHeader};
