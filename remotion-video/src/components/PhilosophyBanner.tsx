import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Float } from "./Float";
import { DrawnStamp } from "./DrawnStamp";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

export const PhilosophyBanner: React.FC<{
  progress: number; // 0 to 1
}> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stampSpring = spring({ frame: frame - 180, fps, config: { damping: 11, stiffness: 120 } });
  const isStamped = frame >= 185;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: "50%",
        transform: `translateX(-50%) translateY(${interpolate(progress, [0, 1], [60, 0])}px)`,
        width: 1540,
        opacity: progress,
        zIndex: 50,
      }}
    >
      <Float speed={60} amplitude={3}>
        <div
          style={{
            background: "linear-gradient(135deg, #202b26 0%, #17211d 100%)",
            border: "2px solid rgba(167, 119, 72, 0.55)",
            borderRadius: 16,
            padding: "36px 54px",
            boxSizing: "border-box",
            boxShadow: "0 30px 90px rgba(23, 33, 29, 0.45)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Subtle gold watermark lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.1,
              backgroundImage:
                "linear-gradient(rgba(167, 119, 72, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(167, 119, 72, 0.4) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div
            style={{
              fontFamily: MONO_STACK,
              fontSize: 14,
              color: "#c49a6c",
              letterSpacing: 2,
              fontWeight: 800,
              marginBottom: 14,
            }}
          >
            CARTOGRAPHIC ESSENCE · 地图学的终极真相
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 38,
              lineHeight: 1.45,
              fontWeight: 700,
              color: "#fcfbf7",
              letterSpacing: 0.5,
              maxWidth: 1320,
            }}
          >
            “当我们没法画出完美的地图，这时候每一张地图的绘制，
            <br />
            本质上都是制图师权衡利弊后，
            <span style={{ color: "#e6b37c", textDecoration: "underline", textUnderlineOffset: "8px" }}>
              主动选择的偏见
            </span>
            。”
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 18,
              color: "#9cad9f",
              marginTop: 18,
              letterSpacing: 0.5,
            }}
          >
            没有唯一真理，只有特定场景下的最佳妥协。
          </div>

          {/* Endorsement Stamp */}
          {isStamped && (
            <DrawnStamp
              progress={stampSpring}
              tone="amber"
              title="ACTIVE BIAS"
              label="主动选择的偏见"
              style={{ right: 40, bottom: 25 }}
            />
          )}
        </div>
      </Float>
    </div>
  );
};
