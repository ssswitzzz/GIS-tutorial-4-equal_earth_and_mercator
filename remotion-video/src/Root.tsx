import React from "react";
import { Composition } from "remotion";
import { GaussTheoremaScene } from "./GaussTheoremaScene";
import {FullFilm, TimedIntro, TimedPerfectMap, TimedMercator, TimedEqualEarth, TimedOutro} from './NarratedFilm';
import {chapterFrames, TOTAL_FRAMES} from './narration';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="FullFilm" component={FullFilm} durationInFrames={TOTAL_FRAMES} fps={60} width={1920} height={1080}/>
      <Composition id="OutroFilm" component={TimedOutro} durationInFrames={chapterFrames('outro')} fps={60} width={1920} height={1080}/>
      <Composition id="EqualEarthFilm" component={TimedEqualEarth} durationInFrames={chapterFrames('equal')} fps={60} width={1920} height={1080}/>
      <Composition id="MercatorFilm" component={TimedMercator} durationInFrames={chapterFrames('mercator')} fps={60} width={1920} height={1080}/>
      <Composition id="PerfectMapFilm" component={TimedPerfectMap} durationInFrames={chapterFrames('perfect')} fps={60} width={1920} height={1080}/>
      <Composition
        id="GaussTheorema"
        component={GaussTheoremaScene}
        durationInFrames={6600}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="EqualEarthIntro"
        component={TimedIntro}
        durationInFrames={chapterFrames('intro')}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
