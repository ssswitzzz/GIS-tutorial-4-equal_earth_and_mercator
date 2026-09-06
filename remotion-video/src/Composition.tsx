import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Responsive scale relative to 1920x1080
  const scale = width / 1920;

  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 16, stiffness: 60 },
  });

  const cardSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 18, stiffness: 55 },
  });

  const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDFBF7",
        fontFamily:
          '"Source Han Serif CN", "Songti SC", "Noto Serif CJK SC", SimSun, serif',
        color: "#1E293B",
        overflow: "hidden",
      }}
    >
      {/* Scaled container */}
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
          justifyContent: "center",
          backgroundImage: `
            radial-gradient(#E2E8F0 1.5px, transparent 1.5px),
            linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px, 120px 120px, 120px 120px",
        }}
      >
        {/* Eyebrow Badge */}
        <div
          style={{
            padding: "8px 24px",
            borderRadius: "999px",
            backgroundColor: "#F1F5F9",
            border: "1.5px solid #CBD5E1",
            fontSize: "30px",
            fontWeight: 700,
            color: "#475569",
            letterSpacing: "0.08em",
            marginBottom: "32px",
            whiteSpace: "nowrap",
            opacity: titleOpacity,
            transform: `translateY(${titleY * 0.5}px)`,
          }}
        >
          GIS 投影几何心智模型
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: "96px",
            fontWeight: 800,
            margin: "0 0 24px 0",
            color: "#0F172A",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          平等地球与墨卡托投影
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "34px",
            fontWeight: 500,
            color: "#64748B",
            margin: "0 0 54px 0",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            opacity: titleOpacity,
          }}
        >
          从圆柱正轴投影视线，到切千层饼与橡皮泥等面积守恒
        </p>

        {/* Feature Cards Container */}
        <div
          style={{
            display: "flex",
            gap: "36px",
            opacity: interpolate(cardSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(cardSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          {/* Card 1: Mercator */}
          <div
            style={{
              width: "480px",
              padding: "36px 32px",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              borderRadius: "20px",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "#1E3A8A",
                marginBottom: "14px",
                whiteSpace: "nowrap",
              }}
            >
              01 · 墨卡托投影 (Mercator)
            </div>
            <div
              style={{
                fontSize: "30px",
                lineHeight: 1.5,
                color: "#475569",
              }}
            >
              正轴等角圆柱投影。保持航线方位角不变，但高纬度面积急剧放大膨胀。
            </div>
          </div>

          {/* Card 2: Equal Earth */}
          <div
            style={{
              width: "480px",
              padding: "36px 32px",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              borderRadius: "20px",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.05)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "#166534",
                marginBottom: "14px",
                whiteSpace: "nowrap",
              }}
            >
              02 · 平等地球 (Equal Earth)
            </div>
            <div
              style={{
                fontSize: "30px",
                lineHeight: 1.5,
                color: "#475569",
              }}
            >
              等面积伪圆柱投影。两极平头修剪 59.25%，忠实还原真实地缘面积比例。
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
