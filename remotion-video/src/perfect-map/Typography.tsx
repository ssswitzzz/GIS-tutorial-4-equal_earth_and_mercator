import React, {useEffect, useMemo, useState} from 'react';
import katex from 'katex';
import {cancelRender, continueRender, delayRender, Easing, interpolate, spring, staticFile, useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import 'katex/dist/katex.min.css';

export const COLORS = {ink: '#263e3d', muted: '#627573', blue: '#427d99', green: '#477f68', red: '#bf594c', orange: '#df913f', paper: '#fcfbf5'};
export const SERIF = '"Source Han Serif CN SemiBold", serif';
export const clamped = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const silk = Easing.bezier(.16, 1, .3, 1);
export const motion = (seconds: number, start: number, end: number) => interpolate(seconds, [start, end], [0, 1], {...clamped, easing: silk});
export const fadeWindow = (seconds: number, start: number, end: number) => motion(seconds, start, start + .6) * (1 - motion(seconds, end - .6, end));

export const usePerfectMapFont = () => {
  const [handle] = useState(() => delayRender('Perfect map: loading Chinese typography'));
  useEffect(() => {
    const font = new FontFace('Source Han Serif CN SemiBold', `url("${staticFile('fonts/SourceHanSerifCN-SemiBold.otf')}")`, {weight: '700'});
    font.load().then(loaded => {document.fonts.add(loaded); continueRender(handle);}).catch(cancelRender);
  }, [handle]);
};

export const Latex: React.FC<{math: string; size?: number; color?: string; style?: React.CSSProperties}> = ({math, size = 42, color = COLORS.ink, style}) => {
  const html = useMemo(() => katex.renderToString(math, {throwOnError: true, strict: 'error', output: 'html'}), [math]);
  return <span data-math={math} style={{fontSize: size, color, display: 'inline-block', whiteSpace: 'nowrap', lineHeight: 1.35, ...style}} dangerouslySetInnerHTML={{__html: html}}/>;
};

export const Heading: React.FC<{start: number; end: number; eyebrow: string; children: React.ReactNode; size?: number}> = ({start, end, eyebrow, children, size = 88}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const seconds = frame / fps;
  const enter = start === 0 ? 1 : spring({frame: frame - Math.round(start * fps), fps, config: {damping: 18, stiffness: 55}});
  const exit = motion(seconds, end - .5, end);
  if (seconds < start || seconds >= end) return null;
  return <div data-heading style={{position: 'absolute', left: 112, top: 64, transform: `translateY(${(1 - enter) * 35 - exit * 15}px)`, opacity: Math.min(1, enter * 2) * (1 - exit), whiteSpace: 'nowrap'}}>
    <div style={{fontSize: 30, color: COLORS.muted, marginBottom: 15}}>{eyebrow}</div>
    <div style={{fontSize: size, lineHeight: 1.2}}>{children}</div>
  </div>;
};

export const Annotation: React.FC<{start: number; end: number; x: number; y: number; children: React.ReactNode; color?: string; size?: number}> = ({start, end, x, y, children, color = COLORS.ink, size = 34}) => {
  const seconds = useCurrentFrame() / useVideoConfig().fps;
  const opacity = fadeWindow(seconds, start, end);
  if (opacity <= 0) return null;
  return <div data-annotation style={{position: 'absolute', left: x, top: y, opacity, color, fontSize: size, lineHeight: 1.5, whiteSpace: 'nowrap'}}>{children}</div>;
};
