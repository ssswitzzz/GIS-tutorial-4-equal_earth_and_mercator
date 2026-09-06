import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";
const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";

export const MathEngine: React.FC<{
  title?: string;
  subtitle?: string;
  tone?: "amber" | "green" | "blue";
  size?: number;
}> = ({
  title = "微分几何内蕴引擎",
  subtitle = "高斯曲率内蕴性 K = κ₁ · κ₂",
  tone = "amber",
  size = 280,
}) => {
  const frame = useCurrentFrame();
  const spin = frame * 0.5;
  const pulse = interpolate(Math.sin(frame / 18), [-1, 1], [0.18, 0.32]);

  const color =
    tone === "amber" ? "#a77748" : tone === "green" ? "#4f745d" : "#315f6d";

  return (
    <div
      style={{
        width: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <svg width={size} height={size * 0.8} viewBox="0 0 280 220" style={{ overflow: "visible" }}>
        {/* Outermost glowing thin circle with 4 cardinal nodes */}
        <circle
          cx="140"
          cy="110"
          r="92"
          fill="none"
          stroke={`${color}25`}
          strokeWidth="1.5"
        />
        <circle cx="140" cy="18" r="4.5" fill={color} />
        <circle cx="140" cy="202" r="4.5" fill={color} />
        <circle cx="48" cy="110" r="4.5" fill={color} />
        <circle cx="232" cy="110" r="4.5" fill={color} />

        {/* Rotating gear/dashed orbital ring */}
        <circle
          cx="140"
          cy="110"
          r="74"
          fill={`${color}${Math.round(pulse * 255).toString(16).padStart(2, "0")}`}
          stroke={color}
          strokeWidth="2"
          strokeDasharray="12 12"
          transform={`rotate(${spin} 140 110)`}
        />

        {/* Inner coordinate axes rotating in counter direction */}
        <g transform={`rotate(${-spin * 0.5} 140 110)`} opacity="0.65">
          <line x1="95" y1="110" x2="185" y2="110" stroke={color} strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="140" y1="65" x2="140" y2="155" stroke={color} strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="140" cy="110" r="42" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
        </g>

        {/* Core pulsing circle */}
        <circle
          cx="140"
          cy="110"
          r={30 + 3 * Math.sin(frame / 10)}
          fill="rgba(255, 252, 244, 0.96)"
          stroke={color}
          strokeWidth="2.5"
        />

        {/* Floating differential geometry symbols around orbit */}
        <g style={{ fontFamily: MONO_STACK, fontSize: 13, fontWeight: "bold", fill: `${color}bb` }}>
          <text
            x={140 + 72 * Math.cos(frame * 0.015 + 0.4)}
            y={110 + 72 * Math.sin(frame * 0.015 + 0.4)}
            textAnchor="middle"
          >
            K
          </text>
          <text
            x={140 + 64 * Math.cos(frame * 0.012 + 2.5)}
            y={110 + 64 * Math.sin(frame * 0.012 + 2.5)}
            textAnchor="middle"
          >
            κ₁
          </text>
          <text
            x={140 + 76 * Math.cos(-frame * 0.01 + 4.8)}
            y={110 + 76 * Math.sin(-frame * 0.01 + 4.8)}
            textAnchor="middle"
          >
            κ₂
          </text>
          <text
            x={140 + 60 * Math.cos(-frame * 0.014 + 1.2)}
            y={110 + 60 * Math.sin(-frame * 0.014 + 1.2)}
            textAnchor="middle"
          >
            ∇
          </text>
        </g>
      </svg>

      <div
        style={{
          fontFamily: MONO_STACK,
          color,
          fontSize: 15,
          fontWeight: 800,
          marginTop: 12,
          letterSpacing: 1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: SERIF_STACK,
          fontSize: 22,
          color: "#29342f",
          fontWeight: 700,
          marginTop: 6,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};
