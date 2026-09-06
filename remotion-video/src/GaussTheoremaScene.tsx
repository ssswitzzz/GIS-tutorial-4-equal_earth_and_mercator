import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { PaperBackground } from "./components/PaperBackground";
import { TopHeader, SectionTitle } from "./components/SectionHeader";
import { ActTracker } from "./components/ActTracker";
import { InteractiveSphereMap } from "./components/InteractiveSphereMap";
import { CurvatureComparison } from "./components/CurvatureComparison";
import { OrangePeelDiagram } from "./components/OrangePeelDiagram";
import { TissotTrilemma } from "./components/TissotTrilemma";
import { PhilosophyBanner } from "./components/PhilosophyBanner";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);

// S-Curve smooth cross-fade helper matching reference project
const smoothFade = (frame: number, start: number, end: number, fadeIn = 24, fadeOut = 24) => {
  const p = interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);
  return ease(p);
};

export const GaussTheoremaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Act Timing boundaries (60fps, 6600 frames total = 110s):
  // Act 1: 0 - 1500 (0s - 25s)
  // Act 2: 1500 - 3300 (25s - 55s)
  // Act 3: 3300 - 4800 (55s - 80s)
  // Act 4: 4800 - 6600 (80s - 110s)
  let currentAct = 1;
  let actTitle = "01. 完美假想与测地线破灭";
  if (frame >= 4800) {
    currentAct = 4;
    actTitle = "04. 制图师三大抉择与主动偏见";
  } else if (frame >= 3300) {
    currentAct = 3;
    actTitle = "03. 橘皮悖论与物理不可压平";
  } else if (frame >= 1500) {
    currentAct = 2;
    actTitle = "02. 高斯绝妙定理与曲率内蕴";
  }

  // Cross-fades between the 4 Acts
  const act1Fade = smoothFade(frame, 0, 1500, 20, 30);
  const act2Fade = smoothFade(frame, 1470, 3300, 30, 30);
  const act3Fade = smoothFade(frame, 3270, 4800, 30, 30);
  const act4Fade = smoothFade(frame, 4770, 6600, 30, 20);

  // Underline animations for titles
  const u1 = interpolate(frame, [20, 80], [0, 1], { ...clamp, easing: ease });
  const u2 = interpolate(frame, [1520, 1580], [0, 1], { ...clamp, easing: ease });
  const u3 = interpolate(frame, [3320, 3380], [0, 1], { ...clamp, easing: ease });
  const u4 = interpolate(frame, [4820, 4880], [0, 1], { ...clamp, easing: ease });

  // Act 4 Climax: Philosophy Banner reveals from frame 5800 onwards
  const bannerProgress = interpolate(frame, [5800, 5860], [0, 1], { ...clamp, easing: ease });
  const trilemmaFade = interpolate(frame, [5780, 5830], [1, 0.15], clamp);

  return (
    <AbsoluteFill style={{ overflow: "hidden", color: "#29342f" }}>
      {/* Dynamic drifting background with topography contours */}
      <PaperBackground tone={frame >= 1500 && frame < 4800 ? "warm" : "light"} />

      {/* Top Status Navigation Header */}
      <TopHeader currentActTitle={actTitle} />

      {/* ==================== ACT 1: 完美假想与测地线破灭 (0 - 1500) ==================== */}
      {act1Fade > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: act1Fade, pointerEvents: "none" }}>
          <SectionTitle
            eyebrow="第一幕 · 完美地图的假想"
            title="世界上根本不存在一张完美的平面地图"
            subtitle="所谓“完美”，本质上是地图上任意两点之间的距离，都必须和现实世界分毫不差地成比例。"
            color="#315f6d"
            underlineProgress={u1}
          />
          <InteractiveSphereMap sceneProgress={act1Fade} />
        </div>
      )}

      {/* ==================== ACT 2: 高斯绝妙定理与曲率内蕴 (1500 - 3300) ==================== */}
      {act2Fade > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: act2Fade, pointerEvents: "none" }}>
          <SectionTitle
            eyebrow="第二幕 · 高斯绝妙定理 (THEOREMA EGREGIUM)"
            title="两百年前，高斯焊死了这扇大门"
            subtitle="高斯用微分几何证明：高斯曲率是内蕴的。球面曲率 K > 0，而平坦纸面曲率为 0，球壳绝不可能无拉伸挤压贴合到平面。"
            color="#a77748"
            underlineProgress={u2}
          />
          <CurvatureComparison />
        </div>
      )}

      {/* ==================== ACT 3: 橘皮悖论与物理不可压平 (3300 - 4800) ==================== */}
      {act3Fade > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: act3Fade, pointerEvents: "none" }}>
          <SectionTitle
            eyebrow="第三幕 · 橘皮物理直觉"
            title="剥开橘子皮：展平必撕裂，保全必起皱"
            subtitle="在不撕破、不揉皱的前提下，物理上绝对不可能把这个橘子皮完整压平在桌面上。那制图师该怎么办？"
            color="#c2410c"
            underlineProgress={u3}
          />
          <OrangePeelDiagram />
        </div>
      )}

      {/* ==================== ACT 4: 制图师三大抉择与主动偏见 (4800 - 6600) ==================== */}
      {act4Fade > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: act4Fade, pointerEvents: "none" }}>
          <SectionTitle
            eyebrow="第四幕 · 制图师的主动偏见"
            title="三大抉择：保形状？保面积？保距离？"
            subtitle="既然地球注定要变形，制图师便只能在等角、等积、等距间权衡取舍。"
            color="#4f745d"
            underlineProgress={u4}
          />

          {/* Trilemma Cards */}
          <div style={{ opacity: trilemmaFade, transition: "opacity 0.5s ease" }}>
            <TissotTrilemma />
          </div>

          {/* Climax Philosophy Banner */}
          {bannerProgress > 0 && <PhilosophyBanner progress={bannerProgress} />}
        </div>
      )}

      {/* Bottom Act Tracker */}
      <ActTracker currentAct={currentAct} />
    </AbsoluteFill>
  );
};
