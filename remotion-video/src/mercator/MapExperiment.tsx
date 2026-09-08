import React from 'react';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import {Annotation, COLORS as C, Latex, motion} from '../perfect-map/Typography';
import {M} from './timing';
import {areaGraphPoint, bearing, bearingDegrees, departure, destination, linear, localScale, rhumbPoint, seaGrid, seaLand, seaMap, SEA_VIEW} from './math';

export const MapExperiment: React.FC = () => {
  const s = useCurrentFrame() / useVideoConfig().fps;
  const reveal = motion(s, M.flat-1, M.flat+2) * (1 - motion(s, M.navigation, M.navigation + 2));
  const diagramReveal = motion(s,M.meridians,M.meridians+1)*(1-motion(s,M.navigation,M.navigation+2));
  const early = (1 - motion(s, M.wrap, M.wrap + 2));
  const north = linear(s, M.east, M.wrong), compensation = linear(s, M.correct, M.corrected);
  const inflation = linear(s, M.inflation, M.poles);
  const latitude = s < M.inflation ? 60 * north : 60 + 25 * inflation;
  const k = localScale(latitude), kx = s >= M.east ? Math.min(k, 4) : 1, ky = s < M.correct ? 1 : 1 + (kx - 1) * compensation;
  const route = linear(s, M.route, M.arrive), head = seaMap(rhumbPoint(route))!, start = seaMap(departure)!, end = seaMap(destination)!;
  const seaIntro = seaMap(rhumbPoint(linear(s, 3, 21)))!;
  const routeVisible=Math.max(early,motion(s,M.route,M.route+1)*(1-motion(s,M.inflation,M.inflation+1)));
  const zoom=1+(288/SEA_VIEW.scale-1)*routeVisible;
  const viewPoint=(p:number[])=>[SEA_VIEW.x+(p[0]-SEA_VIEW.x)*zoom+240*routeVisible,SEA_VIEW.y+(p[1]-SEA_VIEW.y)*zoom+100*routeVisible];
  const routeStart=viewPoint(start),routeEnd=viewPoint(end),routeHead=viewPoint(s<M.wrap?seaIntro:head);
  const graphPoint=areaGraphPoint(latitude);
  return <>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      <defs><clipPath id="mercator-safe"><rect x="110" y="235" width="1190" height="670"/></clipPath></defs>
      <g data-mercator-map opacity={Math.max(reveal, early * .65)} clipPath="url(#mercator-safe)">
        <g transform={`translate(${240*routeVisible} ${100*routeVisible}) translate(${SEA_VIEW.x} ${SEA_VIEW.y}) scale(${zoom}) translate(${-SEA_VIEW.x} ${-SEA_VIEW.y})`}>
        <path d={seaGrid} fill="none" stroke="#8daeb5" strokeWidth="1.2" opacity=".5"/>
        <path d={seaLand} fill="#d3e1d6" stroke="#87a392" strokeWidth="1.3"/>
        </g>
        <g opacity={motion(s, M.meridians, M.meridians + 3) * (1 - motion(s, M.route, M.route + 1))}>
          {[-120, -60, 0, 60, 120].map(lon => {const p = seaMap([lon, 0])!; return <path key={lon} d={`M${p[0]} ${SEA_VIEW.y-SEA_VIEW.scale*Math.PI}V${SEA_VIEW.y+SEA_VIEW.scale*Math.PI}`} stroke={C.blue} strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - motion(s, M.meridians + (lon + 120) / 120, M.meridians + 6)}/>;})}
        </g>
        <g opacity={motion(s, M.east, M.east + 1) * (1 - motion(s, M.route, M.route + 1))}>
          <path d={`M180 ${seaMap([0, Math.min(latitude, 70)])![1]}H1250`} stroke={C.red} strokeWidth="3" strokeDasharray="10 10"/>
        </g>
        <g data-sea-route opacity={routeVisible}>
          <path d={`M${routeStart}L${routeEnd}`} stroke={C.blue} strokeWidth="2" strokeDasharray="7 9" fill="none"/>
          <path d={`M${routeStart}L${routeHead}`} stroke={C.red} strokeWidth="4" fill="none"/>
          {[routeStart,routeEnd].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="6" fill="#fffdf7" stroke={C.blue} strokeWidth="2"/>)}
          <g transform={`translate(${routeHead}) rotate(${bearingDegrees})`}><path d="M0-13L8 10L0 5L-8 10Z" fill={C.red} stroke="#fffdf6" strokeWidth="2"/></g>
          <text x={routeStart[0]+18} y={routeStart[1]-20} fill={C.blue} fontSize="30">加那利群岛近海</text>
          <text x={routeEnd[0]-18} y={routeEnd[1]+42} textAnchor="end" fill={C.blue} fontSize="30">小安的列斯群岛近海</text>
        </g>
      </g>
      <g opacity={diagramReveal}>
        {s < M.route && <g transform="translate(1560 495)">
          <circle r="80" fill="none" stroke="#a6b9b2" strokeWidth="2" strokeDasharray="7 8"/>
          <ellipse rx={80 * kx} ry={80 * ky} fill="#427d9918" stroke={ky === kx ? C.green : C.red} strokeWidth="4"/>
          <path d={`M${-80*kx} 0H${80*kx}M0 ${-80*ky}V${80*ky}M0 0L${56*kx} ${-56*ky}`} stroke={C.blue} fill="none" strokeWidth="3"/>
        </g>}
        {s >= M.route && s < M.inflation && <g transform="translate(1560 500)">
          <circle r="128" fill="none" stroke="#819e98" strokeWidth="2"/>
          {Array.from({length:24},(_,i)=><path key={i} d="M0-128V-116" stroke="#819e98" strokeWidth="2" transform={`rotate(${i*15})`}/>)}
          <path d="M0-110V110M-110 0H110" stroke="#b8c9c1" strokeWidth="1.5"/>
          <g transform={`rotate(${bearing*180/Math.PI})`}><path d="M0-94L17 22L0 10L-17 22Z" fill={C.red}/><path d="M0 94L17 22L0 10L-17 22Z" fill={C.blue}/></g>
        </g>}
        {s >= M.inflation && <g transform="translate(1370 815)">
          <path d="M0-420V0H400" fill="none" stroke="#a5bcb5" strokeWidth="2"/>
          <path data-area-curve d={Array.from({length:161},(_,i)=>`${i?'L':'M'}${areaGraphPoint(latitude*i/160)}`).join(' ')} stroke={C.red} strokeWidth="4" fill="none"/>
          <circle data-area-tip cx={graphPoint[0]} cy={graphPoint[1]} r="8" fill={C.red}/>
          <text x="0" y="48" fill={C.muted} fontSize="30">面积倍数 · 对数刻度</text>
        </g>}
      </g>
    </svg>
    <Annotation start={2} end={23} x={1370} y={380} size={100} color={C.blue}>1569</Annotation>
    <Annotation start={5} end={23} x={1380} y={540} size={44}>一张航海工具图</Annotation>
    <Annotation start={10} end={23} x={1380} y={615} color={C.muted}>方向，关乎抵达。</Annotation>
    <Annotation start={2} end={23} x={150} y={909} size={30} color={C.muted}>大西洋等角航线示意，非某次历史航行的复原</Annotation>
    <Annotation start={63} end={74} x={1370} y={730} size={38}>经线平行，间距一致</Annotation>
    <Annotation start={75} end={98} x={1380} y={730}><Latex math={String.raw`k_{x}=\sec\varphi`} size={42} color={C.red}/><div style={{fontSize:32,marginTop:20}}>横向比例开始改变</div></Annotation>
    <Annotation start={88} end={98} x={1380} y={280} size={38} color={C.red}>圆，被拉成椭圆</Annotation>
    <Annotation start={99} end={115} x={1380} y={730}><Latex math={String.raw`k_x=k_y=\sec\varphi`} size={35} color={C.green}/><div style={{fontSize:32,marginTop:20}}>局部角度恢复</div></Annotation>
    <Annotation start={117} end={135} x={1440} y={690}><Latex math={String.raw`\alpha=${bearingDegrees.toFixed(1)}^\circ`} size={52} color={C.blue}/></Annotation>
    <Annotation start={118} end={135} x={1380} y={810} size={32}>相对正北，保持同一夹角</Annotation>
    <Annotation start={121} end={135} x={150} y={909} size={30} color={C.muted}>等角航线通常不是球面最短路径；示意不考虑风、流和障碍</Annotation>
    <Annotation start={136} end={151} x={1370} y={285}><Latex math={String.raw`\varphi=${latitude.toFixed(0)}^\circ`} size={40}/><div><Latex math={String.raw`k^2=${(k*k).toFixed(1)}`} size={50} color={C.red}/></div></Annotation>
    <Annotation start={151} end={161} x={1370} y={285}><Latex math={String.raw`\varphi\to\pm90^\circ`} size={40}/><div><Latex math={String.raw`y\to\pm\infty`} size={50} color={C.red}/></div></Annotation>
    <Annotation start={153} end={161} x={150} y={909} size={30} color={C.muted}>北极趋向正无穷，南极趋向负无穷；地图必须截断</Annotation>
  </>;
};
