import React from "react";
import { interpolate } from "remotion";

const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

export const Packet: React.FC<{
  progress: number;
  opacity: number;
  label: string;
  color?: string;
  startX?: number;
  endX?: number;
  y?: number;
}> = ({
  progress,
  opacity,
  label,
  color = "#315f6d",
  startX = 550,
  endX = 1350,
  y = 520,
}) => {
  const currentX = interpolate(progress, [0, 1], [startX, endX]);
  const tail1X = interpolate(Math.max(0, progress - 0.04), [0, 1], [startX, endX]);
  const tail2X = interpolate(Math.max(0, progress - 0.08), [0, 1], [startX, endX]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tail2X,
          top: y,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: color,
          opacity: opacity * 0.28,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 38,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: tail1X,
          top: y,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: color,
          opacity: opacity * 0.52,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 39,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: currentX,
          top: y,
          width: 140,
          height: 48,
          transform: `translate(-50%, -50%) rotate(${interpolate(progress, [0, 1], [-5, 5])}deg)`,
          opacity,
          background: color,
          border: "2px solid rgba(255,255,255,0.85)",
          borderRadius: 999,
          color: "#fffdf6",
          fontFamily: MONO_STACK,
          fontSize: 15,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 12px 30px ${color}45`,
          zIndex: 40,
        }}
      >
        {label}
      </div>
    </>
  );
};
