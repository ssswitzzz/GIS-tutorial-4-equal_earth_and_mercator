import React from 'react';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import {COLORS as C,Latex,motion} from '../perfect-map/Typography';
import {localScale} from './math';

// Infinitesimal indicatrices, rather than finite geographic circles: radius scales by sec(latitude).
export const TissotComparison: React.FC = () => {
  const s=useCurrentFrame()/useVideoConfig().fps;
  const opacity=motion(s,135,137)*(1-motion(s,150,151));
  if(opacity<=0)return null;
  return <div style={{position:'absolute',inset:0,opacity}}>
    <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
      <rect x="125" y="300" width="1165" height="585" fill={C.paper} opacity=".97"/>
      {[0,45,70].map((lat,i)=>{
        const x=335+i*360, progress=motion(s,136+i*1.2,140+i*1.2), radius=43*(1+(localScale(lat)-1)*progress);
        return <g key={lat} transform={`translate(${x} 545)`}><circle r="43" fill="none" stroke="#a2b8b0" strokeWidth="2" strokeDasharray="7 8"/><circle r={radius} fill="#bf594c12" stroke={C.red} strokeWidth="4"/><path d={`M${-radius} 0H${radius}M0 ${-radius}V${radius}`} stroke={C.blue} strokeWidth="2"/></g>;
      })}
    </svg>
    {[0,45,70].map((lat,i)=><div key={lat} data-annotation style={{position:'absolute',left:210+i*360,top:735,width:250,textAlign:'center'}}><Latex math={String.raw`\varphi=${lat}^\circ`} size={38}/><div><Latex math={String.raw`k^2=${(localScale(lat)**2).toFixed(2)}`} size={38} color={C.red}/></div></div>)}
    <div data-annotation style={{position:'absolute',left:160,top:325,fontSize:34,color:C.ink}}>相同的球面微元，不同的图上面积</div>
  </div>;
};
