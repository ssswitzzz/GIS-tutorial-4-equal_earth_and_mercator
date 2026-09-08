import React from 'react';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import {Annotation,COLORS as C,Latex,motion} from '../perfect-map/Typography';
import {M} from './timing';
import {linear} from './math';
import {neighborhoodBlock,neighborhoodPoint} from './neighborhood';

export const Navigation: React.FC = () => {
  const s=useCurrentFrame()/useVideoConfig().fps, enter=motion(s,M.navigation,M.navigation+2);
  const drive=linear(s,164,178), x=drive<.5?700:700+(drive-.5)*760, y=drive<.5?860-drive*620:550;
  const example=motion(s,173,174),deform=motion(s,174,181);
  const selected=neighborhoodBlock(387,721,deform);
  const center=selected.reduce((sum,p)=>[sum[0]+p[0]/4,sum[1]+p[1]/4],[0,0]);
  const detail=selected.map(p=>[1515+(p[0]-center[0])*1.5,493+(p[1]-center[1])*1.5]);
  const a=[selected[1][0]-selected[0][0],selected[1][1]-selected[0][1]],b=[selected[3][0]-selected[0][0],selected[3][1]-selected[0][1]];
  const angle=Math.acos((a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b)))*180/Math.PI;
  const warpedPath=(points:number[][])=>points.map(([px,py],i)=>`${i?'L':'M'}${neighborhoodPoint(px,py,deform)}`).join(' ');
  return <div style={{position:'absolute',inset:0,opacity:enter,transform:`translateY(${(1-enter)*55}px)`}}>
    <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
      <defs><clipPath id="street-crop"><rect x="130" y="290" width="1110" height="600"/></clipPath></defs>
      <g clipPath="url(#street-crop)">
        <g opacity={1-example}>
        <rect x="130" y="290" width="1110" height="600" fill="#eef1e8"/>
        {Array.from({length:5},(_,i)=>Array.from({length:3},(_,j)=><rect key={`${i}-${j}`} x={155+i*232} y={305+j*208} width="154" height="130" rx="3" fill={(i+j)%4===0?'#b9d0b4':'#d4ded7'} stroke="#b3c4b9" strokeWidth="2"/>))}
        <path d="M130 550H1240M700 290V890" stroke="#fffefa" strokeWidth="74"/>
        <path d="M130 550H1240M700 290V890" stroke="#b9c8c1" strokeWidth="2" strokeDasharray="13 16"/>
        <path d="M700 870V570Q700 550 720 550H1100" stroke={C.blue} strokeWidth="13" fill="none" strokeLinecap="round"/>
        <path d="M746 550V505H700" fill="none" stroke={C.red} strokeWidth="4"/>
        <g transform={`translate(${x} ${y}) rotate(${90*motion(s,171,171.5)})`}><circle r="28" fill="#fffdf7"/><path d="M0-20L13 15L0 8L-13 15Z" fill={C.blue}/></g>
        </g>
        <g data-neighborhood data-deformation={deform} opacity={example}>
          <polygon points={[[130,290],[1240,290],[1240,890],[130,890]].map(([px,py])=>neighborhoodPoint(px,py,deform).join(',')).join(' ')} fill="#eef1e8"/>
          {Array.from({length:5},(_,i)=>Array.from({length:3},(_,j)=><polygon key={`${i}-${j}`} points={neighborhoodBlock(155+i*232,305+j*208,deform).map(p=>p.join(',')).join(' ')} fill={(i+j)%4===0?'#b9d0b4':'#d4ded7'} stroke="#b3c4b9" strokeWidth="2"/>))}
          {[[[130,550],[1240,550]],[[700,290],[700,890]]].map((line,i)=><g key={i}><path d={warpedPath(line)} stroke="#fffefa" strokeWidth="64"/><path d={warpedPath(line)} stroke="#b9c8c1" strokeWidth="2" strokeDasharray="13 16"/></g>)}
          <path d={warpedPath([[700,870],[700,550],[1100,550]])} fill="none" stroke={C.blue} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          <polygon data-selected-block points={selected.map(p=>p.join(',')).join(' ')} fill="#bf594c22" stroke={C.red} strokeWidth="4"/>
          {selected.map(([px,py],i)=><circle key={i} cx={px} cy={py} r="5" fill={C.red}/>)}
        </g>
      </g>
      <path d="M1300 315V850" stroke="#b9c8c1" strokeWidth="2"/>
      <g opacity={1-example} transform="translate(1515 493)"><path d="M-115 105V-75H100" fill="none" stroke={C.blue} strokeWidth="12" strokeLinecap="round"/><path d="M72-103L104-75L72-47" fill="none" stroke={C.blue} strokeWidth="8"/><path d="M-115-25H-65V-75" fill="none" stroke={C.red} strokeWidth="4"/></g>
      <g opacity={example}>
        <rect x="1399.5" y="395.5" width="231" height="195" fill="none" stroke="#a3b9ae" strokeWidth="2" strokeDasharray="7 8"/>
        <polygon points={detail.map(p=>p.join(',')).join(' ')} fill="#bf594c15" stroke={C.red} strokeWidth="4"/>
        {detail.map(([px,py],i)=><circle key={i} cx={px} cy={py} r="6" fill={C.red}/>)}
      </g>
    </svg>
    <Annotation start={163} end={173.5} x={1400} y={690}><Latex math={String.raw`90^\circ`} size={72} color={C.blue}/><div style={{fontSize:36}}>局部方向，保持直观</div></Annotation>
    <Annotation start={174} end={185} x={1360} y={690}><Latex math={String.raw`${angle.toFixed(1)}^\circ`} size={66} color={C.red}/><div style={{fontSize:34}}>轮廓变了，直角也变了</div></Annotation>
    <Annotation start={174} end={185} x={1360} y={315} size={42}>小区轮廓</Annotation>
    <Annotation start={174} end={185} x={155} y={916} size={30} color={C.muted}>轮廓与角度的夸张变形示意</Annotation>
  </div>;
};
