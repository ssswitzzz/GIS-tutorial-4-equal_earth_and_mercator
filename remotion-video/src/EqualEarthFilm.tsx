import React from 'react';
import {AbsoluteFill,useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from './AnimationClock';
import {PaperBackground} from './components/PaperBackground';
import {Annotation,COLORS as C,Heading,Latex,motion,SERIF,usePerfectMapFont} from './perfect-map/Typography';
import {LatitudeCanvas} from './equal-earth/LatitudeCanvas';
import {BEATS,E,mapLand,mapGrid,polarWidthRatio,xFactor,derivativeY,rad} from './equal-earth/model';

export const EqualEarthFilm:React.FC=()=>{
  usePerfectMapFont();const s=useCurrentFrame()/useVideoConfig().fps,{width}=useVideoConfig();
  const mode=motion(s,E.peters,E.peters+5)+motion(s,E.equal,E.equal+5);
  const robinson=motion(s,E.robinson,E.robinson+2)*(1-motion(s,E.returnEqual,E.returnEqual+2));
  const rotation=180*motion(s,E.center,E.center+5)*(1-motion(s,E.returnEqual,E.returnEqual+3));
  const mapOpacity=(1-motion(s,E.slices,E.slices+2))+motion(s,E.land,E.land+3);
  const ending=motion(s,E.land,E.end),context=1-motion(s,14,18);
  const phi=(15+55*motion(s,E.spacing,E.ticks))*rad,h=xFactor(phi)/Math.cos(phi),v=derivativeY(phi);
  const act=s<E.equal?0:s<E.slices?1:s<E.ticks?2:3;
  return <AbsoluteFill style={{overflow:'hidden'}}><div className="equal-earth-stage" data-authored-seconds={s} data-robinson={robinson} style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'top left',fontFamily:SERIF,fontWeight:700,letterSpacing:0,color:C.ink}}>
    <PaperBackground/>
    <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
      <g opacity={mapOpacity} transform={`translate(${ending*35} ${ending*15})`}>
        <path d={mapGrid(mode,rotation*(1-ending),robinson)} fill="none" stroke={C.blue} strokeWidth="1.3" opacity=".4"/>
        <path data-world-map d={mapLand(mode,rotation*(1-ending),robinson)} fill="#b5ccba" stroke="#638774" strokeWidth="1.3"/>
        <rect x="570" y="265" width="660" height="640" fill="none" stroke="#81968b" strokeWidth="7" opacity={context}/>
        <path d="M760 270L900 236L1040 270" fill="none" stroke="#81968b" strokeWidth="3" opacity={context}/>
      </g>
      <g opacity={motion(s,E.spacing,E.spacing+2)*(1-motion(s,E.ticks-1,E.ticks))} transform="translate(1540 520)">
        <rect x="-80" y="-80" width="160" height="160" fill="none" stroke="#a3b9ae" strokeWidth="2" strokeDasharray="7 8"/>
        <rect x={-80*h} y={-80*v} width={160*h} height={160*v} fill="#427d9920" stroke={C.blue} strokeWidth="3"/>
      </g>
    </svg>
    <LatitudeCanvas/>
    {BEATS.map(([start,end,title,eyebrow])=><Heading key={start} start={start} end={end===E.end?end+1:end} eyebrow={eyebrow} size={82}>{title}</Heading>)}
    <Annotation start={16} end={30} x={150} y={925} color={C.red} size={30}>图上的大小，悄悄塑造了我们对世界的印象</Annotation>
    <Annotation start={33} end={53} x={150} y={925} size={30} color={C.muted}>等面积圆柱投影：低纬拉长，高纬压缩</Annotation>
    <Annotation start={0} end={30} x={1300} y={550} size={30} color={C.muted}>南北纬约 85° 以内<br/>保留高纬地区</Annotation>
    <Annotation start={56} end={64} x={150} y={925} size={30} color={C.blue}>三位制图学者，2018 年共同提出</Annotation>
    <Annotation start={66} end={80} x={150} y={925} size={30} color={C.muted}>罗宾森是折中投影，并不保证等面积。</Annotation>
    <Annotation start={82} end={87} x={150} y={925} size={30} color={C.blue}>平等地球：借鉴曲线外形，严格保持面积。</Annotation>
    <Annotation start={91} end={103} x={1370} y={430} size={42}>赤道最大<br/>向两极逐渐缩小</Annotation>
    <Annotation start={106} end={120} x={1350} y={430} size={40}>纬圈剪开<br/>按顺序展开</Annotation>
    <Annotation start={123} end={135} x={1370} y={425} size={38}>纬线不必<br/>全部一样长</Annotation>
    <Annotation start={136} end={147} x={1380} y={440} size={36}>极线宽度约为<br/>赤道的 {(polarWidthRatio*100).toFixed(1)}%</Annotation>
    <Annotation start={149} end={171} x={1330} y={725}><Latex math={String.raw`h=${h.toFixed(2)},\quad v=${v.toFixed(2)}`} size={36}/><div><Latex math={String.raw`hv=1`} size={50} color={C.green}/></div></Annotation>
    <Annotation start={151} end={171} x={150} y={925} size={30} color={C.muted}>这里的横纵补偿指纬带面积；远离中央经线还存在剪切</Annotation>
    <Annotation start={174} end={185} x={1370} y={455} size={40}>等经度间隔<br/>对应等横向间隔</Annotation>
    <Annotation start={188} end={201} x={1370} y={455} size={40}>中央经线直<br/>两侧经线弯</Annotation>
    <Annotation start={208} end={231} x={150} y={925} size={32} color={C.green}>不承诺零失真，选择守住面积。</Annotation>
    <div style={{position:'absolute',bottom:26,left:0,right:0,display:'flex',justifyContent:'center',gap:24}}>{['地图与认知','平等地球','纬带展开','面积与曲线'].map((label,i)=><div key={label} style={{fontSize:30,padding:'8px 22px',borderRadius:6,background:act===i?C.ink:'transparent',color:act===i?'#fffdf8':C.muted}}>{label}</div>)}</div>
  </div></AbsoluteFill>;
};
