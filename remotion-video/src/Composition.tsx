import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Easing, interpolate, spring, staticFile, useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from './AnimationClock';
import {PaperBackground} from './components/PaperBackground';
import {KaTeXFormula} from './components/KaTeXFormula';
import {africaPlate, gridPath, islandPlate, islandPositions, mapAnchor, mapPath, transportedGreenland} from './intro/geography';
import {getTimestamps} from './intro/timing';
import {UnifiedVisualCanvas} from './intro/UnifiedVisualCanvas';
import './intro/intro.css';

const C = {ink: '#263e3d', muted: '#627573', green: '#477f68', blue: '#427d99', red: '#bf594c', land: '#d9e2da', white: '#fffdf8'};
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const silk = Easing.bezier(.16, 1, .3, 1);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const Headline: React.FC<{start: number; end: number; eyebrow?: string; children: React.ReactNode; color?: string; top?: number; size?: number}> = ({start, end, eyebrow, children, color = C.ink, top = 76, size = 88}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const enter = start === 0 ? 1 : spring({frame: frame - start, fps, config: {damping: 18, stiffness: 55}, durationInFrames: Math.round(fps * .9)});
  const exit = interpolate(frame, [end - fps * .4, end], [0, 1], clamp);
  if (frame < start || frame >= end) return null;
  return <div style={{position: 'absolute', left: 112, top, color, opacity: Math.min(enter * 2, 1) * (1 - exit), transform: `translateY(${(1 - enter) * 44 - exit * 16}px)`, whiteSpace: 'nowrap'}}>
    {eyebrow && <div style={{fontSize: 30, color: C.muted, marginBottom: 15}}>{eyebrow}</div>}
    <div style={{fontSize: size, lineHeight: 1.18}}>{children}</div>
  </div>;
};

