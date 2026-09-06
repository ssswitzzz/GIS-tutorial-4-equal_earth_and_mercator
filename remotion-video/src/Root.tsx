import React from "react";
import { Composition } from "remotion";
import { MainScene } from "./Composition";
import { GaussTheoremaScene } from "./GaussTheoremaScene";
import {getTimestamps} from "./intro/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
        component={MainScene}
        durationInFrames={getTimestamps(60).end}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
