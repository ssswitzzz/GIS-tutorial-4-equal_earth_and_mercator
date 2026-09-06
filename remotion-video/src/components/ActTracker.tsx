import React from "react";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

interface ActTrackerProps {
  currentAct: number; // 1, 2, 3, 4
}

export const ActTracker: React.FC<ActTrackerProps> = ({ currentAct }) => {
  const acts = [
    { id: 1, label: "01. 完美假想" },
    { id: 2, label: "02. 绝妙定理" },
    { id: 3, label: "03. 橘皮悖论" },
    { id: 4, label: "04. 主动偏见" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 34,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        zIndex: 50,
      }}
    >
      {acts.map((act) => {
        const isActive = act.id === currentAct;
        return (
          <div
            key={act.id}
            style={{
              padding: "6px 20px",
              borderRadius: 999,
              backgroundColor: isActive ? "#26332e" : "rgba(255, 252, 244, 0.85)",
              color: isActive ? "#fcfbf7" : "#6f7368",
              border: isActive ? "1.5px solid #26332e" : "1px solid rgba(47, 55, 49, 0.18)",
              fontFamily: SERIF_STACK,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.5,
              boxShadow: isActive
                ? "0 8px 22px rgba(38, 51, 46, 0.22)"
                : "0 2px 8px rgba(0, 0, 0, 0.03)",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: isActive ? "#5b806f" : "#9ba098",
              }}
            />
            {act.label}
          </div>
        );
      })}
    </div>
  );
};
