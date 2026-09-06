import React from "react";
import { useCurrentFrame } from "remotion";

export const Float: React.FC<{
  children: React.ReactNode;
  speed?: number;
  amplitude?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, speed = 60, amplitude = 6, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const t = frame + delay;
  const y = Math.sin(t / speed) * amplitude;

  return (
    <div
      style={{
        ...style,
        transform: `${style?.transform || ""} translate3d(0, ${y}px, 0)`,
        backfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {children}
    </div>
  );
};
