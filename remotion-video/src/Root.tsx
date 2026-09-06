import React from "react";
import { Composition } from "remotion";
import { MainScene } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainScene"
        component={MainScene}
        durationInFrames={180}
        fps={60}
        width={3840}
        height={2160}
      />
    </>
  );
};
