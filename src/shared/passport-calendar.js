'use strict';
const P=require('./passport');
function selectedEvent(event,requested='',today=P.today()){
 if(!event)return undefined;
 let day=event.date;
 if(event.annual){
  const candidate=requested||today.slice(0,4)+event.date.slice(4);
  try{if(P.date(candidate).length===10&&candidate.slice(4)===event.date.slice(4)&&candidate>=event.date)day=candidate;}catch{}
 }else if(requested){try{if(P.date(requested).length===10&&requested>=event.date&&requested<=(event.rangeEndDate||event.endDate||event.date))day=requested;}catch{}}
 return {...event,date:day};
}
module.exports={selectedEvent};
