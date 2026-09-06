import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const OrangePeelDiagram: React.FC<{ progressFrame: number }> = ({
  progressFrame,
}) => {
  const { fps } = useVideoConfig();

  const animSpring = spring({
    frame: progressFrame,
    fps,
    config: { damping: 18, stiffness: 50 },
  });

  const spread = interpolate(animSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "1440px",
          padding: "40px 52px",
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          borderRadius: "24px",
          border: "2px solid #E2E8F0",
          boxShadow: "0 25px 45px -12px rgba(0, 0, 0, 0.06)",
          display: "flex",
          gap: "48px",
          alignItems: "center",
        }}
      >
        {/* SVG Orange Peel Gores */}
        <div style={{ flex: "0 0 500px", display: "flex", justifyContent: "center" }}>
          <svg width="480" height="340" viewBox="0 0 480 340">
            <defs>
              <linearGradient id="peelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>

            {/* Table surface */}
            <rect x="20" y="310" width="440" height="8" rx="4" fill="#CBD5E1" />

            {/* Render 6 sinusoidal gores with dynamic spreading gaps */}
            {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((idx, i) => {
              const baseCenter = 240 + idx * 70 * spread;
              const topY = 50 + (1 - spread) * 20;
              const botY = 300;
              const midY = 175;
              const halfW = 30;

              return (
                <g key={i}>
                  {/* Gore Petal */}
                  <path
                    d={`
                      M ${baseCenter} ${topY}
                      Q ${baseCenter + halfW} ${midY}, ${baseCenter + halfW * 0.8} ${botY}
                      L ${baseCenter - halfW * 0.8} ${botY}
                      Q ${baseCenter - halfW} ${midY}, ${baseCenter} ${topY}
                      Z
                    `}
                    fill="url(#peelGrad)"
                    stroke="#C2410C"
                    strokeWidth="2"
                    opacity={0.9}
                  />

                  {/* Tear Gap Highlight when spread > 0.3 */}
                  {spread > 0.3 && i < 5 && (
                    <line
                      x1={baseCenter + halfW * 0.85}
                      y1={botY - 20}
                      x2={baseCenter + halfW * 0.85 + 15 * spread}
                      y2={topY + 40}
                      stroke="#BE123C"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                    />
                  )}
                </g>
              );
            })}

            {/* Callout arrow pointing to gap */}
            {spread > 0.4 && (
              <g>
                <path d="M 285 110 L 270 145" stroke="#BE123C" strokeWidth="2.5" />
                <text x="295" y="105" fill="#BE123C" fontSize="18" fontWeight="bold">
                  必然撕裂的几何缝隙
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Narrative & Intuition Cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#C2410C",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            不可压平的物理定律
          </div>

          <div
            style={{
              fontSize: "30px",
              lineHeight: 1.45,
              color: "#334155",
              whiteSpace: "nowrap",
            }}
          >
            就像剥开橘子皮一样：
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                backgroundColor: "#FFF7ED",
                padding: "16px 24px",
                borderRadius: "14px",
                border: "1.5px solid #FFEDD5",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#EA580C",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: "30px", color: "#9A3412", fontWeight: 700, whiteSpace: "nowrap" }}>
                若不撕裂：强行压平则四周边缘必严重起皱重叠
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                backgroundColor: "#FEF2F2",
                padding: "16px 24px",
                borderRadius: "14px",
                border: "1.5px solid #FEE2E2",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#BE123C",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: "30px", color: "#9F1239", fontWeight: 700, whiteSpace: "nowrap" }}>
                若完全展平：球壳必被撕裂开无数道放射状缺口
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
