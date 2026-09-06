import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KaTeXFormula } from "./KaTeXFormula";

export const TissotTrilemma: React.FC<{ progressFrame: number }> = ({
  progressFrame,
}) => {
  const { fps } = useVideoConfig();

  const card1Spring = spring({
    frame: progressFrame,
    fps,
    config: { damping: 18, stiffness: 55 },
  });

  const card2Spring = spring({
    frame: progressFrame - 20,
    fps,
    config: { damping: 18, stiffness: 55 },
  });

  const card3Spring = spring({
    frame: progressFrame - 40,
    fps,
    config: { damping: 18, stiffness: 55 },
  });

  const concludeSpring = spring({
    frame: progressFrame - 70,
    fps,
    config: { damping: 18, stiffness: 55 },
  });

  // Pulse oscillation for indicatrices
  const pulse = Math.sin((progressFrame / 30) * Math.PI);

  const cards = [
    {
      title: "01 · 保形状（等角）",
      color: "#1D4ED8",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      springVal: card1Spring,
      formula: "\\mathrm{d}s^2 = m^2(\\mathrm{d}x^2 + \\mathrm{d}y^2)",
      desc: "局部任意方向伸缩率严格相等，轮廓不歪。",
      cost: "代价：纬度越高面积急剧膨胀，两极趋向无穷。",
      renderVisual: () => (
        <svg width="180" height="90" viewBox="0 0 180 90">
          <circle cx="50" cy="42" r="18" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2.5" />
          <circle
            cx="130"
            cy="42"
            r={28 + pulse * 3}
            fill="#BFDBFE"
            stroke="#1D4ED8"
            strokeWidth="2.5"
          />
          <text x="50" y="80" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="bold">赤道正圆</text>
          <text x="130" y="80" textAnchor="middle" fill="#1D4ED8" fontSize="13" fontWeight="bold">高纬膨胀</text>
        </svg>
      ),
    },
    {
      title: "02 · 保面积（等积）",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      springVal: card2Spring,
      formula: "a \\cdot b = 1 \\quad (S = \\text{常数})",
      desc: "横向拉长多少，纵向就必须被同比例狠命压瘪。",
      cost: "代价：大陆轮廓被严重剪切挤压，形状惨遭破坏。",
      renderVisual: () => (
        <svg width="180" height="90" viewBox="0 0 180 90">
          <circle cx="50" cy="42" r="20" fill="#D1FAE5" stroke="#059669" strokeWidth="2.5" />
          <ellipse
            cx="130"
            cy="42"
            rx={32 + pulse * 2.5}
            ry={12.5 - pulse * 1.2}
            fill="#A7F3D0"
            stroke="#059669"
            strokeWidth="2.5"
          />
          <text x="50" y="80" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="bold">球面对称</text>
          <text x="130" y="80" textAnchor="middle" fill="#059669" fontSize="13" fontWeight="bold">被压扁的椭圆</text>
        </svg>
      ),
    },
    {
      title: "03 · 保距离（等距）",
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
      springVal: card3Spring,
      formula: "\\Delta s = r \\quad (\\text{单点向外})",
      desc: "仅能保以某单点向外辐射、或特定几条线上的真实距离。",
      cost: "代价：绝不可能保全图任意两点间距离，横向失真。",
      renderVisual: () => (
        <svg width="180" height="90" viewBox="0 0 180 90">
          <circle cx="90" cy="42" r="5" fill="#D97706" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
            const rad = (ang * Math.PI) / 180;
            const x2 = 90 + Math.cos(rad) * 35;
            const y2 = 42 + Math.sin(rad) * 35;
            return (
              <line
                key={i}
                x1="90"
                y1="42"
                x2={x2}
                y2={y2}
                stroke="#D97706"
                strokeWidth="1.8"
                strokeDasharray={i % 2 === 0 ? "none" : "3 3"}
              />
            );
          })}
          <circle cx="90" cy="42" r="35" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="90" y="84" textAnchor="middle" fill="#D97706" fontSize="13" fontWeight="bold">单中心辐射等距</text>
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: "20px",
      }}
    >
      {/* 3 Side-by-side Choice Cards */}
      <div style={{ display: "flex", gap: "28px", justifyContent: "center" }}>
        {cards.map((c, i) => {
          const y = interpolate(c.springVal, [0, 1], [35, 0]);
          const op = interpolate(c.springVal, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                width: "460px",
                padding: "26px 24px",
                backgroundColor: "rgba(255, 255, 255, 0.96)",
                borderRadius: "20px",
                border: `2px solid ${c.border}`,
                boxShadow: "0 18px 32px -8px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: op,
                transform: `translateY(${y}px)`,
              }}
            >
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: c.color,
                  marginBottom: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                {c.title}
              </div>

              {/* Indicatrix Graphic */}
              <div style={{ margin: "6px 0" }}>{c.renderVisual()}</div>

              {/* KaTeX Formula */}
              <div style={{ marginBottom: "10px", textAlign: "center" }}>
                <KaTeXFormula math={c.formula} fontSize={27} color={c.color} />
              </div>

              <div
                style={{
                  fontSize: "30px",
                  color: "#334155",
                  marginBottom: "10px",
                  textAlign: "center",
                  lineHeight: 1.35,
                }}
              >
                {c.desc}
              </div>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#BE123C",
                  textAlign: "center",
                  lineHeight: 1.3,
                  backgroundColor: "#FFF1F2",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid #FFE4E6",
                }}
              >
                {c.cost}
              </div>
            </div>
          );
        })}
      </div>

      {/* Concluding Philosophy Banner */}
      {concludeSpring > 0.01 && (
        <div
          style={{
            width: "1420px",
            padding: "16px 36px",
            backgroundColor: "#0F172A",
            borderRadius: "16px",
            boxShadow: "0 15px 35px -8px rgba(15, 23, 42, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: interpolate(concludeSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(concludeSpring, [0, 1], [20, 0])}px)`,
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#F8FAFC",
              letterSpacing: "0.04em",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            “每一张地图的绘制，本质上都是制图师权衡利弊后，主动选择的偏见。”
          </div>
        </div>
      )}
    </div>
  );
};

