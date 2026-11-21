const render=require('./games');
module.exports=()=>render().replace('href="/game/worldcup/"','href="/game/worldcup/test/"').replace('href="/game/my-concert/"','href="/game/my-concert/test/"').replace('href="/game/our-stage/"','href="/game/our-stage/test/"');
