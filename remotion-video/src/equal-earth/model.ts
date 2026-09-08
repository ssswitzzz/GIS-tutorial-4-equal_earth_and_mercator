import {geoEqualEarthRaw,geoMercatorRaw,geoProjection,geoPath,geoGraticule} from 'd3-geo';
import {geoRobinsonRaw} from 'd3-geo-projection';
import {boundedMercatorLatitude} from '../mercator/extent';
import {WORLD} from '../perfect-map/math';
export const E={context:0,peters:30,equal:53,robinson:64,center:72,returnEqual:80,slices:87,open:103,width:120,spacing:147,ticks:171,meridians:185,land:204,end:230} as const;
export const BEATS=[
  [0,14,'地图的用途，改变了。','从导航屏幕，到教室墙面'],
  [14,30,'看久了，失真就成了印象。','高纬地区与低纬地区'],
  [30,42,'保住面积，先付出形状代价。','高尔—彼得斯投影'],
  [42,53,'面积平等，也需要视觉平衡。','等积不是唯一的设计指标'],
  [53,64,'2018 年，平等地球。','面积与外形的共同设计'],
  [64,72,'弧形经线，来自罗宾森的启发。','罗宾森投影 · 折中之美'],
  [72,80,'换个中心，看同一个世界。','罗宾森投影 · 中央经线 180°'],
  [80,87,'回到平等地球，拆解它的构造。','从外形之美，到面积守恒'],
  [87,103,'沿着纬度，把地球分层。','从球面纬带开始'],
  [103,120,'剪开圆环，展开成横线。','先理解横向长度'],
  [120,135,'中间宽，两端自然收拢。','纬线长度的选择'],
  [135,147,'有限的平头，代替无限膨胀。','极点的边界表示'],
  [147,160,'横向伸缩，纵向精确补偿。','面积守恒的关键'],
  [160,171,'守住的，是每一条纬带的面积。','真实公式驱动的间距'],
  [171,185,'在每条纬线上，均匀标经度。','先点出位置'],
  [185,204,'连接同经度，弧线自然出现。','中央笔直，两侧弯曲'],
  [204,230,'面积有依据，曲线有分寸。','平等地球 · 让世界回到比例之中'],
] as const;
export const rad=Math.PI/180;
export const ee=(lon:number,lat:number)=>geoEqualEarthRaw(lon,lat);
export const xFactor=(phi:number)=>ee(1,phi)[0];
export const derivativeY=(phi:number)=>(ee(0,phi+1e-5)[1]-ee(0,phi-1e-5)[1])/2e-5;
export const polarWidthRatio=xFactor(Math.PI/2)/xFactor(0);
export const latitudes=Array.from({length:19},(_,i)=>90-i*10);
export const ringsPoint=(lon:number,phi:number,open:number,width:number,spacing:number):[number,number,number]=>{
  const r=220, naturalX=r*lon*Math.cos(phi), finalX=r*ee(lon,phi)[0];
  const flatX=naturalX*(1-width)+finalX*width;
  const flatY=r*phi*(1-spacing)+r*ee(lon,phi)[1]*spacing;
  return [r*Math.cos(phi)*Math.sin(lon)*(1-open)+flatX*open,r*Math.sin(phi)*(1-open)+flatY*open,r*Math.cos(phi)*Math.cos(lon)*(1-open)];
};
export const mapProjection=(mode:number,rotation=0,robinson=0)=>geoProjection((lon,lat)=>{
  const merc=geoMercatorRaw(lon,boundedMercatorLatitude(lat)).map(v=>v*100/220),peters=[lon*Math.SQRT1_2,Math.sin(lat)/Math.SQRT1_2],equal=ee(lon,lat);
  const a=mode<=1?merc:peters,b=mode<=1?peters:equal,t=Math.min(1,mode<=1?mode:mode-1);
  const r=geoRobinsonRaw(lon,lat).map(v=>v*190/220);
  return [(a[0]*(1-t)+b[0]*t)*(1-robinson)+r[0]*robinson,(a[1]*(1-t)+b[1]*t)*(1-robinson)+r[1]*robinson];
}).scale(220).translate([900,585]).rotate([-rotation,0]).precision(.4).clipExtent([[115,265],[1775,910]]);
export const mapLand=(mode:number,rotation=0,robinson=0)=>geoPath(mapProjection(mode,rotation,robinson))(WORLD)??'';
export const mapGrid=(mode:number,rotation=0,robinson=0)=>geoPath(mapProjection(mode,rotation,robinson))(geoGraticule().step([30,15])())??'';
