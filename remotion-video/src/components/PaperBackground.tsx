import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const PaperBackground: React.FC<{ tone?: "light" | "warm"; children?: React.ReactNode }> = ({
  tone = "light",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const normalizedFrame = frame * (30 / fps);
  const drift = interpolate(Math.sin(normalizedFrame / 90), [-1, 1], [-10, 10]);

  return (
    <AbsoluteFill
      style={{
        background:
          tone === "warm"
            ? "linear-gradient(135deg, #f6efe1 0%, #fffaf0 44%, #e9f0e4 100%)"
            : "linear-gradient(135deg, #f9f4e9 0%, #fcfbf5 50%, #e9efea 100%)",
      }}
    >
      {/* 动态经纬微网格，带呼吸漂移 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.28,
          backgroundImage:
            "linear-gradient(rgba(37, 48, 43, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 48, 43, 0.09) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate(${drift}px, ${drift * 0.4}px)`,
        }}
      />

      {/* 经典地理学等高线 / 地形起伏曲线水印 */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, opacity: 0.16, pointerEvents: "none" }}
      >
        <path d="M-40 736 C 246 664, 402 810, 710 718 S 1238 470, 1970 592" fill="none" stroke="#6d7c6b" strokeWidth="2" />
        <path d="M-30 812 C 246 734, 460 910, 748 804 S 1300 540, 1980 664" fill="none" stroke="#6d7c6b" strokeWidth="2" />
        <path d="M114 218 C 384 120, 584 300, 858 204 S 1398 18, 1960 180" fill="none" stroke="#426b80" strokeWidth="1.5" />
        <path d="M96 282 C 352 194, 604 372, 884 282 S 1388 96, 1940 250" fill="none" stroke="#426b80" strokeWidth="1.5" />
        <path d="M1380 980 C 1478 810, 1656 762, 1848 826" fill="none" stroke="#a98452" strokeWidth="2" />
      </svg>

      {/* 典雅的三点径向光照氛围 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 14%, rgba(196, 143, 72, 0.18), transparent 26%), radial-gradient(circle at 82% 22%, rgba(59, 105, 121, 0.12), transparent 24%), radial-gradient(circle at 74% 86%, rgba(93, 120, 89, 0.15), transparent 30%)",
          pointerEvents: "none",
        }}
      />

      {children}
    </AbsoluteFill>
  );
};
