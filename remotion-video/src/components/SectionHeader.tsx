import React from "react";

interface SectionHeaderProps {
  badge: string;
  badgeColor?: string;
  badgeBg?: string;
  title: string;
  subtitle: string;
  titleOpacity?: number;
  titleY?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeColor = "#1D4ED8",
  badgeBg = "#EFF6FF",
  title,
  subtitle,
  titleOpacity = 1,
  titleY = 0,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        marginBottom: "36px",
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
      }}
    >
      {/* Eyebrow Badge */}
      <div
        style={{
          padding: "8px 26px",
          borderRadius: "999px",
          backgroundColor: badgeBg,
          border: `1.5px solid ${badgeColor}33`,
          color: badgeColor,
          fontSize: "30px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          marginBottom: "16px",
          whiteSpace: "nowrap",
        }}
      >
        {badge}
      </div>

      {/* Hero Title */}
      <h1
        style={{
          fontSize: "88px",
          fontWeight: 800,
          color: "#0F172A",
          margin: "0 0 16px 0",
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "32px",
          fontWeight: 500,
          color: "#64748B",
          margin: 0,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};
