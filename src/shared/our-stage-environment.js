'use strict';
module.exports=function(pathname){
 const isTest=pathname.replace(/\/$/,'')==='/game/our-stage/test';
 return {isTest,key:isTest?'seeya-our-stage-local-v1':'seeya-our-stage-public-v1',
 outfitKey:isTest?'seeya-our-stage-outfit-v1':'seeya-our-stage-public-outfit-v1',
 connectKey:isTest?'seeya-our-stage-connect-v1':'seeya-our-stage-public-connect-v1'};
};
