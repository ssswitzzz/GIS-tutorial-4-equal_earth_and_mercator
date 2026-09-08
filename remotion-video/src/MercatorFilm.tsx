import React from 'react';
import {AbsoluteFill,useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from './AnimationClock';
import {PaperBackground} from './components/PaperBackground';
import {Annotation,COLORS as C,Heading,Latex,SERIF,usePerfectMapFont} from './perfect-map/Typography';
import {CylinderCanvas} from './mercator/CylinderCanvas';
import {MapExperiment} from './mercator/MapExperiment';
import {Navigation} from './mercator/Navigation';
import {TissotComparison} from './mercator/TissotComparison';
import {M,MERCATOR_BEATS} from './mercator/timing';

export const MercatorFilm: React.FC = () => {
  usePerfectMapFont(); const {fps,width}=useVideoConfig(), s=useCurrentFrame()/fps;
  const act=s<23?0:s<61?1:s<135?2:3;
  return <AbsoluteFill style={{overflow:'hidden'}}><div className="mercator-stage" style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'top left',fontFamily:SERIF,fontWeight:700,letterSpacing:0,color:C.ink}}>
    <PaperBackground/>
    <CylinderCanvas/>
    <MapExperiment/>
    <TissotComparison/>
    <Navigation/>
    {MERCATOR_BEATS.map(beat=><Heading key={beat.start} start={beat.start} end={beat.end===M.end?M.end+1:beat.end} eyebrow={beat.eyebrow} size={84}>{beat.title}</Heading>)}
    <Annotation start={25} end={35} x={1340} y={445} size={48}>地球，套进圆柱</Annotation>
    <Annotation start={36} end={45} x={1340} y={445} size={48} color={C.red}>赤道相切</Annotation>
    <Annotation start={37} end={45} x={1340} y={540} size={32}>圆柱轴与地轴重合</Annotation>
    <Annotation start={37} end={49} x={1340} y={700} size={34}>海岸轮廓<br/>从球面，移向圆柱</Annotation>
    <Annotation start={50} end={61} x={1300} y={820} size={32}>切开 → 展平</Annotation>
    <Annotation start={28} end={61} x={150} y={915} size={30} color={C.muted}>圆柱为构造示意；墨卡托不是从球心发光的透视投影</Annotation>
    <Annotation start={102} end={115} x={160} y={915}><Latex math={String.raw`x=R\lambda,\qquad y=R\ln\tan\left(\frac{\pi}{4}+\frac{\varphi}{2}\right)`} size={34}/></Annotation>
    <div style={{position:'absolute',left:0,right:0,bottom:30,display:'flex',justifyContent:'center',gap:28}}>{['航海使命','圆柱构造','等角原理','代价与用途'].map((label,i)=><div key={label} style={{fontSize:30,padding:'8px 24px',borderRadius:6,whiteSpace:'nowrap',color:act===i?'#fcfbf5':C.muted,background:act===i?C.ink:'transparent'}}>{label}</div>)}</div>
  </div></AbsoluteFill>;
};
