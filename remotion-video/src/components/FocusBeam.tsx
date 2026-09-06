import React from "react";
import { interpolate } from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const FocusBeam: React.FC<{
  progress: number;
  tone?: "green" | "amber" | "blue" | "red";
}> = ({ progress, tone = "green" }) => {
  const color =
    tone === "green"
      ? "rgba(79, 116, 93, 0.28)"
      : tone === "amber"
      ? "rgba(167, 119, 72, 0.28)"
      : tone === "red"
      ? "rgba(185, 28, 28, 0.28)"
      : "rgba(49, 95, 109, 0.26)";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: interpolate(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -150,
          bottom: -150,
          left: interpolate(progress, [0, 1], [-200, 750]),
          width: 180,
          transform: "rotate(9deg)",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          filter: "blur(4px)",
        }}
      />
    </div>
  );
};
