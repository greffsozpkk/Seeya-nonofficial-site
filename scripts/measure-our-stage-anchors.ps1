Add-Type -AssemblyName System.Drawing
$ErrorActionPreference='Stop'
Add-Type -ReferencedAssemblies System.Drawing.Common,System.Drawing.Primitives,System.Private.Windows.Core,System.Private.Windows.GdiPlus,System.Collections -TypeDefinition @'
using System;
using System.Drawing;
using System.Collections.Generic;
public static class StageAnchors {
 static bool Skin(Color c) { return c.A>230 && c.R>180 && c.G>105 && c.B>70 && c.R-c.G>18 && c.G-c.B>8; }
 static double[] Run(Bitmap b,int x,int y,int w) {
  int start=-1,best=0,left=0;
  for(int i=x;i<=x+w;i++) { bool skin=i<x+w&&Skin(b.GetPixel(i,y)); if(skin&&start<0)start=i;
   if(!skin&&start>=0){if(i-start>best){best=i-start;left=start;}start=-1;} }
  return new double[]{left+best/2.0,best};
 }
 public static double[] Measure(string path,int[] h,int chin,int[] body){
  using(var b=new Bitmap(path)) {
   var centers=new List<double>();int bottom=chin;
   for(int y=chin-30;y<=chin+20;y++){var a=Run(b,h[0],y,h[2]);if(a[1]>h[2]*.18){centers.Add(a[0]);bottom=y;}}
   if(centers.Count==0)throw new Exception("No chin: "+path);
   // Lowest face rows exclude ears and the asymmetric hair silhouette.
   centers.Clear();for(int y=bottom-9;y<=bottom;y++){var a=Run(b,h[0],y,h[2]);if(a[1]>h[2]*.18)centers.Add(a[0]);}centers.Sort();
   double hx=centers[centers.Count/2];var necks=new List<double>();int top=-1;
   for(int y=body[1];y<body[1]+65;y++){var a=Run(b,body[0],y,body[2]);if(a[1]>15){if(top<0)top=y;if(y<top+10)necks.Add(a[0]);}}
   if(necks.Count==0)throw new Exception("No neck: "+path);necks.Sort();
   return new double[]{hx,bottom+1,necks[necks.Count/2],top};
  }
 }
}
'@
$layers=Get-Content src/data/our-stage-layers.json -Raw | ConvertFrom-Json -AsHashtable
$result=@{}
foreach($id in $layers.Keys){$l=$layers[$id];$result[$id]=@{};foreach($m in @('br','gr','yj')){$p=$l.members[$m];$a=[StageAnchors]::Measure((Join-Path (Get-Location) $l.image.TrimStart('/')),[int[]]$p.head,[int]$p.chin,[int[]]$p.body);$result[$id][$m]=@{head=@($a[0],$a[1]);neck=@($a[2],$a[3])}}}
$result | ConvertTo-Json -Depth 6 | Set-Content -Encoding utf8 src/data/our-stage-anchors.json
