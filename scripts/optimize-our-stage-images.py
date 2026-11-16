from pathlib import Path
import json,time
from PIL import Image,ImageChops
root=Path('images/game/our-stage');mapping={};report=[]
sources='\n'.join(x.read_text(encoding='utf-8') for x in [Path('src/client/our-stage.js'),Path('src/styles/our-stage.css'),*[Path('src/data')/('our-stage-'+n+'.json')for n in ['layers','badge-art','stories']]])
for p in root.rglob('*.png'):
 if p.name not in sources and p.with_suffix('.webp').name not in sources:continue
 # Original PNGs remain the editable source and rollback path.
 out=p.with_suffix('.webp')
 with Image.open(p) as im:
  im=im.convert('RGBA');im.save(out,'WEBP',lossless=True,exact=False,method=6)
  with Image.open(out) as back:
   back=back.convert('RGBA');assert im.size==back.size
   assert im.getchannel('A').tobytes()==back.getchannel('A').tobytes()
   # RGB under fully transparent pixels is not displayed.
   assert Image.alpha_composite(Image.new('RGBA',im.size),im).tobytes()==Image.alpha_composite(Image.new('RGBA',im.size),back).tobytes()
 if out.stat().st_size>=p.stat().st_size:out.unlink();continue
 mapping['/'+p.as_posix()]='/'+out.as_posix();report.append({'file':str(p),'pngBytes':p.stat().st_size,'webpBytes':out.stat().st_size})
Path('src/data/our-stage-optimized-images.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
Path('output/our-stage/image-optimization-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print({'images':len(report),'before':sum(x['pngBytes']for x in report),'after':sum(x['webpBytes']for x in report)})

