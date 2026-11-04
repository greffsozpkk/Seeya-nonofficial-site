const render=require('./my-concert-test');
module.exports=()=>render().replaceAll('/game/test/','/game/');
