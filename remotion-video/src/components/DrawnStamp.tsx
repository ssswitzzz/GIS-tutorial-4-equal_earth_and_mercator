import React from "react";
import { interpolate } from "remotion";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

export const DrawnStamp: React.FC<{
  progress: number;
  tone?: "green" | "amber" | "red" | "blue";
  title: string;
  label: string;
  style?: React.CSSProperties;
}> = ({ progress, tone = "red", title, label, style }) => {
  const color =
    tone === "green"
      ? "#4f745d"
      : tone === "amber"
      ? "#a77748"
      : tone === "blue"
      ? "#315f6d"
      : "#9e2a2b";
  const bg =
    tone === "green"
      ? "rgba(79, 116, 93, 0.08)"
      : tone === "amber"
      ? "rgba(167, 119, 72, 0.08)"
      : tone === "blue"
      ? "rgba(49, 95, 109, 0.08)"
      : "rgba(158, 42, 43, 0.08)";

  return (
    <div
      style={{
        position: "absolute",
        right: 28,
        bottom: 24,
        width: 190,
        height: 88,
        border: `2px solid ${color}`,
        background: bg,
        transform: `rotate(-7deg) scale(${interpolate(progress, [0, 1], [0.82, 1])})`,
        opacity: interpolate(progress, [0, 1], [0, 1]),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 14px 35px ${color}25`,
        zIndex: 25,
        ...style,
      }}
    >
      <svg width="170" height="68" viewBox="0 0 170 68" style={{ position: "absolute" }}>
        <rect
          x="5"
          y="5"
          width="160"
          height="58"
          rx="4"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="8 7"
          strokeDashoffset={interpolate(progress, [0, 1], [180, 0])}
        />
      </svg>
      <div
        style={{
          fontFamily: MONO_STACK,
          fontSize: 12,
          color,
          fontWeight: 800,
          letterSpacing: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: SERIF_STACK,
          fontSize: 22,
          color,
          fontWeight: 700,
          marginTop: 4,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
    </div>
  );
};
