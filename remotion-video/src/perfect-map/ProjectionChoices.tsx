import React from 'react';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame} from '../AnimationClock';
import {COLORS as C, motion} from './Typography';
import {EVENTS as T} from './timing';

export const ProjectionChoices: React.FC = () => {
  const s=useAnimationFrame()/useVideoConfig().fps;
  if(s<T.choices||s>=T.conformal)return null;
  const cards=[
    {title:'保形状',subtitle:'等角投影',color:C.blue},
    {title:'保面积',subtitle:'等积投影',color:C.green},
    {title:'保指定距离',subtitle:'等距投影',color:C.red},
  ];
  return <div data-projection-choices style={{position:'absolute',left:150,top:345,display:'flex',gap:40}}>
    {cards.map((card,i)=>{
      const enter=motion(s,T.choices+.3+i*.35,T.choices+1.8+i*.35),exit=motion(s,T.conformal-.7,T.conformal);
      const draw=motion(s,T.choices+1+i*.35,T.conformal-.8);
      return <div data-choice-card key={card.title} style={{position:'relative',width:510,height:395,boxSizing:'border-box',border:'1px solid #c3d0c5',borderTop:`4px solid ${card.color}`,borderRadius:6,background:'#fffdf7',boxShadow:'0 12px 30px #263e3d0a',opacity:enter*(1-exit),transform:`translateY(${35*(1-enter)-18*exit}px)`,textAlign:'center'}}>
        <svg width="510" height="205" viewBox="0 0 510 205" style={{display:'block'}}>
          {i===0&&<g transform="translate(235 120)" fill="none" stroke={card.color} strokeWidth="3" strokeLinecap="round">
            <path d="M-64 35H65M-64 35L30-62" pathLength="1" strokeDasharray="1" strokeDashoffset={1-draw}/>
            <path d="M-17 35A47 47 0 0 0 -31 1" strokeWidth="5" opacity={draw}/>
          </g>}
          {i===1&&<g transform="translate(255 107)" stroke={card.color}>
            <rect x="-55" y="-55" width="110" height="110" fill="none" opacity=".3" strokeDasharray="5 7"/>
            <rect x={-55*(1+.5*draw)} y={-55/(1+.5*draw)} width={110*(1+.5*draw)} height={110/(1+.5*draw)} fill="#477f6815" strokeWidth="3"/>
          </g>}
          {i===2&&<g transform="translate(255 107)" fill="none" stroke={card.color}>
            <circle r="63" opacity=".2" strokeWidth="2"/>
            {[-.7,1.8,3.5].map(a=><g key={a}><path d={`M0 0L${63*Math.cos(a)} ${63*Math.sin(a)}`} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-draw}/><circle cx={63*Math.cos(a)} cy={63*Math.sin(a)} r="5" fill={card.color} opacity={draw}/></g>)}
            <circle r="7" fill={card.color}/>
          </g>}
        </svg>
        <div style={{fontSize:54,color:card.color,whiteSpace:'nowrap'}}>{card.title}</div>
        <div style={{fontSize:32,color:C.muted,marginTop:22}}>{card.subtitle}</div>
      </div>;
    })}
  </div>;
};
