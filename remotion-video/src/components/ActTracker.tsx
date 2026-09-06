import React from "react";

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
        bottom: "48px",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "24px",
        zIndex: 50,
      }}
    >
      {acts.map((act) => {
        const isActive = act.id === currentAct;
        return (
          <div
            key={act.id}
            style={{
              padding: "10px 32px",
              borderRadius: "999px",
              backgroundColor: isActive ? "#1E293B" : "rgba(255, 255, 255, 0.8)",
              color: isActive ? "#FFFFFF" : "#64748B",
              border: isActive ? "2px solid #1E293B" : "1.5px solid #CBD5E1",
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              boxShadow: isActive
                ? "0 10px 25px -5px rgba(30, 41, 59, 0.25)"
                : "0 4px 10px rgba(0, 0, 0, 0.03)",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            {act.label}
          </div>
        );
      })}
    </div>
  );
};
