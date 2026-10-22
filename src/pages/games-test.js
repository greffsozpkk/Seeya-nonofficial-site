const render=require('./games');
module.exports=()=>render().replace('<h1>SEEYA PLAY</h1>','<h1>SEEYA PLAY · TEST</h1>').replace('href="/game/worldcup/"','href="/game/worldcup/test/"').replace('씨야와 함께할 새로운 게임을 기다려주세요.','씨야 노래 · 솔로곡 · 뮤비 · 남규리 필모드컵').replace('id="game-worldcup-status">준비중','id="game-worldcup-status">테스트 가능').replace('준비중 안내 보기 <span','월드컵 종류 선택 <span');