export const MainScene: React.FC = () => {
  const frame = useCurrentFrame(); const {fps, width} = useVideoConfig(); const t = getTimestamps(fps);
  const [fontHandle] = useState(() => delayRender('Loading the local Chinese serif font'));
  useEffect(() => {
    const font = new FontFace('Source Han Serif CN SemiBold', `url("${staticFile('fonts/SourceHanSerifCN-SemiBold.otf')}")`, {weight: '700'});
    font.load().then(loaded => {document.fonts.add(loaded); continueRender(fontHandle);}).catch(cancelRender);
  }, [fontHandle]);
  const progress = (start: number, end: number) => interpolate(frame, [start, end], [0, 1], {...clamp, easing: silk});
  const linear = (start: number, end: number) => interpolate(frame, [start, end], [0, 1], clamp);
  const fade = (start: number, end: number, duration = .5) => progress(start, start + fps * duration) * (1 - progress(end - fps * duration, end));
  const morph = progress(t.morph, t.equalEarth) * (1 - progress(t.familiarMap, t.familiarMap + fps * 1.2)) + progress(t.questionMercator, t.end) * .7;
  const mapEnter = progress(t.voteExit, t.projection + fps * 1.1);
  const africaFocus = progress(t.africa, t.africa + fps * 1.4) * (1 - progress(t.familiarMap, t.familiarMap + fps));
  const detail = progress(t.drag, t.drag + fps * 1.2);
  const plate = progress(t.ratio, t.ratio + fps * .8) * (1 - progress(t.mercator, t.mercator + fps * .8));
  const final = progress(t.questionMercator, t.questionMercator + fps * 1.4);
  const restore = progress(t.mercator, t.mercator + fps * 1.1);
  const drift = linear(t.projection, t.end);
  const cameraScale = 1 + africaFocus * .24 + detail * .95 * (1 - restore) - final * .08 + drift * .018;
  const cameraX = -africaFocus * 140 - detail * 420 * (1 - restore) + final * 130;
  const cameraY = africaFocus * 10 - detail * 200 * (1 - restore) + final * 55;
  const drag = progress(t.drag, t.dragComplete);
  const worldD = mapPath('world', morph), africaD = mapPath('africa', morph), greenlandD = mapPath('greenland', morph);
  const mapOpacity = mapEnter * (1 - plate) * (1 - final * .68);
  const voteOut = progress(t.voteExit, t.projection + fps * .8);
  const contextLabel = frame < t.question ? fade(t.africa, t.question) : 0;
  const callouts = [
    {name: 'greenland' as const, text: '格陵兰岛', color: C.red, opacity: fade(t.greenland, t.drag), offset: -210},
    {name: 'africa' as const, text: '非洲', color: C.green, opacity: Math.max(contextLabel, fade(t.comparison, t.drag)), offset: 260},
  ];
  const highlight = progress(t.greenland, t.greenland + fps * .6);
  const seats = Array.from({length: 164}, (_, i) => {
    const rows = [20, 27, 33, 39, 45]; let row = 0, index = i;
    while (index >= rows[row]) {index -= rows[row]; row++;}
    const theta = Math.PI + (index / (rows[row] - 1)) * Math.PI;
    const radius = 182 + row * 65;
    return {x: 1200 + Math.cos(theta) * radius, y: 745 + Math.sin(theta) * radius};
  });
  return <AbsoluteFill>
    <div className="intro-stage" style={{position: 'absolute', width: 1920, height: 1080, overflow: 'hidden', color: C.ink, transform: `scale(${width / 1920})`, transformOrigin: 'top left'}}>
      <PaperBackground/>
      <svg id="cartographic-layer" width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="map-safe"><rect x="0" y="258" width="1920" height="738"/></clipPath>
          <filter id="lift" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="9" stdDeviation="10" floodColor="#203d37" floodOpacity=".17"/></filter>
          <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V12" stroke={C.red} strokeWidth="3"/></pattern>
        </defs>
        <g opacity={1 - voteOut}>
          {[182, 247, 312, 377, 442].map(r => <path key={r} d={`M${1200-r} 745A${r} ${r} 0 0 1 ${1200+r} 745`} fill="none" stroke="#c9d5cf" strokeWidth="1.5"/>)}
          {seats.map((seat, i) => {
            const reveal = progress(t.votesArrive + i * fps * .013, t.votesArrive + i * fps * .013 + fps * .6);
            return <rect key={i} x={-9} y={-12} width="18" height="24" rx="3" fill={C.green} opacity={reveal} transform={`translate(${mix(seat.x, 1020 + (seat.x - 1200) * 1.4, voteOut)},${mix(seat.y + 45 * (1 - reveal), 585 + (seat.y - 560) * .4, voteOut)}) rotate(${voteOut * 80}) scale(${1 - voteOut * .7})`}/>;
          })}
          <g opacity={progress(t.dissent, t.dissent + fps * .4)}>
            <rect x="1187" y="723" width="26" height="34" rx="3" fill={C.red}/>
            <path d="M1200 775V818H1380" fill="none" stroke={C.red} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress(t.dissent + fps * .3, t.dissent + fps * 1.2)}/>
            <text x="1400" y="830" fill={C.red} fontSize="34">美国 · 反对</text>
          </g>
        </g>
        <g clipPath="url(#map-safe)"><g opacity={mapOpacity} transform={`translate(${cameraX} ${cameraY + (1 - mapEnter) * 90}) translate(960 570) scale(${cameraScale * (.88 + mapEnter * .12)}) translate(-960 -570)`}>
          <path d={gridPath(morph)} fill="none" stroke={C.blue} strokeWidth="1.1" opacity=".25"/>
          <path d={worldD} fill={C.land} stroke="#91aaa0" strokeWidth="1.2" strokeLinejoin="round"/>
          <path data-land="africa" d={africaD} fill={C.green} stroke={C.green} strokeWidth="1.6" opacity={Math.max(africaFocus, highlight)}/>
          <path data-land="greenland" d={greenlandD} fill={drag > 0 ? 'url(#hatch)' : C.red} stroke={C.red} strokeWidth="1.6" opacity={highlight * (1 - restore)}/>
          {drag > 0 && <path d={transportedGreenland(drag)} fill={C.red} stroke={C.white} strokeWidth="2" filter="url(#lift)" opacity={1 - restore}/>}
          <path d="M899 417Q851 566 1072 725" fill="none" stroke={C.red} strokeWidth="2" strokeDasharray="7 9" opacity={drag * (1 - restore)}/>
        </g></g>
        <g opacity={plate} transform={`translate(0 ${36 * (1 - plate)})`}>
          <path d={africaPlate} fill={C.green} stroke="#365f4f" strokeWidth="2"/>
          {islandPositions.map((position, i) => {
            const enter = progress(t.ratio + i * (t.ratioComplete - t.ratio) / 14, t.ratio + i * (t.ratioComplete - t.ratio) / 14 + fps * .38);
            return <g key={i} transform={`translate(${position.x} ${position.y + (1 - enter) * 60}) scale(${.7 + enter * .3})`} opacity={enter}><path d={islandPlate} fill={C.red} stroke="#91463d" strokeWidth="1.3"/></g>;
          })}
          <text x="585" y="947" textAnchor="middle" fontSize="34" fill={C.green}>非洲</text>
          <text x="1340" y="947" textAnchor="middle" fontSize="30" fill={C.muted}>同一面积比例尺</text>
        </g>
        {callouts.map(({name, text, color, opacity, offset}) => {
          if (opacity < .0001) return null;
          const p = mapAnchor(name, morph), scale = cameraScale * (.88 + mapEnter * .12);
          const x = cameraX + 960 + (p[0] - 960) * scale;
          const y = cameraY + (1 - mapEnter) * 90 + 570 + (p[1] - 570) * scale;
          const labelX = x + offset, direction = Math.sign(offset);
          return <g key={name} data-callout={name} opacity={opacity * mapOpacity}>
            <path d={`M${x + direction * 8} ${y}H${labelX - direction * 18}`} fill="none" stroke={color} strokeWidth="2"/>
            <circle cx={x} cy={y} r="5" fill={color}/>
            <text x={labelX} y={y} dominantBaseline="central" textAnchor={offset < 0 ? 'end' : 'start'} fontSize="32" fill={color}>{text}</text>
          </g>;
        })}
        <g opacity={final}>
          <path d="M113 655H1805" stroke="#b6c6c0" strokeWidth="2"/>
          <path d="M114 655H1804" stroke={C.blue} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress(t.questionMercator + fps * .7, t.responsibility)}/>
          {[114, 1480, 1804].map((x, i) => <g key={x}><circle cx={x} cy="655" r="7" fill={C.blue}/><text x={x} y="709" fontSize="32" fill={C.muted} textAnchor={i === 0 ? 'start' : 'end'}>{['1569 年', '2018 年', '今天'][i]}</text></g>)}
        </g>
      </svg>
      <UnifiedVisualCanvas opacity={final} unfold={final}/>
      <Headline start={0} end={t.projection} eyebrow="联合国大会 · 地图之争" top={150} size={82}>一张地图，<br/>一场表决。</Headline>
      <div style={{position: 'absolute', left: 112, top: 443, opacity: 1 - voteOut}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 22, color: C.green}}><span style={{fontSize: 150, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums'}}>{Math.round(164 * progress(t.votesArrive, t.votesComplete))}</span><span style={{fontSize: 34}}>票赞成</span></div>
        <div style={{fontSize: 50, marginTop: 14, color: C.red, opacity: progress(t.dissent, t.dissent + fps * .6)}}>1 <span style={{fontSize: 34}}>票反对</span></div>
      </div>
      <Headline start={t.projection} end={t.morph + fps * .5} eyebrow="沿用数百年的世界地图" size={78}>换一张，世界地图。</Headline>
      <Headline start={t.morph + fps * .5} end={t.africa} eyebrow="2018 年诞生" size={100} color={C.blue}>平等地球</Headline>
      <Headline start={t.africa} end={t.question} eyebrow="非洲多国的主张" size={92}>从地图，到<span style={{color: C.red}}>去殖民化</span>。</Headline>
      <Headline start={t.question} end={t.familiarMap} eyebrow="改变的究竟是什么？" size={88}>换张地图，为何掀起波澜？</Headline>
      <Headline start={t.familiarMap} end={t.drag} eyebrow="我们熟悉的世界地图" size={80}>看起来，竟然差不多大。</Headline>
      <Headline start={t.drag} end={t.ratio + fps * .25} eyebrow="把格陵兰岛拖向非洲" size={80}>纬度变了，大小也变了。</Headline>
      <Headline start={t.ratio} end={t.mercator + fps * .2} eyebrow="比较真实面积" size={80}>一个非洲，约 <span style={{color: C.red}}>14</span> 个格陵兰岛。</Headline>
      <div style={{position: 'absolute', left: 900, top: 500, opacity: plate}}><KaTeXFormula math={'\\approx'} fontSize={72} color={C.muted}/></div>
      <Headline start={t.mercator} end={t.questionMercator} eyebrow="从小熟悉的那张地图" size={108}>墨卡托投影</Headline>
      <Headline start={t.questionMercator} end={t.responsibility} eyebrow="从 1569 年，到今天" top={254} size={105}>墨卡托，<br/>“骗”了我们多久？</Headline>
      <Headline start={t.responsibility} end={t.end + fps} eyebrow="看见失真，也要问清用途" top={272} size={112}>这口锅，<br/><span style={{color: C.red}}>真该它来背吗？</span></Headline>
    </div>
  </AbsoluteFill>;
};
