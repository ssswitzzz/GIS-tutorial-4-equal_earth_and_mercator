import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Float } from "./Float";
import { FocusBeam } from "./FocusBeam";
import { KaTeXFormula } from "./KaTeXFormula";
import { Packet } from "./Packet";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const TissotTrilemma: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs for the 3 choice cards
  const card1Spring = spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 75 } });
  const card2Spring = spring({ frame: frame - 45, fps, config: { damping: 18, stiffness: 75 } });
  const card3Spring = spring({ frame: frame - 75, fps, config: { damping: 18, stiffness: 75 } });

  // Tissot Conformal inflation
  const inflateScale = interpolate(Math.sin(frame / 20), [-1, 1], [1.1, 2.4]);
  // Tissot Equal-Area squishing
  const stretchX = interpolate(Math.sin(frame / 18), [-1, 1], [1.4, 2.5]);
  const squashY = 1 / stretchX;

  // Packet flows connecting choices
  const packet1Prog = interpolate(frame, [80, 180], [0, 1], clamp);
  const packet1Op = interpolate(frame, [75, 90, 170, 185], [0, 1, 1, 0], clamp);
  const packet2Prog = interpolate(frame, [170, 270], [0, 1], clamp);
  const packet2Op = interpolate(frame, [165, 180, 260, 275], [0, 1, 1, 0], clamp);

  const beam1 = interpolate(frame, [40, 140], [0, 1], clamp);
  const beam2 = interpolate(frame, [100, 200], [0, 1], clamp);
  const beam3 = interpolate(frame, [160, 260], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: "50%",
        transform: "translateX(-50%)",
        width: 1640,
        height: 520,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* 1. Choice 01: 保形状 (等角) */}
      <Float speed={55} amplitude={4}>
        <div
          style={{
            width: 510,
            height: 500,
            background: "rgba(255, 252, 244, 0.92)",
            border: "1.5px solid rgba(49, 95, 109, 0.3)",
            borderRadius: 12,
            boxShadow: "0 24px 60px rgba(49, 95, 109, 0.12)",
            padding: "26px 28px",
            boxSizing: "border-box",
            position: "relative",
            transform: `scale(${interpolate(card1Spring, [0, 1], [0.88, 1])})`,
            opacity: interpolate(card1Spring, [0, 1], [0, 1]),
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#315f6d", letterSpacing: 1 }}>
              CHOICE 01 · CONFORMAL
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
              保形状
            </span>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 28,
              fontWeight: 700,
              color: "#315f6d",
              marginTop: 8,
            }}
          >
            等角投影
          </div>

          {/* Tissot Conformal Demo */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 140,
              margin: "8px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="340" height="130" viewBox="0 0 340 130">
              {/* Equator Small Circle */}
              <circle cx="80" cy="65" r="22" fill="none" stroke="#315f6d" strokeWidth="2" />
              <text x="80" y="105" fill="#315f6d" fontFamily={SERIF_STACK} fontSize="12" textAnchor="middle">
                赤道基准正圆
              </text>

              {/* Arrow */}
              <path d="M 125 65 L 175 65" stroke="#315f6d" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="175,61 183,65 175,69" fill="#315f6d" />

              {/* High-latitude Inflated Circle */}
              <circle
                cx="240"
                cy="65"
                r={22 * inflateScale}
                fill="rgba(49, 95, 109, 0.15)"
                stroke="#315f6d"
                strokeWidth="2"
              />
              <text x="240" y="118" fill="#9e2a2b" fontFamily={MONO_STACK} fontSize="12" fontWeight="bold" textAnchor="middle">
                高纬面积爆炸 ×{Math.round(inflateScale * inflateScale * 10) / 10}
              </text>
            </svg>
          </div>

          {/* Formula */}
          <div
            style={{
              textAlign: "center",
              padding: "8px 12px",
              background: "rgba(49, 95, 109, 0.05)",
              borderRadius: 6,
            }}
          >
            <KaTeXFormula math="ds^2 = m^2(\phi)(dx^2 + dy^2)" fontSize={20} color="#315f6d" />
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 15,
              color: "#4a5a54",
              lineHeight: 1.5,
              marginTop: 10,
            }}
          >
            局部任意方向伸缩率严格相等，轮廓不歪；<b>代价是纬度越高面积急剧膨胀</b>，两极趋向无穷大。
          </div>

          {/* Penalty Pill */}
          <div
            style={{
              marginTop: 12,
              padding: "8px 14px",
              background: "rgba(158, 42, 43, 0.08)",
              border: "1px solid rgba(158, 42, 43, 0.25)",
              borderRadius: 6,
              fontFamily: SERIF_STACK,
              fontSize: 13,
              color: "#9e2a2b",
              fontWeight: 700,
            }}
          >
            代价：格陵兰被夸大 14 倍，面积严重失真
          </div>

          <FocusBeam progress={beam1} tone="blue" />
        </div>
      </Float>

      {/* Packet 1 -> 2 */}
      <Packet progress={packet1Prog} opacity={packet1Op} label="切换指标" startX={560} endX={740} y={260} color="#4f745d" />

      {/* 2. Choice 02: 保面积 (等积) */}
      <Float speed={50} amplitude={4} delay={10}>
        <div
          style={{
            width: 510,
            height: 500,
            background: "rgba(255, 252, 244, 0.92)",
            border: "1.5px solid rgba(79, 116, 93, 0.3)",
            borderRadius: 12,
            boxShadow: "0 24px 60px rgba(79, 116, 93, 0.12)",
            padding: "26px 28px",
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
              CHOICE 02 · EQUAL-AREA
            </span>
            <span
              style={{
                fontFamily: SERIF_STACK,
                fontSize: 13,
                fontWeight: 700,
                color: "#4f745d",
                padding: "3px 10px",
                background: "rgba(79, 116, 93, 0.08)",
                borderRadius: 4,
              }}
            >
              保面积
            </span>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 28,
              fontWeight: 700,
              color: "#4f745d",
              marginTop: 8,
            }}
          >
            等积投影
          </div>

          {/* Tissot Equal Area Demo */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 140,
              margin: "8px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="340" height="130" viewBox="0 0 340 130">
              {/* Unit circle */}
              <circle cx="80" cy="65" r="26" fill="none" stroke="#4f745d" strokeWidth="2" />
              <text x="80" y="105" fill="#4f745d" fontFamily={SERIF_STACK} fontSize="12" textAnchor="middle">
                标准球面对称
              </text>

              {/* Arrow */}
              <path d="M 125 65 L 175 65" stroke="#4f745d" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="175,61 183,65 175,69" fill="#4f745d" />

              {/* Compressed Ellipse (Constant Area) */}
              <ellipse
                cx="240"
                cy="65"
                rx={26 * stretchX}
                ry={26 * squashY}
                fill="rgba(79, 116, 93, 0.15)"
                stroke="#4f745d"
                strokeWidth="2"
              />
              {/* Compression clamping arrows */}
              <line x1="240" y1="20" x2="240" y2="40" stroke="#c2410c" strokeWidth="2" />
              <polygon points="237,38 240,45 243,38" fill="#c2410c" />
              <line x1="240" y1="110" x2="240" y2="90" stroke="#c2410c" strokeWidth="2" />
              <polygon points="237,92 240,85 243,92" fill="#c2410c" />

              <text x="240" y="122" fill="#4f745d" fontFamily={MONO_STACK} fontSize="12" fontWeight="bold" textAnchor="middle">
                面积恒定 a · b ≡ 1
              </text>
            </svg>
          </div>

          {/* Formula */}
          <div
            style={{
              textAlign: "center",
              padding: "8px 12px",
              background: "rgba(79, 116, 93, 0.05)",
              borderRadius: 6,
            }}
          >
            <KaTeXFormula math="a \cdot b = 1 \implies S \equiv \text{常数}" fontSize={20} color="#4f745d" />
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 15,
              color: "#4a5a54",
              lineHeight: 1.5,
              marginTop: 10,
            }}
          >
            横向被拉长多少，纵向就必须被狠狠压瘪抵消；<b>代价是陆地轮廓惨遭剪切挤压</b>，形状如车轮碾过。
          </div>

          {/* Penalty Pill */}
          <div
            style={{
              marginTop: 12,
              padding: "8px 14px",
              background: "rgba(194, 65, 12, 0.08)",
              border: "1px solid rgba(194, 65, 12, 0.25)",
              borderRadius: 6,
              fontFamily: SERIF_STACK,
              fontSize: 13,
              color: "#c2410c",
              fontWeight: 700,
            }}
          >
            代价：大陆形状严重扭曲，高纬被极度压扁
          </div>

          <FocusBeam progress={beam2} tone="green" />
        </div>
      </Float>

      {/* Packet 2 -> 3 */}
      <Packet progress={packet2Prog} opacity={packet2Op} label="切换指标" startX={1100} endX={1280} y={260} color="#a77748" />

      {/* 3. Choice 03: 保距离 (等距) */}
      <Float speed={48} amplitude={4} delay={20}>
        <div
          style={{
            width: 510,
            height: 500,
            background: "rgba(255, 252, 244, 0.92)",
            border: "1.5px solid rgba(167, 119, 72, 0.3)",
            borderRadius: 12,
            boxShadow: "0 24px 60px rgba(167, 119, 72, 0.12)",
            padding: "26px 28px",
            boxSizing: "border-box",
            position: "relative",
            transform: `scale(${interpolate(card3Spring, [0, 1], [0.88, 1])})`,
            opacity: interpolate(card3Spring, [0, 1], [0, 1]),
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#a77748", letterSpacing: 1 }}>
              CHOICE 03 · EQUIDISTANT
            </span>
            <span
              style={{
                fontFamily: SERIF_STACK,
                fontSize: 13,
                fontWeight: 700,
                color: "#a77748",
                padding: "3px 10px",
                background: "rgba(167, 119, 72, 0.08)",
                borderRadius: 4,
              }}
            >
              保距离
            </span>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 28,
              fontWeight: 700,
              color: "#a77748",
              marginTop: 8,
            }}
          >
            等距投影
          </div>

          {/* Equidistant Radial Demo */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 140,
              margin: "8px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width="220" height="130" viewBox="0 0 220 130">
              {/* Central anchor point */}
              <circle cx="110" cy="65" r="5" fill="#a77748" />
              {/* Concentric distance circles */}
              <circle cx="110" cy="65" r="25" fill="none" stroke="#a77748" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="110" cy="65" r="48" fill="none" stroke="#a77748" strokeWidth="1.2" strokeDasharray="3 3" />
              {/* Radial rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1="110"
                    y1="65"
                    x2={110 + 52 * Math.cos(rad)}
                    y2={65 + 52 * Math.sin(rad)}
                    stroke="#a77748"
                    strokeWidth="1.8"
                  />
                );
              })}
              <text x="110" y="122" fill="#a77748" fontFamily={SERIF_STACK} fontSize="12" fontWeight="bold" textAnchor="middle">
                仅中心向外辐射等距
              </text>
            </svg>
          </div>

          {/* Formula */}
          <div
            style={{
              textAlign: "center",
              padding: "8px 12px",
              background: "rgba(167, 119, 72, 0.05)",
              borderRadius: 6,
            }}
          >
            <KaTeXFormula math="\Delta s = r \quad (\text{仅单点向外})" fontSize={20} color="#a77748" />
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 15,
              color: "#4a5a54",
              lineHeight: 1.5,
              marginTop: 10,
            }}
          >
            最多只能保住以某一点为中心向外辐射的距离；<b>绝不可能保住全图任意两点间的真实距离</b>。
          </div>

          {/* Penalty Pill */}
          <div
            style={{
              marginTop: 12,
              padding: "8px 14px",
              background: "rgba(167, 119, 72, 0.08)",
              border: "1px solid rgba(167, 119, 72, 0.25)",
              borderRadius: 6,
              fontFamily: SERIF_STACK,
              fontSize: 13,
              color: "#8a5828",
              fontWeight: 700,
            }}
          >
            代价：两点若不经中心，距离与航线全部失效
          </div>

          <FocusBeam progress={beam3} tone="amber" />
        </div>
      </Float>
    </div>
  );
};
