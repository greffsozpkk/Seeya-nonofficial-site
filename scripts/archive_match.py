"""Conservative archive identity matching; upload dates are never activity dates."""
import re
from datetime import date
MEMBERS = ('남규리', '김연지', '이보람')
PROGRAMS = (
    ('컬투쇼', '두시탈출컬투쇼'), ('정오의희망곡',), ('12시에주현영',),
    ('한밤의꿈',), ('박명수의라디오쇼', '라디오쇼'), ('인기가요',),
    ('음악중심',), ('뮤직뱅크',), ('엠카운트다운', 'mcountdown'),
    ('불후의명곡',), ('복면가왕',), ('야심만만',), ('스타골든벨',),
    ('유희열의스케치북', '스케치북'), ('우석대', '우석대학교'),
    ('대구전국가요제',), ('thefan', '더팬'), ('제천한방', '제천국제한방'), ('영월정원', '정원산업박람회'), ('케이팝업차트쇼', 'kpopup차트쇼'),
)
BLOCK = re.compile(r'원곡|원키|노래방|커버|cover|reaction|리액션|플레이리스트|모음집|모음|메들리|몰아보기|예고|티저|예정|취소|변경|루머|불참|불발|미출연|AI\s*(?:커버|cover)', re.I)


def key(value):
    return re.sub(r'[^a-z0-9가-힣]', '', str(value).lower())


def video_id(url):
    from discover_archive import canonical
    normalized = canonical(url)
    return normalized.split('watch?v=')[-1] if normalized.startswith('https://www.youtube.com/watch?v=') else ''


def dates(text):
    """Only full dates in a title, never a search year or an upload timestamp."""
    found = set()
    patterns = [r'(?<!\d)(20\d{2}|\d{2})[.\-/ ](\d{1,2})[.\-/ ](\d{1,2})(?!\d)',
                r'(?<!\d)(20\d{2}|\d{2})년\s*(\d{1,2})월\s*(\d{1,2})일',
                r'(?<!\d)(20\d{2}|\d{2})(\d{2})(\d{2})(?!\d)']
    for match in (m for pattern in patterns for m in re.finditer(pattern, text)):
        year, month, day = map(int, match.groups())
        year = year + 2000 if year < 100 else year
        try:
            d = date(year, month, day)
            if 2006 <= year <= date.today().year + 1:
                found.add(d.isoformat())
        except ValueError:
            pass
    return found


def subjects(text):
    return {m for m in MEMBERS if m in text}


def identity(candidate, record):
    names = subjects(candidate['title'])
    target = set(record.get('members', []))
    if names:
        return names <= target
    return ('씨야' in candidate['title'] or re.search(r'\bseeya\b', candidate['title'], re.I)) and set(MEMBERS) <= target


def programs(text):
    normalized = key(text)
    return {aliases[0] for aliases in PROGRAMS if any(a in normalized for a in aliases)}


def same_program(candidate, record):
    a = programs(candidate['title'])
    b = programs(record['title'] + ' ' + record.get('program', ''))
    if a & b:
        return True
    program = key(record.get('program', ''))
    return len(program) >= 5 and program in key(candidate['title'])


def event_dates(record):
    found = dates(record['title'])
    if record.get('dateBasis') in ('event', 'broadcast', 'recording', 'release') and record.get('dateStatus') == 'confirmed':
        found.add(record['date'])
    return found


def matches(candidate, archive):
    """Returns every plausible strong match; never picks the first of several."""
    if BLOCK.search(candidate['title']) or len(dates(candidate['title']))>1:
        return []
    from discover_archive import source_title
    title = key(source_title(candidate['title']) if candidate.get('sourceKind') == 'news' else candidate['title'])
    day = dates(candidate['title'])
    result = []
    for row in archive:
        if row.get('hidden') or row.get('status')=='hidden' or not identity(candidate, row):
            continue
        episode = re.search(r'(?:EP\.?\s*(\d+)|(\d+)\s*회)', candidate['title'], re.I)
        if episode and row.get('episode') and int(next(g for g in episode.groups() if g)) != int(row['episode']):
            continue
        record_days = event_dates(row)
        if day and record_days and not day & record_days:
            continue
        # Long exact titles additionally require the same publication date.
        exact = len(title) >= 18 and title == key(row['title']) and row.get('dateBasis', '').endswith('-published') and row['date'] == candidate.get('publishedDateKST')
        event = len(day) == 1 and len(record_days) == 1 and day == record_days and same_event(candidate, row)
        if exact or event:
            result.append(row)
    # Prefer the researched event card over machine-created clip cards.
    parents = [r for r in result if not r.get('autoDiscovery') and r.get('dateBasis') in ('event','broadcast','recording','release') and r.get('dateStatus')=='confirmed']
    return parents or result


PERFORMANCE_TYPES = {'concert','event','music-show'}
CITY_ALIASES = (('고양','goyang','킨텍스'),('서울','seoul'),('대구','daegu'),
 ('청주','cheongju'),('수원','suwon'),('인천','incheon'),('부산','busan'),
 ('제천','jecheon'),('영월','yeongwol'),('용인','yongin'),('송도','songdo'))
def cities(text):
 text=key(text)
 return {a[0] for a in CITY_ALIASES if any(v in text for v in a)}

def same_event(candidate, record):
 text=candidate['title']; other=record['title']+' '+record.get('program','')+' '+record.get('venue','')
 a,b=cities(text),cities(other)
 if a and b and not a&b:return False
 if same_program(candidate,record):return True
 # City + concert is enough only with an explicit, matching full date and
 # a researched concert card. All plausible cards are retained for ambiguity.
 if record.get('type')=='concert' and a&b and re.search(r'콘서트|concert|the\s*fan|더팬',text,re.I):return True
 # A distinctive program fragment (not a song, artist or generic "concert").
 fragments=re.findall(r'[가-힣A-Za-z]{3,}',record.get('program',''))
 stop={'씨야','THE','FAN','콘서트','전국투어','페스티벌','스페셜','축하공연','라이브'}
 return any(v not in stop and key(v) in key(text) for v in fragments)

def recommendations(candidate, archive):
 strong=matches(candidate,archive)
 return [{'id':r['id'],'title':r['title'],'date':r['date'],'strong':True} for r in strong]
