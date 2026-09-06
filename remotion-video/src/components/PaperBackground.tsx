import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const PaperBackground: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();

  // Very subtle floating motion for the background grid
  const offsetX = (frame * 0.15) % 80;
  const offsetY = (frame * 0.1) % 80;

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
      {/* Dynamic drifting grid lines */}
      <div
        style={{
          position: "absolute",
          inset: "-100px",
          backgroundImage: `
            linear-gradient(to right, rgba(203, 213, 225, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          pointerEvents: "none",
        }}
      />

      {/* Warm paper vignette and radial lighting */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.8) 0%, rgba(253, 251, 247, 0.2) 60%, rgba(241, 245, 249, 0.7) 100%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Ambient subtle cartographic rings watermark in corner */}
      <svg
        style={{
          position: "absolute",
          right: "-120px",
          top: "-120px",
          width: "600px",
          height: "600px",
          opacity: 0.12,
          pointerEvents: "none",
        }}
        viewBox="0 0 600 600"
      >
        <circle cx="300" cy="300" r="100" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="300" cy="300" r="180" fill="none" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="300" cy="300" r="260" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="8 8" />
        <line x1="0" y1="300" x2="600" y2="300" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="300" y1="0" x2="300" y2="600" stroke="#1E293B" strokeWidth="1.5" />
      </svg>

      {children}
    </AbsoluteFill>
  );
};
