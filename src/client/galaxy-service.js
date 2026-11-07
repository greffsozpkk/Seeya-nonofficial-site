'use strict';

const service = 'seeya-galaxy-test-v1';
const messages = {
 PASSWORD:'편지 비밀번호가 맞지 않아요.',
 LIMIT:'비밀번호를 여러 번 틀렸어요. 1분 뒤 다시 시도해 주세요.',
 MISSING:'이미 삭제된 편지예요.',
 CONFLICT:'다른 창에서 먼저 변경했어요. 최신 편지를 다시 열어주세요.',
 INVALID:'편지와 별 설정을 다시 확인해 주세요.',
 SETUP:'운영자가 구글 시트 연결을 마치면 이용할 수 있어요.',
 BUSY:'다른 편지를 저장하고 있어요. 잠시 후 다시 눌러주세요.'
};

module.exports = function galaxyService(endpoint) {
 if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) return null;
 async function call(payload) {
  const controller = new AbortController(), timeout = setTimeout(()=>controller.abort(),35000);
  try {
   const options = {credentials:'omit',signal:controller.signal};
   if (payload) Object.assign(options,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({service,...payload})});
   const response = await fetch(payload ? endpoint : endpoint+'?t='+Date.now(),options);
   if (!response.ok) throw Error();
   const data = await response.json();
   if (data.service !== service) throw Error();
   if (!data.ok) throw Object.assign(Error(messages[data.code] || '구글 시트 요청을 처리하지 못했어요.'),{code:data.code});
   return data;
  } catch (e) {
   if (e.code && messages[e.code]) throw e;
   throw Error(payload ? '저장 결과를 확인하지 못했어요. 이 창에서 다시 눌러 확인해 주세요.' : '공유 편지를 불러오지 못했어요. 잠시 후 자동으로 다시 확인할게요.');
  } finally { clearTimeout(timeout); }
 }
 return {list:async()=>{const data=await call();if (!Array.isArray(data.letters)) throw Error('편지 목록을 확인할 수 없어요.');return data.letters;}, change:call};
};
