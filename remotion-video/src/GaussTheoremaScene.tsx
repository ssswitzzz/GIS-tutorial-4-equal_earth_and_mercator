import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PaperBackground } from "./components/PaperBackground";
import { ActTracker } from "./components/ActTracker";
import { SectionHeader } from "./components/SectionHeader";
import { CurvatureComparison } from "./components/CurvatureComparison";
import { OrangePeelDiagram } from "./components/OrangePeelDiagram";
import { TissotTrilemma } from "./components/TissotTrilemma";
import { KaTeXFormula } from "./components/KaTeXFormula";

export const GaussTheoremaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Responsive scale relative to 1920x1080
  const scale = width / 1920;

  // Act Timing boundaries (60fps):
  // Act 1: 0 - 900 (0s - 15s)
  // Act 2: 900 - 2700 (15s - 45s)
  // Act 3: 2700 - 3900 (45s - 65s)
  // Act 4: 3900 - 6600 (65s - 110s)
  let currentAct = 1;
  if (frame >= 3900) {
    currentAct = 4;
  } else if (frame >= 2700) {
    currentAct = 3;
  } else if (frame >= 900) {
    currentAct = 2;
  }

  // Crossfade transition window helper
  const getActFade = (startFrame: number, endFrame: number) => {
    const fadeIn = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(frame, [endFrame - 25, endFrame], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return Math.min(fadeIn, fadeOut);
  };

  return (
    <PaperBackground>
      {/* 1920x1080 Scaled Viewport Container */}
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
          paddingTop: "60px",
        }}
      >
        {/* ACT 1: 完美地图的假想 (0 - 900) */}
        {frame < 920 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "70px",
              opacity: getActFade(0, 900),
            }}
          >
            <SectionHeader
              badge="第一幕 · 完美地图的悖论"
              badgeColor="#1D4ED8"
              badgeBg="#EFF6FF"
              title="世界上不存在完美的平面地图"
              subtitle="所谓完美，即任意两点间的距离与现实分毫不差地等比例缩放"
            />

            {/* Act 1 Visual: Global Isometry metric breakdown */}
            <div
              style={{
                width: "1360px",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "24px",
                border: "2px solid #E2E8F0",
                boxShadow: "0 25px 45px -12px rgba(0, 0, 0, 0.05)",
                padding: "44px 54px",
                display: "flex",
                gap: "48px",
                alignItems: "center",
              }}
            >
              <svg width="380" height="280" viewBox="0 0 380 280">
                {/* 3D Wireframe sphere */}
                <circle cx="140" cy="140" r="95" fill="#F8FAFC" stroke="#1D4ED8" strokeWidth="2.5" />
                <ellipse cx="140" cy="140" rx="95" ry="30" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 140 45 A 95 95 0 0 1 140 235" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4 4" />
                {/* Points A and B on sphere */}
                <circle cx="95" cy="115" r="7" fill="#BE123C" />
                <text x="75" y="110" fill="#BE123C" fontSize="20" fontWeight="bold">A</text>
                <circle cx="190" cy="170" r="7" fill="#BE123C" />
                <text x="205" y="175" fill="#BE123C" fontSize="20" fontWeight="bold">B</text>
                {/* Geodesic Arc */}
                <path d="M 95 115 Q 145 160 190 170" fill="none" stroke="#EA580C" strokeWidth="3" />
                <text x="145" y="135" fill="#EA580C" fontSize="18" fontWeight="bold">d(A, B)</text>

                {/* Broken arrow pointing to flat plane */}
                <path d="M 255 140 L 340 140" stroke="#BE123C" strokeWidth="2.5" strokeDasharray="5 5" />
                <text x="295" y="125" textAnchor="middle" fill="#BE123C" fontSize="26" fontWeight="bold">↛</text>
                <text x="295" y="170" textAnchor="middle" fill="#BE123C" fontSize="18" fontWeight="bold">无法等距</text>
              </svg>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "#0F172A", whiteSpace: "nowrap" }}>
                  数学上的“全局等距映射”假想
                </div>

                <div
                  style={{
                    padding: "16px 24px",
                    backgroundColor: "#EFF6FF",
                    borderRadius: "14px",
                    border: "1.5px solid #DBEAFE",
                    whiteSpace: "nowrap",
                  }}
                >
                  <KaTeXFormula
                    math="f: \mathbb{S}^2 \to \mathbb{R}^2 \quad \text{满足} \quad d_{\mathbb{R}^2}(f(A), f(B)) \equiv \lambda \cdot d_{\mathbb{S}^2}(A, B)"
                    fontSize={25}
                    color="#1D4ED8"
                  />
                </div>

                <div style={{ fontSize: "30px", lineHeight: 1.45, color: "#475569" }}>
                  我们直觉中渴望的“完美地图”，必须让图上每一处距离都分毫不差成比例。然而这扇大门，在数学上早已被彻底封死。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACT 2: 高斯绝妙定理 (900 - 2700) */}
        {frame >= 880 && frame < 2720 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "60px",
              opacity: getActFade(900, 2700),
            }}
          >
            <SectionHeader
              badge="第二幕 · 高斯绝妙定理"
              badgeColor="#BE123C"
              badgeBg="#FFF1F2"
              title="两百年前，高斯焊死了这扇大门"
              subtitle="微分几何证明：高斯曲率是曲面的内蕴性质，绝不可能在无拉伸下贴合到平面"
            />

            <CurvatureComparison progressFrame={frame - 900} />
          </div>
        )}

        {/* ACT 3: 橘子皮的困境 (2700 - 3900) */}
        {frame >= 2680 && frame < 3920 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "60px",
              opacity: getActFade(2700, 3900),
            }}
          >
            <SectionHeader
              badge="第三幕 · 橘子皮物理直觉"
              badgeColor="#EA580C"
              badgeBg="#FFF7ED"
              title="剥开橘子皮：展平必撕裂，保全必起皱"
              subtitle="不撕破、不揉皱，在物理上绝对不可能把完整的球面皮压平在桌面上"
            />

            <OrangePeelDiagram progressFrame={frame - 2700} />
          </div>
        )}

        {/* ACT 4: 三岔路口与主动偏见 (3900 - 6600) */}
        {frame >= 3880 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "50px",
              opacity: getActFade(3900, 6600),
            }}
          >
            <SectionHeader
              badge="第四幕 · 制图师的主动偏见"
              badgeColor="#059669"
              badgeBg="#ECFDF5"
              title="三大抉择：保形状？保面积？保距离？"
              subtitle="每一张地图的诞生，都是制图师权衡利弊后主动选择的偏见"
            />

            <TissotTrilemma progressFrame={frame - 3900} />
          </div>
        )}

        {/* Persistent Clean Bottom Act Tracker */}
        <ActTracker currentAct={currentAct} />
      </div>
    </PaperBackground>
  );
};
