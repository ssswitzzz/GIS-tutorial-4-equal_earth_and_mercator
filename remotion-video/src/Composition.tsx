import React from "react";
import {Audio, staticFile, AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {geoEqualEarth, geoMercator, geoPath} from "d3-geo";
import worldRaw from "./data/cas_world_land.json";
import africaRaw from "./data/cas_africa.json";
import greenlandRaw from "./data/cas_greenland.json";

const SERIF = "Source Han Serif CN, Source Han Serif SC, SimSun, serif";
const INK = "#243833"; const PAPER = "#f6f1e7"; const BLUE = "#3c7280"; const CLAY = "#b45b45";
const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const t = {vote: 0, projection: 8, decolonize: 16, question: 21, map: 25.05, drag: 33, count: 39, ending: 43, end: 52.118};
const f = (seconds: number, fps: number) => Math.round(seconds * fps);
type Point = [number, number];
const polygons = (raw: Point[][]) => ({type: "MultiPolygon" as const, coordinates: raw.map((p) => [p])});
const world = polygons(worldRaw as Point[][]); const africa = polygons(africaRaw as Point[][]); const greenland = polygons(greenlandRaw as Point[][]);
const makePath = (projection: any, geometry: any) => geoPath(projection)(geometry) ?? "";
const mercatorPath = makePath(geoMercator().fitExtent([[70, 85], [1850, 910]], world), world);
const equalEarthPath = makePath(geoEqualEarth().fitExtent([[70, 105], [1850, 900]], world), world);
const africaMercator = makePath(geoMercator().fitExtent([[70, 85], [1850, 910]], world), africa);
const greenMercator = makePath(geoMercator().fitExtent([[70, 85], [1850, 910]], world), greenland);

const FadeText: React.FC<{children: React.ReactNode; from: number; to: number; style?: React.CSSProperties}> = ({children, from, to, style}) => {
  const {fps} = useVideoConfig(); const frame = useCurrentFrame();
  const opacity = interpolate(frame, [f(from, fps), f(from + .5, fps), f(to - .45, fps), f(to, fps)], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [f(from, fps), f(from + .7, fps)], [22, 0], clamp);
  return <div style={{opacity, transform: `translateY(${y}px)`, ...style}}>{children}</div>;
};
const MapLayer: React.FC<{path: string; opacity: number; fill?: string; stroke?: string; strokeWidth?: number}> = ({path, opacity, fill = "#d8e5d5", stroke = "#47726b", strokeWidth = 1.4}) => <svg viewBox="0 0 1920 1080" style={{position: "absolute", inset: 0, width: "100%", height: "100%", opacity}}><path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"/></svg>;
const Grid: React.FC = () => <svg viewBox="0 0 1920 1080" style={{position: "absolute", inset: 0, opacity: .28}}><defs><pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="#9bb3aa" strokeWidth="1"/><circle cx="0" cy="0" r="2" fill="#78978c"/></pattern></defs><rect width="1920" height="1080" fill="url(#grid)"/></svg>;

export const MainScene: React.FC = () => {
  const frame = useCurrentFrame(); const {fps, width} = useVideoConfig(); const scale = width / 1920; const sec = frame / fps;
  const mapIn = interpolate(frame, [f(t.map, fps), f(27, fps)], [0, 1], clamp);
  const drag = interpolate(frame, [f(t.drag, fps), f(37, fps)], [0, 1], {...clamp, easing: Easing.bezier(.16, 1, .3, 1)});
  const count = interpolate(frame, [f(t.count, fps), f(42, fps)], [0, 14], clamp); const endSpring = spring({frame: frame - f(t.ending, fps), fps, config: {damping: 18, stiffness: 55}}); const ending = frame < f(t.ending, fps) ? 0 : endSpring;
  const mapShift = interpolate(frame, [f(t.map, fps), f(t.drag, fps)], [0, -90], clamp); const greenlandX = interpolate(drag, [0, 1], [0, -650]); const greenlandY = interpolate(drag, [0, 1], [0, 245]); const greenlandScale = interpolate(drag, [0, 1], [1, .27]);
  const lineProgress = interpolate(frame, [f(t.drag, fps), f(36.5, fps)], [0, 1], clamp); const lineX = interpolate(lineProgress, [0, 1], [1450, 820]); const lineY = interpolate(lineProgress, [0, 1], [250, 625]);
  const voteProgress = interpolate(frame, [f(.7, fps), f(5.8, fps)], [0, 1], clamp); const voteNo = voteProgress; const worldOpacity = interpolate(frame, [f(5, fps), f(8, fps)], [0, 1], clamp); const mercOpacity = interpolate(frame, [f(8, fps), f(14, fps)], [1, 0], clamp); const equalOpacity = interpolate(frame, [f(8, fps), f(14, fps)], [0, 1], clamp); const pulse = 1 + Math.sin(frame / 16) * .012;
  return <AbsoluteFill style={{backgroundColor: PAPER, color: INK, fontFamily: SERIF, overflow: "hidden"}}><Audio src={staticFile("audio/intro.wav")} volume={0.9}/><div style={{width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", overflow: "hidden"}}>
    <Grid/><div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 74% 35%, rgba(255,255,255,.82), transparent 48%)"}}/>
    <FadeText from={0} to={8.5} style={{position: "absolute", left: 112, top: 100, zIndex: 5}}><div style={{fontSize: 32, color: CLAY, fontWeight: 700}}>联合国大会 · 表决现场</div><div style={{fontSize: 88, lineHeight: 1.05, fontWeight: 700, marginTop: 18}}>一张地图，<br/>为什么会引发投票？</div></FadeText>
    <FadeText from={1.3} to={8.5} style={{position: "absolute", right: 130, top: 132, textAlign: "right", zIndex: 5}}><div style={{fontSize: 156, lineHeight: .9, color: BLUE, fontWeight: 700}}>164</div><div style={{fontSize: 34, marginTop: 10}}>赞成</div><div style={{fontSize: 94, lineHeight: .9, color: CLAY, fontWeight: 700, marginTop: 24}}>1</div><div style={{fontSize: 34, marginTop: 10}}>反对</div></FadeText>
    <div style={{position: "absolute", left: 110, right: 110, bottom: 108, height: 12, background: "#d5dfd9", opacity: voteNo}}><div style={{width: `${voteProgress * 91}%`, height: "100%", background: BLUE}}/><div style={{position: "absolute", right: 0, top: 0, width: `${voteProgress * 9}%`, height: "100%", background: CLAY}}/></div>
    <div style={{position: "absolute", inset: 0, opacity: worldOpacity, transform: `translateY(${mapShift}px) scale(${pulse})`}}><MapLayer path={mercatorPath} opacity={mercOpacity} fill="#d5e2d5"/><MapLayer path={equalEarthPath} opacity={equalOpacity} fill="#d5e2d5" stroke="#47726b"/></div>
    <FadeText from={7.4} to={16.5} style={{position: "absolute", left: 118, top: 100, zIndex: 4}}><div style={{fontSize: 31, color: BLUE, fontWeight: 700}}>2018 年 · 新的世界观</div><div style={{fontSize: 86, lineHeight: 1.05, marginTop: 14, fontWeight: 700}}>平等地球</div><div style={{fontSize: 36, marginTop: 15, color: "#557067"}}>面积真实，轮廓仍然优雅</div></FadeText>
    <FadeText from={14.5} to={22} style={{position: "absolute", right: 120, top: 135, width: 600, textAlign: "right", zIndex: 4}}><div style={{fontSize: 67, fontWeight: 700, lineHeight: 1.15}}>地图也有<br/><span style={{color: CLAY}}>立场</span></div><div style={{fontSize: 34, marginTop: 22}}>去殖民化，不只是换一张图</div></FadeText>
    <FadeText from={20.5} to={27} style={{position: "absolute", left: 118, bottom: 112, zIndex: 4}}><div style={{fontSize: 56, fontWeight: 700}}>为什么换张地图，会掀起波澜？</div></FadeText>
    <div style={{position: "absolute", inset: 0, opacity: mapIn, transform: `translateY(${interpolate(mapIn, [0, 1], [70, 0])}px)`}}><MapLayer path={africaMercator} opacity={1} fill="#7ba788" stroke="#47726b" strokeWidth={2}/><MapLayer path={greenMercator} opacity={1} fill="#c97b63" stroke="#8d4f40" strokeWidth={2}/></div>
    <FadeText from={24.6} to={34} style={{position: "absolute", left: 118, top: 88, zIndex: 6}}><div style={{fontSize: 31, color: "#557067", fontWeight: 700}}>熟悉的世界地图</div><div style={{fontSize: 72, fontWeight: 700, marginTop: 12}}>格陵兰岛 ≈ 非洲？</div></FadeText>
    <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: drag, transform: `translate(${greenlandX}px, ${greenlandY}px) scale(${greenlandScale})`, transformOrigin: "1450px 250px"}}><MapLayer path={greenMercator} opacity={1} fill="#c97b63" stroke="#8d4f40" strokeWidth={3}/></div>
    <svg viewBox="0 0 1920 1080" style={{position: "absolute", inset: 0, opacity: lineProgress}}><path d={`M1450 250 C1320 320 ${lineX + 240} ${lineY - 90} ${lineX} ${lineY}`} fill="none" stroke={CLAY} strokeWidth="4" strokeDasharray="12 13"/><circle cx={lineX} cy={lineY} r="11" fill={CLAY}/></svg>
    <FadeText from={32.5} to={40.5} style={{position: "absolute", right: 112, top: 165, zIndex: 8, textAlign: "right"}}><div style={{fontSize: 38, color: CLAY, fontWeight: 700}}>拖到真实的位置</div><div style={{fontSize: 118, lineHeight: .95, marginTop: 12, fontWeight: 700, color: INK}}>14 个</div><div style={{fontSize: 45, marginTop: 14}}>格陵兰岛，才装得下非洲</div></FadeText>
    <div style={{position: "absolute", left: 830, top: 590, display: "flex", gap: 22, opacity: interpolate(frame, [f(38.5, fps), f(42, fps)], [0, 1], clamp), transform: `scale(${interpolate(frame, [f(38.5, fps), f(42, fps)], [.82, 1], clamp)})`}}>{Array.from({length: 14}).map((_, i) => <div key={i} style={{width: 44, height: 38, borderRadius: "50% 50% 45% 45%", background: CLAY, opacity: i < Math.floor(count) ? 1 : .22, transform: `translateY(${Math.sin(i * 1.7) * 7}px)`}}/>)}</div>
    <FadeText from={38.7} to={44.3} style={{position: "absolute", left: 118, bottom: 112, zIndex: 8}}><div style={{fontSize: 32, color: BLUE, fontWeight: 700}}>这就是我们从小见过的</div><div style={{fontSize: 80, fontWeight: 700, marginTop: 10}}>墨卡托投影</div></FadeText>
    <div style={{position: "absolute", inset: 0, background: PAPER, opacity: interpolate(ending, [0, 1], [1, 0], clamp), zIndex: 10}}/><div style={{position: "absolute", inset: 0, zIndex: 11, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: ending, transform: `translateY(${interpolate(ending, [0, 1], [34, 0], clamp)}px)`}}><div style={{fontSize: 37, color: CLAY, fontWeight: 700}}>一个问题，留到下一幕</div><div style={{fontSize: 92, fontWeight: 700, marginTop: 22}}>墨卡托，真的在“骗”我们吗？</div><div style={{marginTop: 34, fontSize: 34, color: "#557067"}}>还是说，这口锅不该由它来背？</div></div>
    <div style={{position: "absolute", left: 110, right: 110, bottom: 43, height: 3, background: "#cdd8d0", zIndex: 20}}><div style={{height: "100%", width: `${Math.min(sec / t.end, 1) * 100}%`, background: CLAY}}/></div><div style={{position: "absolute", bottom: 62, left: 110, fontSize: 30, color: "#557067", zIndex: 20}}>平等地球 · 开场</div>
  </div></AbsoluteFill>;
};
