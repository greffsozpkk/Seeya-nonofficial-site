'use strict';
const path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
// One stable cache per checkout; images and data remain in the original folder.
module.exports=root=>path.join(os.tmpdir(),'seeya-preview-'+crypto.createHash('sha256').update(path.resolve(root)).digest('hex').slice(0,16));
