const {W}=require('../shared/common');
const {galleryHeader}=require('../shared/gallery-layout');
const {characterGallery}=require('../shared/character-gallery');
module.exports=()=>W(`${galleryHeader('characters')}${characterGallery()}`);
