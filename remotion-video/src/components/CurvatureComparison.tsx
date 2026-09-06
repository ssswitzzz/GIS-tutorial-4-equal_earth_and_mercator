import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KaTeXFormula } from "./KaTeXFormula";

export const CurvatureComparison: React.FC<{ progressFrame: number }> = ({
  progressFrame,
}) => {
  const { fps } = useVideoConfig();

  const animSpring = spring({
    frame: progressFrame,
    fps,
    config: { damping: 18, stiffness: 60 },
  });

  const cardScale = interpolate(animSpring, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(progressFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "40px",
        alignItems: "center",
        justifyContent: "center",
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
      }}
    >
      {/* Card 1: Sphere (K > 0) */}
      <div
        style={{
          width: "600px",
          padding: "40px 36px",
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          borderRadius: "24px",
          border: "2px solid #E2E8F0",
          boxShadow: "0 25px 45px -12px rgba(0, 0, 0, 0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "#BE123C",
            marginBottom: "20px",
            whiteSpace: "nowrap",
          }}
        >
          地球正球面（不可展曲面）
        </div>

        {/* Sphere SVG graphic */}
        <svg width="280" height="220" viewBox="0 0 280 220">
          <circle cx="140" cy="110" r="85" fill="#FFF1F2" stroke="#BE123C" strokeWidth="2.5" />
          {/* Latitude circles */}
          <ellipse cx="140" cy="110" rx="85" ry="25" fill="none" stroke="#FDA4AF" strokeWidth="2" strokeDasharray="5 5" />
          <ellipse cx="140" cy="70" rx="72" ry="18" fill="none" stroke="#FDA4AF" strokeWidth="1.5" />
          <ellipse cx="140" cy="150" rx="72" ry="18" fill="none" stroke="#FDA4AF" strokeWidth="1.5" />
          {/* Meridian arcs */}
          <path d="M 140 25 A 85 85 0 0 1 140 195" fill="none" stroke="#BE123C" strokeWidth="2" />
          {/* Principal Curvature vectors */}
          <circle cx="140" cy="110" r="5" fill="#BE123C" />
          <path d="M 140 110 L 190 80" stroke="#BE123C" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
          <text x="195" y="80" fill="#BE123C" fontSize="16" fontWeight="bold">κ₁ &gt; 0</text>
          <path d="M 140 110 L 140 50" stroke="#BE123C" strokeWidth="2.5" />
          <text x="145" y="50" fill="#BE123C" fontSize="16" fontWeight="bold">κ₂ &gt; 0</text>
        </svg>

        {/* Formula */}
        <div style={{ margin: "24px 0 16px 0", textAlign: "center" }}>
          <KaTeXFormula
            math="K = \kappa_1 \cdot \kappa_2 = \frac{1}{R^2} > 0"
            fontSize={36}
            color="#BE123C"
          />
        </div>

        <div
          style={{
            fontSize: "30px",
            lineHeight: 1.4,
            color: "#475569",
            textAlign: "center",
          }}
        >
          两个主曲率方向均向内弯曲。内蕴曲率严格大于零，数学上绝对无法在无拉伸条件下压平。
        </div>
      </div>

      {/* Card 2: Cylinder / Developable Surface (K = 0) */}
      <div
        style={{
          width: "600px",
          padding: "40px 36px",
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          borderRadius: "24px",
          border: "2px solid #E2E8F0",
          boxShadow: "0 25px 45px -12px rgba(0, 0, 0, 0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "#1D4ED8",
            marginBottom: "20px",
            whiteSpace: "nowrap",
          }}
        >
          圆柱面（可展曲面）
        </div>

        {/* Cylinder SVG graphic unrolling */}
        <svg width="280" height="220" viewBox="0 0 280 220">
          {/* Cylinder 3D body */}
          <ellipse cx="90" cy="50" rx="45" ry="18" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2" />
          <path d="M 45 50 L 45 160 A 45 18 0 0 0 135 160 L 135 50" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2" />
          <ellipse cx="90" cy="160" rx="45" ry="18" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Unrolled flat paper sheet */}
          <path d="M 135 70 L 250 70 L 235 170 L 120 170 Z" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />

          {/* Arrow unrolling */}
          <path d="M 125 110 Q 165 95 200 115" fill="none" stroke="#2563EB" strokeWidth="2.5" />
          <polygon points="202,118 190,115 198,106" fill="#2563EB" />
        </svg>

        {/* Formula */}
        <div style={{ margin: "24px 0 16px 0", textAlign: "center" }}>
          <KaTeXFormula
            math="K = \kappa_1 \cdot \kappa_2 = \frac{1}{R} \cdot 0 = 0"
            fontSize={36}
            color="#1D4ED8"
          />
        </div>

        <div
          style={{
            fontSize: "30px",
            lineHeight: 1.4,
            color: "#475569",
            textAlign: "center",
          }}
        >
          沿母线方向曲率为零，乘积恰好为零。高斯曲率与平面一致，因此白纸卷成的圆柱可以完美展平。
        </div>
      </div>
    </div>
  );
};
