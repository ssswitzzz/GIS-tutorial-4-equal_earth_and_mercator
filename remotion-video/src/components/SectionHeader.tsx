import React from "react";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

export const TopHeader: React.FC<{ currentActTitle?: string }> = ({
  currentActTitle = "高斯绝妙定理与制图偏见",
}) => (
  <>
    <div
      style={{
        position: "absolute",
        top: 36,
        left: 58,
        color: "#315f6d",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 40,
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: 999, background: "#5b806f" }} />
      <span style={{ fontFamily: MONO_STACK, fontSize: 17, letterSpacing: 1.2 }}>
        MATHEMATICAL CARTOGRAPHY /{" "}
      </span>
      <span style={{ fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700, color: "#29342f" }}>
        {currentActTitle}
      </span>
    </div>
    <div
      style={{
        position: "absolute",
        top: 36,
        right: 58,
        fontFamily: MONO_STACK,
        fontSize: 14,
        color: "#6f7368",
        zIndex: 40,
        letterSpacing: 1.1,
      }}
    >
      DIFFERENTIAL GEOMETRY & PROJECTION
    </div>
  </>
);

export const SectionTitle: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  y?: number;
  color?: string;
  opacity?: number;
  underlineProgress?: number;
}> = ({
  eyebrow,
  title,
  subtitle,
  y = 75,
  color = "#4f745d",
  opacity = 1,
  underlineProgress = 1,
}) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: "50%",
      transform: "translateX(-50%)",
      width: 1500,
      textAlign: "center",
      zIndex: 30,
      opacity,
    }}
  >
    <div
      style={{
        fontFamily: MONO_STACK,
        fontSize: 16,
        color,
        marginBottom: 12,
        fontWeight: 700,
        letterSpacing: 1.5,
      }}
    >
      {eyebrow}
    </div>
    <div
      style={{
        fontSize: 56,
        lineHeight: 1.14,
        fontWeight: 700,
        color: "#26332e",
        fontFamily: SERIF_STACK,
        letterSpacing: -0.5,
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontFamily: SERIF_STACK,
        fontSize: 22,
        color: "#6f7368",
        marginTop: 14,
        lineHeight: 1.4,
      }}
    >
      {subtitle}
    </div>
    <div
      style={{
        width: 500 * underlineProgress,
        height: 3.5,
        margin: "18px auto 0",
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        borderRadius: 2,
      }}
    />
  </div>
);
