const render=require('./games');
module.exports=()=>render().replace('href="/game/worldcup/"','href="/game/worldcup/test/"');
