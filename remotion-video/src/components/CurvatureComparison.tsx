import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Float } from "./Float";
import { FocusBeam } from "./FocusBeam";
import { KaTeXFormula } from "./KaTeXFormula";
import { MathEngine } from "./MathEngine";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const CurvatureComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card1Spring = spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 75 } });
  const card2Spring = spring({ frame: frame - 35, fps, config: { damping: 18, stiffness: 75 } });
  const engineSpring = spring({ frame: frame - 25, fps, config: { damping: 16, stiffness: 85 } });

  // Unrolling cylinder animation
  const unrollProgress = interpolate(frame, [40, 160], [0, 1], clamp);
  const spherePulse = interpolate(Math.sin(frame / 15), [-1, 1], [0.92, 1.08]);

  const beamProgress1 = interpolate(frame, [70, 160], [0, 1], clamp);
  const beamProgress2 = interpolate(frame, [140, 230], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 230,
        left: "50%",
        transform: "translateX(-50%)",
        width: 1620,
        height: 640,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* 1. Left Card: Positive Curvature (Sphere) */}
      <Float speed={52} amplitude={5}>
        <div
          style={{
            width: 530,
            height: 560,
            background: "rgba(255, 252, 244, 0.9)",
            border: "1.5px solid rgba(158, 42, 43, 0.28)",
            borderRadius: 12,
            boxShadow: "0 26px 70px rgba(158, 42, 43, 0.12)",
            padding: "30px 32px",
            boxSizing: "border-box",
            position: "relative",
            transform: `scale(${interpolate(card1Spring, [0, 1], [0.88, 1])})`,
            opacity: interpolate(card1Spring, [0, 1], [0, 1]),
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#8a4f48", letterSpacing: 1 }}>
              GAUSSIAN CURVATURE K &gt; 0
            </span>
            <span
              style={{
                fontFamily: SERIF_STACK,
                fontSize: 13,
                fontWeight: 700,
                color: "#9e2a2b",
                padding: "3px 10px",
                background: "rgba(158, 42, 43, 0.08)",
                borderRadius: 4,
              }}
            >
              不可展曲面
            </span>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 30,
              fontWeight: 700,
              color: "#9e2a2b",
              marginTop: 10,
            }}
          >
            地球正球面
          </div>

          {/* 3D Sphere Orthogonal Curvature Diagram */}
          <div
            style={{
              position: "relative",
              width: 220,
              height: 200,
              margin: "12px auto 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="220" height="200" viewBox="0 0 220 200">
              {/* Outer boundary circle */}
              <circle
                cx="110"
                cy="100"
                r="72"
                fill="rgba(158, 42, 43, 0.04)"
                stroke="#9e2a2b"
                strokeWidth="2.5"
              />
              {/* Equatorial ellipse */}
              <ellipse
                cx="110"
                cy="100"
                rx="72"
                ry="24"
                fill="none"
                stroke="#9e2a2b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Central normal point P */}
              <circle cx="110" cy="100" r="4.5" fill="#9e2a2b" />
              {/* Principal Curvature Circle 1 (Horizontal) */}
              <ellipse
                cx="110"
                cy="100"
                rx={60 * spherePulse}
                ry="18"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
              />
              {/* Principal Curvature Circle 2 (Vertical) */}
              <ellipse
                cx="110"
                cy="100"
                rx="18"
                ry={60 * spherePulse}
                fill="none"
                stroke="#9e2a2b"
                strokeWidth="2"
              />
              <text x="110" y="32" fill="#9e2a2b" fontFamily={MONO_STACK} fontSize="12" fontWeight="bold" textAnchor="middle">
                κ₂ = 1/R &gt; 0
              </text>
              <text x="180" y="104" fill="#d97706" fontFamily={MONO_STACK} fontSize="12" fontWeight="bold">
                κ₁ = 1/R &gt; 0
              </text>
            </svg>
          </div>

          {/* Formula */}
          <div
            style={{
              textAlign: "center",
              margin: "8px 0 12px",
              padding: "12px 14px",
              background: "rgba(158, 42, 43, 0.05)",
              borderRadius: 8,
            }}
          >
            <KaTeXFormula
              math="K = \kappa_1 \cdot \kappa_2 = \frac{1}{R^2} > 0"
              fontSize={24}
              color="#9e2a2b"
            />
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 16,
              color: "#5c4d4a",
              lineHeight: 1.6,
            }}
          >
            球面上任意微元在两个正交方向均向内弯曲。根据高斯绝妙定理，内蕴曲率严格大于零，<b>数学上绝不可能在不发生拉伸、挤压的前提下贴合到平整桌面</b>。
          </div>

          <FocusBeam progress={beamProgress1} tone="red" />
        </div>
      </Float>

      {/* Center: Differential Geometry Math Engine & Gauss Welding Lock */}
      <div
        style={{
          width: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${interpolate(engineSpring, [0, 1], [0.85, 1])})`,
          opacity: interpolate(engineSpring, [0, 1], [0, 1]),
        }}
      >
        <MathEngine
          title="高斯绝妙定理"
          subtitle="THEOREMA EGREGIUM"
          tone="amber"
          size={300}
        />

        {/* The Golden Weld Line */}
        <div
          style={{
            marginTop: 20,
            padding: "10px 22px",
            background: "rgba(167, 119, 72, 0.12)",
            border: "1.5px solid rgba(167, 119, 72, 0.4)",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#a77748" }} />
          <span style={{ fontFamily: SERIF_STACK, fontSize: 16, color: "#a77748", fontWeight: 700 }}>
            两百年前，高斯焊死完美之门
          </span>
        </div>
      </div>

      {/* 2. Right Card: Zero Curvature (Cylinder/Plane) */}
      <Float speed={48} amplitude={5} delay={12}>
        <div
          style={{
            width: 530,
            height: 560,
            background: "rgba(255, 252, 244, 0.9)",
            border: "1.5px solid rgba(49, 95, 109, 0.28)",
            borderRadius: 12,
            boxShadow: "0 26px 70px rgba(49, 95, 109, 0.12)",
            padding: "30px 32px",
            boxSizing: "border-box",
            position: "relative",
            transform: `scale(${interpolate(card2Spring, [0, 1], [0.88, 1])})`,
            opacity: interpolate(card2Spring, [0, 1], [0, 1]),
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#4f745d", letterSpacing: 1 }}>
              GAUSSIAN CURVATURE K ≡ 0
            </span>
            <span
              style={{
                fontFamily: SERIF_STACK,
                fontSize: 13,
                fontWeight: 700,
                color: "#315f6d",
                padding: "3px 10px",
                background: "rgba(49, 95, 109, 0.08)",
                borderRadius: 4,
              }}
            >
              可展曲面
            </span>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 30,
              fontWeight: 700,
              color: "#315f6d",
              marginTop: 10,
            }}
          >
            圆柱面与卷纸
          </div>

          {/* Unrolling Cylinder Diagram */}
          <div
            style={{
              position: "relative",
              width: 260,
              height: 200,
              margin: "12px auto 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="260" height="200" viewBox="0 0 260 200">
              {/* Left Cylinder */}
              <ellipse cx="60" cy="50" rx="36" ry="12" fill="none" stroke="#315f6d" strokeWidth="2" />
              <ellipse cx="60" cy="150" rx="36" ry="12" fill="none" stroke="#315f6d" strokeWidth="2" />
              <line x1="24" y1="50" x2="24" y2="150" stroke="#315f6d" strokeWidth="2" />
              <line x1="96" y1="50" x2="96" y2="150" stroke="#315f6d" strokeWidth="2" />

              {/* Unrolling Arrow & Sheet */}
              <path
                d="M 96 100 Q 135 90 155 100"
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
              <polygon points="158,96 168,102 158,108" fill="#059669" />

              {/* Unrolled Flat Sheet */}
              <polygon
                points={`150,${60 - 8 * unrollProgress} ${150 + 80 * unrollProgress},${52 - 4 * unrollProgress} ${150 + 80 * unrollProgress},${148 + 4 * unrollProgress} 150,${140 + 8 * unrollProgress}`}
                fill="rgba(49, 95, 109, 0.1)"
                stroke="#315f6d"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              <text x="60" y="28" fill="#315f6d" fontFamily={MONO_STACK} fontSize="11" fontWeight="bold" textAnchor="middle">
                κ₁ = 1/R
              </text>
              <text x="60" y="180" fill="#059669" fontFamily={MONO_STACK} fontSize="11" fontWeight="bold" textAnchor="middle">
                κ₂ = 0 (沿母线)
              </text>
            </svg>
          </div>

          {/* Formula */}
          <div
            style={{
              textAlign: "center",
              margin: "8px 0 12px",
              padding: "12px 14px",
              background: "rgba(49, 95, 109, 0.05)",
              borderRadius: 8,
            }}
          >
            <KaTeXFormula
              math="K = \kappa_1 \cdot \kappa_2 = \frac{1}{R} \cdot 0 \equiv 0"
              fontSize={24}
              color="#315f6d"
            />
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 16,
              color: "#4a5a54",
              lineHeight: 1.6,
            }}
          >
            圆柱沿母线方向曲率恒等于零，主曲率乘积恰好为零。<b>高斯曲率与平坦纸面完全一致</b>，因此一张纸卷成圆柱或展平，不会发生任何拉伸或挤压畸变。
          </div>

          <FocusBeam progress={beamProgress2} tone="blue" />
        </div>
      </Float>
    </div>
  );
};
