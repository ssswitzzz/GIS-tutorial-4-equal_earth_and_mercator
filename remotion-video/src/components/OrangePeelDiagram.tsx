import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Float } from "./Float";
import { FocusBeam } from "./FocusBeam";
import { DrawnStamp } from "./DrawnStamp";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const OrangePeelDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation sequences
  const peelSpread = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 65 } }),
    [0, 1],
    [0, 1],
    clamp
  );

  const card1Spring = spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 75 } });
  const card2Spring = spring({ frame: frame - 70, fps, config: { damping: 18, stiffness: 75 } });
  const questionSpring = spring({ frame: frame - 220, fps, config: { damping: 12, stiffness: 90 } });

  const beam1 = interpolate(frame, [80, 180], [0, 1], clamp);
  const beam2 = interpolate(frame, [140, 240], [0, 1], clamp);

  const wrinkleWave = Math.sin(frame / 8) * 3;
  const gapSpread = interpolate(peelSpread, [0, 1], [0, 14]);

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
      {/* 1. Left Card: Experiment A (若不撕裂: 强行压平起皱) */}
      <Float speed={54} amplitude={5}>
        <div
          style={{
            width: 530,
            height: 560,
            background: "rgba(255, 252, 244, 0.9)",
            border: "1.5px solid rgba(194, 65, 12, 0.3)",
            borderRadius: 12,
            boxShadow: "0 26px 70px rgba(194, 65, 12, 0.12)",
            padding: "30px 32px",
            boxSizing: "border-box",
            position: "relative",
            transform: `scale(${interpolate(card1Spring, [0, 1], [0.88, 1])})`,
            opacity: interpolate(card1Spring, [0, 1], [0, 1]),
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#c2410c", letterSpacing: 1 }}>
              CASE 01 · NO TEARING
            </span>
            <span
              style={{
                fontFamily: SERIF_STACK,
                fontSize: 13,
                fontWeight: 700,
                color: "#c2410c",
                padding: "3px 10px",
                background: "rgba(194, 65, 12, 0.08)",
                borderRadius: 4,
              }}
            >
              强行压平
            </span>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 30,
              fontWeight: 700,
              color: "#c2410c",
              marginTop: 10,
            }}
          >
            边缘必然起皱重叠
          </div>

          {/* Wrinkle buckling illustration */}
          <div
            style={{
              position: "relative",
              width: 260,
              height: 210,
              margin: "12px auto 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="260" height="210" viewBox="0 0 260 210">
              {/* Glass press arrows */}
              <line x1="130" y1="18" x2="130" y2="48" stroke="#c2410c" strokeWidth="2.5" />
              <polygon points="126,46 130,54 134,46" fill="#c2410c" />
              <text x="130" y="14" fill="#c2410c" fontFamily={MONO_STACK} fontSize="11" fontWeight="bold" textAnchor="middle">
                垂直强行按压平面
              </text>

              {/* Compressed Buckled Peel */}
              <path
                d={`M 40 140 Q ${70 + wrinkleWave} ${100 - wrinkleWave} 100 135 T 160 135 T ${220 - wrinkleWave} 140`}
                fill="none"
                stroke="#ea580c"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Overlapping pleats */}
              <path
                d="M 85 118 L 105 145 M 145 118 L 165 145"
                stroke="#9a3412"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text x="130" y="182" fill="#9a3412" fontFamily={SERIF_STACK} fontSize="14" fontWeight="bold" textAnchor="middle">
                周长多余：产生重叠褶皱
              </text>
            </svg>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 16,
              color: "#5c4d4a",
              lineHeight: 1.6,
              marginTop: 10,
            }}
          >
            球面的真实表面积分布与平面极径关系不同。如果不切破橘皮强行压向桌面，<b>外围圆周必然因为面积与周长的不匹配而发生挤压、折叠与剧烈起皱</b>。
          </div>

          <FocusBeam progress={beam1} tone="amber" />
        </div>
      </Float>

      {/* Center: The Peeled 6 Gores Diagram */}
      <div
        style={{
          width: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 14,
            color: "#c2410c",
            fontWeight: 800,
            letterSpacing: 1.2,
            marginBottom: 12,
          }}
        >
          PHYSICAL EXPERIMENT · 橘皮物理直觉
        </div>

        {/* 6 Sinusoidal Orange Petals expanding */}
        <svg width="460" height="260" viewBox="0 0 460 260">
          {/* Table baseline */}
          <line x1="20" y1="230" x2="440" y2="230" stroke="#78716c" strokeWidth="2.5" />
          <text x="230" y="250" fill="#78716c" fontFamily={MONO_STACK} fontSize="12" textAnchor="middle">
            绝对平整的二维桌面 (K = 0)
          </text>

          {/* 6 gores with gap */}
          {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((idx, i) => {
            const cx = 230 + idx * (56 + gapSpread);
            return (
              <g key={i}>
                <path
                  d={`M ${cx - 24} 230 C ${cx - 24} 160, ${cx - 14} 90, ${cx} ${70 - 15 * peelSpread} C ${cx + 14} 90, ${cx + 24} 160, ${cx + 24} 230 Z`}
                  fill="url(#orangeGrad)"
                  stroke="#c2410c"
                  strokeWidth="1.5"
                />
                {/* Tear gap dashed lines between gores */}
                {i < 5 && (
                  <line
                    x1={cx + 24}
                    y1="160"
                    x2={cx + 24 + gapSpread}
                    y2="160"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
              </g>
            );
          })}

          <defs>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          {/* Measurement callout of gap */}
          <text x="230" y="46" fill="#dc2626" fontFamily={MONO_STACK} fontSize="13" fontWeight="bold" textAnchor="middle">
            必然撕裂的几何放射状缝隙
          </text>
        </svg>

        {/* The Big Question Mark pop up */}
        <div
          style={{
            marginTop: 18,
            transform: `scale(${interpolate(questionSpring, [0, 1], [0.6, 1])})`,
            opacity: interpolate(questionSpring, [0, 1], [0, 1]),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "10px 24px",
              background: "rgba(167, 119, 72, 0.14)",
              border: "1.5px solid rgba(167, 119, 72, 0.45)",
              borderRadius: 999,
              fontFamily: SERIF_STACK,
              fontSize: 22,
              fontWeight: 700,
              color: "#8c5627",
            }}
          >
            那怎么办呢？地球注定要变形！
          </div>
        </div>
      </div>

      {/* 2. Right Card: Experiment B (若完全展开: 必被撕裂) */}
      <Float speed={46} amplitude={5} delay={14}>
        <div
          style={{
            width: 530,
            height: 560,
            background: "rgba(255, 252, 244, 0.9)",
            border: "1.5px solid rgba(185, 28, 28, 0.3)",
            borderRadius: 12,
            boxShadow: "0 26px 70px rgba(185, 28, 28, 0.12)",
            padding: "30px 32px",
            boxSizing: "border-box",
            position: "relative",
            transform: `scale(${interpolate(card2Spring, [0, 1], [0.88, 1])})`,
            opacity: interpolate(card2Spring, [0, 1], [0, 1]),
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#b91c1c", letterSpacing: 1 }}>
              CASE 02 · FULL FLATTENING
            </span>
            <span
              style={{
                fontFamily: SERIF_STACK,
                fontSize: 13,
                fontWeight: 700,
                color: "#b91c1c",
                padding: "3px 10px",
                background: "rgba(185, 28, 28, 0.08)",
                borderRadius: 4,
              }}
            >
              保持平坦
            </span>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 30,
              fontWeight: 700,
              color: "#b91c1c",
              marginTop: 10,
            }}
          >
            球壳必被撕开无数缺口
          </div>

          {/* Tearing Gaps Illustration */}
          <div
            style={{
              position: "relative",
              width: 260,
              height: 210,
              margin: "12px auto 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="260" height="210" viewBox="0 0 260 210">
              {/* Radial tear sector */}
              <path
                d="M 130 170 L 60 70 A 95 95 0 0 1 110 40 Z"
                fill="rgba(234, 88, 12, 0.2)"
                stroke="#ea580c"
                strokeWidth="2"
              />
              <path
                d="M 130 170 L 150 40 A 95 95 0 0 1 200 70 Z"
                fill="rgba(234, 88, 12, 0.2)"
                stroke="#ea580c"
                strokeWidth="2"
              />

              {/* Tear gap angle indicator */}
              <path
                d="M 115 80 A 70 70 0 0 1 145 80"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <text x="130" y="70" fill="#dc2626" fontFamily={MONO_STACK} fontSize="12" fontWeight="bold" textAnchor="middle">
                Δθ &gt; 0
              </text>
              <text x="130" y="195" fill="#991b1b" fontFamily={SERIF_STACK} fontSize="14" fontWeight="bold" textAnchor="middle">
                球壳被割裂为不连续瓣
              </text>
            </svg>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 16,
              color: "#5c4d4a",
              lineHeight: 1.6,
              marginTop: 10,
            }}
          >
            若要每个局部都绝对平展，就必须将其剪开为若干瓣，<b>两极之间必然产生巨大的放射状空隙，连续的世界地图在此彻底碎裂</b>。
          </div>

          <FocusBeam progress={beam2} tone="red" />
        </div>
      </Float>
    </div>
  );
};
