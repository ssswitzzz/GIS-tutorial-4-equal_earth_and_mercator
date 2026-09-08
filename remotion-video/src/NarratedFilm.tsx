import React from 'react';
import {Audio, Sequence, staticFile, useCurrentFrame, CanvasImage} from 'remotion';
import {AnimationClock} from './AnimationClock';
import {MainScene} from './Composition';
import {PerfectMapFilm} from './PerfectMapFilm';
import {MercatorFilm} from './MercatorFilm';
import {EqualEarthFilm} from './EqualEarthFilm';
import {OutroFilm} from './OutroFilm';
import {authoredFrame, Chapter, chapterFrames, chapterStart, FPS} from './narration';

const Visuals = {intro: MainScene, perfect: PerfectMapFilm, mercator: MercatorFilm, equal: EqualEarthFilm, outro: OutroFilm};
export const NarratedChapter: React.FC<{chapter: Chapter; audio?: boolean}> = ({chapter, audio = true}) => {
  const frame = useCurrentFrame(), Visual = Visuals[chapter];
  return <>
    {audio && <Audio src={staticFile('audio/narration.wav')} trimBefore={chapterStart(chapter)} trimAfter={chapterStart(chapter) + chapterFrames(chapter)}/>}
    {chapter === 'outro' ? <Visual/> : <AnimationClock.Provider value={authoredFrame(chapter, frame)}><Visual/></AnimationClock.Provider>}
  </>;
};
export const TimedIntro = () => <NarratedChapter chapter="intro"/>;
export const TimedPerfectMap = () => <NarratedChapter chapter="perfect"/>;
export const TimedMercator = () => <NarratedChapter chapter="mercator"/>;
export const TimedEqualEarth = () => <>
  <NarratedChapter chapter="equal"/>
  <CanvasImage
    src={staticFile("image.png")}
    style={{
      position: "absolute",
      translate: "1769px 1026px",
      width: 302,
      height: 108
    }}
  />
</>;
export const TimedOutro = () => <NarratedChapter chapter="outro"/>;
export const FullFilm = () => <>
  <Audio src={staticFile('audio/narration.wav')}/>
  {(Object.keys(Visuals) as Chapter[]).map(chapter => <Sequence key={chapter} name={chapter} from={chapterStart(chapter)} durationInFrames={chapterFrames(chapter)} premountFor={FPS}>
    <NarratedChapter chapter={chapter} audio={false}/>
  </Sequence>)}
</>;
