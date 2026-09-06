import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { Lottie, LottieAnimationData } from "@remotion/lottie";

export const LottiePlayer: React.FC<{
  src: string;
  style?: React.CSSProperties;
}> = ({ src, style }) => {
  const [handle] = useState(() => delayRender(`Load Lottie: ${src}`));
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    let active = true;

    fetch(staticFile(src))
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          setAnimationData(json);
        }
      })
      .catch((err) => {
        console.error("Lottie load failed", err);
      })
      .finally(() => continueRender(handle));

    return () => {
      active = false;
    };
  }, [handle, src]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} style={style} />;
};
