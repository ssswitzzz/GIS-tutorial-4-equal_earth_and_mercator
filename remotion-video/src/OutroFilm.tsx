import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {PaperBackground} from './components/PaperBackground';
import {mapGrid, mapLand, mapProjection} from './equal-earth/model';
import {COLORS as C, Heading, motion, SERIF, usePerfectMapFont} from './perfect-map/Typography';

export const OutroFilm: React.FC = () => {
  usePerfectMapFont();
  const {fps, width} = useVideoConfig(), s = useCurrentFrame() / fps;
  const navigation = motion(s, 3.9, 6.5), trueSize = motion(s, 11.37, 15.8);
  const choice = motion(s, 19.46, 23.2), farewell = motion(s, 31.94, 34.2);
  const projection = 2 * (1 - navigation * (1 - trueSize));
  const mapScale = 1 - farewell * .38;
  const route = navigation * (1 - trueSize);
  const projectionNow = mapProjection(projection);
  const a = projectionNow([-52, -31])!, b = projectionNow([-25, 40])!;
  const travel = motion(s, 5.13, 10.5);
  const heading = Math.atan2(b[0]-a[0], a[1]-b[1])*180/Math.PI;
  const exit = motion(s, 38.5, 39.9);
  const handoff = 1 - motion(s, 0, 3);
  const labels = ['航海 · 固定航向', '世界地图 · 真实面积'];
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <div className="outro-stage" style={{width:1920,height:1080,position:'absolute',transform:`scale(${width/1920})`,transformOrigin:'top left',fontFamily:SERIF,fontWeight:700,letterSpacing:0,color:C.ink}}>
      <PaperBackground/>
      <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
        <g opacity={1-exit*.35} transform={`translate(${farewell*430+35*handoff} ${farewell*70+15*handoff}) translate(900 585) scale(${mapScale}) translate(-900 -585)`}>
          <path d={mapGrid(projection, choice*8 + Math.sin(s/9)*.7)} fill="none" stroke={C.blue} strokeWidth="1.5" opacity=".35"/>
          <path d={mapLand(projection, choice*8 + Math.sin(s/9)*.7)} fill="#b5ccba" stroke="#638774" strokeWidth="1.5"/>
          <g opacity={route}>
            <path d={`M${a}L${b}`} stroke={C.blue} strokeWidth="5" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1-travel}/>
            {[a,b].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="10" fill={C.blue}/>)}
            <g transform={`translate(${a[0]+(b[0]-a[0])*travel} ${a[1]+(b[1]-a[1])*travel}) rotate(${heading})`}>
              <path d="M0-24L16 19L0 11L-16 19Z" fill={C.blue} stroke="#fffdf8" strokeWidth="3"/>
            </g>
          </g>
          <g opacity={trueSize*(1-farewell)}>
            <path d="M150 920H1650" stroke="#9bb5a7" strokeWidth="2"/>
            <path d="M150 920H1650" stroke={C.green} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1-motion(s,12,18.34)}/>
          </g>
        </g>
        <path d="M145 665H740" stroke={C.blue} strokeWidth="4" opacity={farewell} pathLength="1" strokeDasharray="1" strokeDashoffset={1-motion(s,33,35)}/>
        {[0,1,2].map(i=>{
          const enter=motion(s,35.06+i*.22,35.9+i*.22), pulse=1+.06*Math.sin((s-35.8-i*.22)*4)*motion(s,35.8+i*.22,36.3+i*.22);
          return <g key={i} opacity={enter*(1-exit)} transform={`translate(${225+i*205} ${741+35*(1-enter)}) scale(${pulse})`}>
            <circle r="53" fill="none" stroke={[C.blue,C.orange,C.green][i]} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-enter}/>
            <text textAnchor="middle" y="12" fontSize="34" fill={[C.blue,C.orange,C.green][i]}>{['赞','币','藏'][i]}</text>
          </g>;
        })}
      </svg>
      <Heading start={0} end={11.37} eyebrow="回到地图的用途" size={84}>各有所长，各得其所。</Heading>
      <Heading start={11.37} end={19.46} eyebrow="当世界走进下一代的眼睛" size={84}>让大陆，回到真实的比例。</Heading>
      <Heading start={19.46} end={31.94} eyebrow="数学的妥协，也是人的视角" size={84}>读懂地图，从理解选择开始。</Heading>
      <div data-outro-label style={{position:'absolute',left:150,top:955,fontSize:32,color:trueSize>.5?C.green:C.blue,opacity:(1-farewell)*motion(s,4.6,5.8)}}>
        {choice>.5?'在合适的场景，选择合适的地图。':labels[trueSize>.5?1:0]}
      </div>
      <div data-outro-label style={{position:'absolute',left:145,top:320,opacity:farewell,transform:`translateY(${35*(1-farewell)})`,whiteSpace:'nowrap'}}>
        <div style={{fontSize:34,color:C.muted,marginBottom:24}}>感谢观看</div>
        <div style={{fontSize:100,lineHeight:1.35}}>我们，<br/><span style={{color:C.blue}}>下期再见。</span></div>
      </div>
      <div data-outro-label style={{position:'absolute',left:165,top:850,fontSize:32,color:C.muted,opacity:motion(s,35.06,35.7)*(1-exit)}}>关注，一起继续读懂世界</div>
    </div>
  </AbsoluteFill>;
};
