import React from 'react';
import {geoPath, geoCircle} from 'd3-geo';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import {projectionFor, landPath, graticule, geodesic, MERCATOR_SCALE, Point, RAD} from './math';
import {COLORS as C, Latex, motion} from './Typography';
import {EVENTS as T} from './timing';

export const ProjectionLab: React.FC = () => {
  const s = useCurrentFrame() / useVideoConfig().fps;
  const enter = motion(s, T.conformal, T.conformal + 1.5), exit = motion(s, T.conclusion, T.final);
  const mode = motion(s, T.equalArea, T.equalArea + 2) + motion(s, T.equidistant, T.equidistant + 2);
  const projection = projectionFor(mode), path = geoPath(projection);
  const latitude = 60 * Math.min(1, Math.max(0, (s - T.latitude) / (T.highLatitude - T.latitude)));
  const k = MERCATOR_SCALE(latitude);
  const stretch = 1 + 1.3 * Math.min(1, Math.max(0, (s - T.squeeze) / (T.squeezed - T.squeeze)));
  const isArea = s >= T.equalArea && s < T.equidistant, isDistance = s >= T.equidistant;
  const origin: Point = [20, 15], a: Point = [-35, 45], b: Point = [85, 40];
  const o = projection(origin)!, pa = projection(a)!, pb = projection(b)!;
  const destinations=[a,b,[-5,-32] as Point];
  const ray = motion(s, T.rays, T.rays + 3), cross = motion(s, T.crossDistance, T.crossDistance + 3);
  if(s<T.conformal||s>=T.final)return null;
  return <div data-projection-lab style={{position: 'absolute', inset: 0, opacity: enter * (1 - exit), transform: `translateY(${(1 - enter) * 65}px)`}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      <defs><clipPath id="lab-map"><rect x="100" y="260" width="1120" height="650"/></clipPath></defs>
      <g clipPath="url(#lab-map)">
        <path d={landPath(mode)} fill={isDistance?'#e2e9df':'#d4e2d7'} stroke={isDistance?'#a4b7a8':'#79988a'} strokeWidth="1.3"/>
        <path d={path(graticule) ?? ''} fill="none" stroke={C.blue} strokeWidth="1" opacity={isDistance?.12:.28}/>
        {!isDistance && [-120, -60, 0, 60, 120].flatMap(lon => [-45, 0, 45].map(lat => {
          const circle = geoCircle().center([lon, lat]).radius(4.5).precision(4)();
          return <path key={`${lon}:${lat}`} d={path(circle) ?? ''} fill={isArea ? '#477f6820' : '#427d9920'} stroke={isArea ? C.green : C.blue} strokeWidth="2"/>;
        }))}
        {isDistance && <g data-distance-routes>
          {[25,50].map(radius=><path key={radius} d={path(geoCircle().center(origin).radius(radius)())??''} fill="none" stroke={C.blue} strokeWidth="1.3" strokeDasharray="4 7" opacity={ray*.35}/>)}
          {destinations.map((point,i)=>{
            const p=projection(point)!,draw=motion(s,T.rays+i*.5,T.rays+3+i*.5),d=path(geodesic(origin,point))??'';
            return <g key={i}>
              <path d={d} fill="none" stroke="#fffdf7" strokeWidth="8" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-draw}/>
              <path d={d} fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-draw}/>
              <circle cx={p[0]} cy={p[1]} r="8" fill="#fffdf7" stroke={C.blue} strokeWidth="2.5" opacity={draw}/>
              <circle cx={o[0]+(p[0]-o[0])*draw} cy={o[1]+(p[1]-o[1])*draw} r="4" fill={C.blue} opacity={draw}/>
            </g>;
          })}
          <path d={`M${pa}L${pb}`} stroke="#fffdf7" strokeWidth="7" fill="none" opacity={cross}/>
          <path d={`M${pa}L${pb}`} stroke={C.red} strokeWidth="2.5" strokeDasharray="7 7" strokeLinecap="round" fill="none" opacity={cross}/>
          <circle cx={o[0]} cy={o[1]} r="13" fill="#fffdf7" stroke={C.blue} strokeWidth="2"/>
          <circle cx={o[0]} cy={o[1]} r="5" fill={C.blue}/>
        </g>}
      </g>
      <path d="M1240 290V875" stroke="#b8c8c1" strokeWidth="2"/>
      {!isDistance && <g transform="translate(1510 488)">
        <circle r="65" fill="none" stroke="#a8bdb4" strokeWidth="2" strokeDasharray="7 8"/>
        <ellipse rx={65 * (isArea ? stretch : k)} ry={65 * (isArea ? 1 / stretch : k)} fill={isArea ? '#477f6820' : '#427d9920'} stroke={isArea ? C.green : C.blue} strokeWidth="4"/>
        <path d={`M${-65 * (isArea ? stretch : k)} 0H${65 * (isArea ? stretch : k)}M0 ${-65 * (isArea ? 1 / stretch : k)}V${65 * (isArea ? 1 / stretch : k)}`} fill="none" stroke={isArea ? C.green : C.blue} strokeWidth="2"/>
      </g>}
      {isDistance && <g data-distance-detail>
        <rect x="1290" y="365" width="470" height="275" rx="6" fill="#fffdf7" stroke="#c3d0c5"/>
        <path d="M1390 503L1680 423M1390 503L1680 583" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ray}/>
        <path d="M1680 423V583" stroke={C.red} strokeWidth="2.5" strokeDasharray="6 7" opacity={cross}/>
        {[[1390,503],[1680,423],[1680,583]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i?7:10} fill={i?'#fffdf7':C.blue} stroke={C.blue} strokeWidth="2"/>)}
      </g>}
    </svg>
    {isDistance&&<>
      <div style={{position:'absolute',left:1335,top:480}}><Latex math="O" size={32}/></div>
      <div style={{position:'absolute',left:1700,top:400}}><Latex math="P" size={32}/></div>
      <div style={{position:'absolute',left:1700,top:560}}><Latex math="Q" size={32}/></div>
      <div style={{position:'absolute',left:o[0]+20,top:o[1]+14,padding:'5px 12px',background:'#fffdf7',border:'1px solid #c3d0c5',borderRadius:4,fontSize:30,color:C.blue}}>指定中心</div>
    </>}
    <div style={{position: 'absolute', left: 1300, top: 275, fontSize: 48, color: isArea ? C.green : C.blue}}>{isDistance ? '以指定中心为准' : isArea ? '面积不变，形状改变' : '同向放大，角度不变'}</div>
    <div style={{position: 'absolute', left: 1290, top: 672}}>
      {isDistance ? <><Latex math={String.raw`d_{\mathrm{map}}(O,P)`} size={38}/><div><Latex math={String.raw`=c\,d_{\mathrm{sphere}}(O,P)`} size={38}/></div><div style={{fontSize: 32, color: C.red, marginTop: 24, opacity: cross}}>任意两点之间，并不保证</div></> : isArea ? <><Latex math={String.raw`a=${stretch.toFixed(2)},\quad b=${(1 / stretch).toFixed(2)}`} size={37}/><div style={{marginTop: 24}}><Latex math={String.raw`ab=1\quad\Longrightarrow\quad S'=S`} size={42} color={C.green}/></div></> : <><Latex math={String.raw`\varphi=${latitude.toFixed(0)}^\circ,\quad k=\sec\varphi`} size={40}/><div style={{marginTop: 24}}><Latex math={String.raw`k^2=${(k * k).toFixed(2)}`} size={48} color={C.red}/></div></>}
    </div>
    <div style={{position: 'absolute', left: 132, top: 906, fontSize: 30, color: C.muted}}>{isDistance ? '方位等距投影：保留中心到其他点的距离比例' : isArea ? '等积示意：局部两个主方向的伸缩相互抵消' : '以墨卡托为例：高纬度的面积放大尤为明显'}</div>
  </div>;
};
