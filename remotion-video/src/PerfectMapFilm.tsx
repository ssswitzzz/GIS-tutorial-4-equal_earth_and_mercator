import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from './AnimationClock';
import {geoEquirectangular, geoPath} from 'd3-geo';
import {PaperBackground} from './components/PaperBackground';
import {GeometryCanvas} from './perfect-map/GeometryCanvas';
import {ProjectionLab} from './perfect-map/ProjectionLab';
import {ProjectionChoices} from './perfect-map/ProjectionChoices';
import {Annotation, COLORS as C, Heading, Latex, motion, SERIF, usePerfectMapFont} from './perfect-map/Typography';
import {EVENTS as T} from './perfect-map/timing';
import {WORLD} from './perfect-map/math';

const diagramMap = geoPath(geoEquirectangular().scale(105).translate([1400, 560]))(WORLD) ?? '';

export const PerfectMapFilm: React.FC = () => {
  usePerfectMapFont(); const frame = useCurrentFrame(); const {fps, width} = useVideoConfig(); const s = frame / fps;
  const flat = motion(s, 2, 5) * (1 - motion(s, T.theorem, T.theorem + 2));
  const measure = motion(s, T.routes, T.routes + 2), second = motion(s, T.secondRoute, T.secondRoute + 2);
  const theorem = motion(s, T.theorem, T.theorem + 2) * (1 - motion(s, T.curvature, T.curvature + 1));
  const section = motion(s, T.sections, T.sections + 3) * (1 - motion(s, T.flatten, T.flatten + 1));
  const activeAct = s < T.theorem ? 0 : s < T.peel ? 1 : s < T.choices ? 2 : 3;
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <div className="perfect-map-stage" style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: 'top left', fontFamily: SERIF, fontWeight: 700, color: C.ink, letterSpacing: 0}}>
      <PaperBackground/>
      <GeometryCanvas/>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <g opacity={flat}>
          <path d={diagramMap} fill="#d4e2d7" stroke="#8ca79a" strokeWidth="1.3"/>
          <path d="M1055 725H1745M1055 395H1745M1070 390V730M1400 390V730M1730 390V730" fill="none" stroke="#aabeb8" strokeWidth="1"/>
          <path d="M1400 560H1510" stroke={C.blue} strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - measure}/>
          <path d="M1400 450H1510" stroke={C.red} strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - second}/>
          {[450, 560].map((y, i) => <g key={y} opacity={i ? measure : second}><circle cx="1400" cy={y} r="6" fill={i ? C.blue : C.red}/><circle cx="1510" cy={y} r="6" fill={i ? C.blue : C.red}/></g>)}
          <path d="M865 553H985M965 537L985 553L965 569" fill="none" stroke={C.blue} strokeWidth="3"/>
        </g>
        <g opacity={section} transform="translate(570 580)">
          <ellipse rx="222" ry="64" transform="rotate(-22)" fill="none" stroke={C.blue} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - motion(s, T.sections, T.sections + 2)}/>
          <ellipse rx="62" ry="232" transform="rotate(-22)" fill="none" stroke={C.red} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - motion(s, T.sections + 1, T.sections + 3)}/>
        </g>
        <g opacity={theorem} transform={`translate(${55 * (1 - theorem)} 0)`}>
          <path d="M1000 690V330H1735V690" fill="none" stroke="#9aafa6" strokeWidth="4"/>
          <path d="M1000 695H1735" stroke={C.red} strokeWidth="5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - motion(s, T.theorem + 3, T.theorem + 5)}/>
        </g>
      </svg>
      <ProjectionLab/>
      <ProjectionChoices/>

      <Heading start={0} end={10} eyebrow="地图的数学边界">完美的平面地图，<span style={{color: C.red}}>不存在。</span></Heading>
      <Heading start={10} end={26} eyebrow="先定义我们想要的完美">所有距离，都按同一比例。</Heading>
      <Heading start={26} end={35} eyebrow="1827 年 · 高斯">通往完美的门，被数学关上。</Heading>
      <Heading start={35} end={46} eyebrow="高斯绝妙定理">曲率，藏在曲面自身。</Heading>
      <Heading start={46} end={58} eyebrow="球面与平面">不是同一种几何。</Heading>
      <Heading start={58} end={70} eyebrow="只取一小块，也无法例外">压平，必然改变距离。</Heading>
      <Heading start={70} end={86} eyebrow="把数学，拿在手里">一张完整橘皮，无法无损展平。</Heading>
      <Heading start={86} end={94} eyebrow="既然变形不可避免">那就决定，保住什么。</Heading>
      <Heading start={94} end={116} eyebrow="第一种取舍 · 等角">保局部角度，付出面积代价。</Heading>
      <Heading start={116} end={138} eyebrow="第二种取舍 · 等积">面积守住了，形状让一步。</Heading>
      <Heading start={138} end={162} eyebrow="第三种取舍 · 等距">保住指定距离，并非所有距离。</Heading>
      <Heading start={162} end={177} eyebrow="每一种投影，都是一次权衡">不存在完美，只有取舍。</Heading>

      <Annotation start={3} end={26} x={440} y={838} color={C.blue}>球面上的真实距离</Annotation>
      <Annotation start={4} end={26} x={1260} y={810} color={C.blue}>平面上的地图距离</Annotation>
      <Annotation start={11} end={21.5} x={760} y={900}><Latex math={String.raw`d_{\mathrm{map}}(P,Q)=c\,d_{\mathrm{sphere}}(P,Q)`} size={40}/></Annotation>
      <Annotation start={22} end={26} x={1070} y={885} color={C.red}>同样的图上长度，却不是同样的真实距离</Annotation>
      <Annotation start={28} end={46} x={1070} y={410} size={72}>高斯绝妙定理</Annotation>
      <Annotation start={30} end={46} x={1080} y={540}>局部等距 <Latex math={String.raw`\Longrightarrow\;K`} size={42}/> 不变</Annotation>
      <Annotation start={46} end={58} x={375} y={852}><Latex math={String.raw`K=\frac{1}{R^2}>0`} size={50} color={C.green}/></Annotation>
      <Annotation start={46} end={70} x={1270} y={852}><Latex math={String.raw`K=0`} size={50} color={C.blue}/></Annotation>
      <Annotation start={48} end={58} x={890} y={525}><Latex math={String.raw`\neq`} size={80} color={C.red}/></Annotation>
      <Annotation start={60} end={70} x={340} y={852} color={C.red}>径向不变，圆周就被拉长</Annotation>
      <Annotation start={62} end={70} x={775} y={360}><Latex math={String.raw`2\pi R\sin\theta<2\pi R\theta`} size={36} color={C.red}/></Annotation>
      <Annotation start={72} end={78} x={190} y={460} color={C.orange} size={54}>完整曲面</Annotation>
      <Annotation start={75} end={82} x={1130} y={895} color={C.red}>切开，才有展开的空间</Annotation>
      <Annotation start={82} end={86} x={540} y={897} color={C.red}>切缝出现；每一瓣内部，仍然存在变形</Annotation>
      <Annotation start={166} end={177} x={150} y={418} size={100}>地图背后，<br/><span style={{color: C.red}}>是制图师的选择。</span></Annotation>
      <Annotation start={169} end={177} x={154} y={728} color={C.muted}>你想保住的，决定了你必须放弃的。</Annotation>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 36, display: 'flex', justifyContent: 'center', gap: 28}}>{['完美假想', '曲率约束', '橘皮直觉', '投影取舍'].map((label, i) => <div key={label} style={{fontSize: 30, whiteSpace: 'nowrap', padding: '8px 24px', borderRadius: 6, color: activeAct === i ? '#fcfbf5' : C.muted, background: activeAct === i ? C.ink : 'transparent'}}>{label}</div>)}</div>
    </div>
  </AbsoluteFill>;
};
