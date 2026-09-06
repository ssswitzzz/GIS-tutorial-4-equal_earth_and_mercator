import React from "react";
import { Composition } from "remotion";
import { MainScene } from "./Composition";
import { GaussTheoremaScene } from "./GaussTheoremaScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GaussTheorema"
        component={GaussTheoremaScene}
        durationInFrames={6600}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="EqualEarthIntro"
        component={MainScene}
        durationInFrames={3128}
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};
