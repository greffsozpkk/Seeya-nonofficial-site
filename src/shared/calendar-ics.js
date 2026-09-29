'use strict';
const {addDays,timeText}=require('./calendar-data');
const ORIGIN='https://seeya-fanpage.com';
const text=value=>String(value??'').replace(/\\/g,'\\\\').replace(/\r?\n|\r/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const stamp=value=>{const d=new Date(/^\d{4}-\d{2}-\d{2}$/.test(value)?value+'T00:00:00+09:00':value);if(Number.isNaN(d.getTime()))throw Error('Invalid calendar modification date');return d.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';};
function fold(line){let result='',bytes=0;for(const char of line){const n=new TextEncoder().encode(char).length;if(bytes+n>75){result+='\r\n ';bytes=1;}result+=char;bytes+=n;}return result;}
function eventLines(e){
 const url=ORIGIN+'/calendar/?'+(e.annual?'':'month='+e.date.slice(0,7)+'&')+'event='+encodeURIComponent(e.id);
 const lines=['BEGIN:VEVENT','UID:'+e.id+'@seeya-fanpage.com','DTSTAMP:'+stamp(e.updatedAt),'LAST-MODIFIED:'+stamp(e.updatedAt),'SEQUENCE:'+e.sequence];
 if(e.time){lines.push('DTSTART:'+stamp(e.date+'T'+e.time+':00+09:00'));if(e.endTime)lines.push('DTEND:'+stamp((e.endDate||e.date)+'T'+e.endTime+':00+09:00'));}
 else lines.push('DTSTART;VALUE=DATE:'+e.date.replace(/-/g,''),'DTEND;VALUE=DATE:'+addDays(e.endDate||e.date,1).replace(/-/g,''));
 if(e.annual)lines.push('RRULE:FREQ=YEARLY');
 lines.push('SUMMARY:'+text((e.state==='cancelled'?'[취소] ':e.state==='changed'?'[변경] ':'')+e.title),'STATUS:'+(e.state==='cancelled'?'CANCELLED':'CONFIRMED'),'TRANSP:TRANSPARENT','CATEGORIES:'+text(e.type),'LOCATION:'+text(e.venue),'DESCRIPTION:'+text([e.members.join(' · '),timeText(e),e.note,...e.sources.map(s=>s.label+': '+(s.url.startsWith('/')?ORIGIN+s.url:s.url)),...e.recordIds.map(id=>ORIGIN+'/archive/?record='+encodeURIComponent(id))].filter(Boolean).join('\n')),'URL:'+url,'END:VEVENT');
 return lines;
}
function calendarICS(events,name='씨야 활동 일정'){return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SEEYA ARCHIVE//Calendar//KO','CALSCALE:GREGORIAN','X-WR-CALNAME:'+text(name),'X-WR-TIMEZONE:Asia/Seoul',...events.flatMap(eventLines),'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';}
module.exports={calendarICS,fold,text,stamp};
