import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Float } from "./Float";
import { FocusBeam } from "./FocusBeam";
import { DrawnStamp } from "./DrawnStamp";
import { KaTeXFormula } from "./KaTeXFormula";
import { Packet } from "./Packet";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// Pure SVG 3D Rotating Globe with Orthographic Graticule & Land Silhouettes
const RotatingGlobe3D: React.FC<{ size?: number }> = ({ size = 220 }) => {
  const frame = useCurrentFrame();
  const rotation = (frame * 0.6) % 360; // deg
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;

  // 12 Longitude lines rotating
  const meridians = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  // Latitudes
  const parallels = [-60, -30, 0, 30, 60];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <clipPath id="globeClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <radialGradient id="oceanGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e2edf5" />
          <stop offset="70%" stopColor="#c8dbe8" />
          <stop offset="100%" stopColor="#a9c4d6" />
        </radialGradient>
        <radialGradient id="sphereShade" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* Ocean Base */}
      <circle cx={cx} cy={cy} r={r} fill="url(#oceanGrad)" stroke="#315f6d" strokeWidth="2.5" />

      {/* Clipped Graticule & Continents */}
      <g clipPath="url(#globeClip)">
        {/* Parallels (Latitudes) */}
        {parallels.map((lat) => {
          const latRad = (lat * Math.PI) / 180;
          const y = cy - r * Math.sin(latRad);
          const rx = r * Math.cos(latRad);
          const ry = rx * 0.28; // tilt
          return (
            <ellipse
              key={lat}
              cx={cx}
              cy={y}
              rx={rx}
              ry={ry}
              fill="none"
              stroke="#608b9e"
              strokeWidth={lat === 0 ? 1.8 : 1}
              strokeDasharray={lat === 0 ? undefined : "3 3"}
              opacity={0.65}
            />
          );
        })}

        {/* Rotating Meridians (Longitudes) */}
        {meridians.map((lon) => {
          const effectiveLon = (lon + rotation) % 360;
          const isFront = effectiveLon >= 270 || effectiveLon <= 90;
          if (!isFront) return null;

          const lonRad = (effectiveLon * Math.PI) / 180;
          const rx = Math.abs(r * Math.sin(lonRad));

          return (
            <ellipse
              key={lon}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={r}
              fill="none"
              stroke="#608b9e"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.7}
            />
          );
        })}

        {/* Rotating Continent Blob Silhouettes (Eurasia, Africa, Americas) */}
        {[
          { baseLon: 20, baseLat: 10, w: 75, h: 65, color: "#4f745d" }, // Africa
          { baseLon: 60, baseLat: 45, w: 95, h: 55, color: "#4f745d" }, // Eurasia
          { baseLon: 260, baseLat: 40, w: 80, h: 50, color: "#4f745d" }, // N. America
          { baseLon: 290, baseLat: -15, w: 60, h: 70, color: "#4f745d" }, // S. America
          { baseLon: 135, baseLat: -25, w: 45, h: 35, color: "#4f745d" }, // Australia
        ].map((c, i) => {
          const lonPos = (c.baseLon + rotation) % 360;
          const isFront = lonPos >= 270 || lonPos <= 90;
          if (!isFront) return null;

          const x = cx + r * Math.sin((lonPos * Math.PI) / 180) * Math.cos((c.baseLat * Math.PI) / 180);
          const y = cy - r * Math.sin((c.baseLat * Math.PI) / 180);

          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx={c.w * 0.45 * Math.cos((lonPos * Math.PI) / 180)}
              ry={c.h * 0.45}
              fill={c.color}
              opacity={0.45}
            />
          );
        })}

        {/* Dynamic Pulsing Geodesic Arc between A (Beijing) and B (Paris) */}
        {(() => {
          const pA_lon = (116 + rotation) % 360;
          const pB_lon = (2 + rotation) % 360;
          const isA_front = pA_lon >= 270 || pA_lon <= 90;
          const isB_front = pB_lon >= 270 || pB_lon <= 90;

          if (isA_front && isB_front) {
            const xA = cx + r * Math.sin((pA_lon * Math.PI) / 180) * Math.cos((40 * Math.PI) / 180);
            const yA = cy - r * Math.sin((40 * Math.PI) / 180);
            const xB = cx + r * Math.sin((pB_lon * Math.PI) / 180) * Math.cos((48 * Math.PI) / 180);
            const yB = cy - r * Math.sin((48 * Math.PI) / 180);
            const midX = (xA + xB) / 2;
            const midY = (yA + yB) / 2 - 25;

            return (
              <g>
                <path
                  d={`M ${xA} ${yA} Q ${midX} ${midY} ${xB} ${yB}`}
                  fill="none"
                  stroke="#c2410c"
                  strokeWidth="3.5"
                />
                <circle cx={xA} cy={yA} r="6" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                <text x={xA + 8} y={yA - 6} fill="#059669" fontFamily={MONO_STACK} fontSize="12" fontWeight="bold">
                  A
                </text>
                <circle cx={xB} cy={yB} r="6" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                <text x={xB - 16} y={yB - 6} fill="#059669" fontFamily={MONO_STACK} fontSize="12" fontWeight="bold">
                  B
                </text>
              </g>
            );
          }
          return null;
        })()}

        {/* 3D Sphere Shading Lighting */}
        <circle cx={cx} cy={cy} r={r} fill="url(#sphereShade)" />
      </g>
    </svg>
  );
};

export const InteractiveSphereMap: React.FC<{
  sceneProgress: number; // 0 to 1
}> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const globeSpring = spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 75 } });
  const mapSpring = spring({ frame: frame - 45, fps, config: { damping: 18, stiffness: 75 } });
  const stampSpring = spring({ frame: frame - 280, fps, config: { damping: 11, stiffness: 130 } });
  const beamProgress = interpolate(frame, [180, 290], [0, 1], clamp);

  const ringRotation = frame * 0.35;
  const isStamped = frame >= 285;

  // Packet animation from Globe to Map
  const packetProgress = interpolate(frame, [120, 240], [0, 1], clamp);
  const packetOpacity = interpolate(frame, [115, 130, 235, 250], [0, 1, 1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 240,
        left: "50%",
        transform: "translateX(-50%)",
        width: 1600,
        height: 600,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* 1. Left Card: Sphere Surface (Reality) */}
      <Float speed={55} amplitude={5}>
        <div
          style={{
            width: 720,
            height: 530,
            background: "rgba(255, 252, 244, 0.9)",
            border: "1.5px solid rgba(47, 55, 49, 0.16)",
            borderRadius: 12,
            boxShadow: "0 24px 65px rgba(55, 48, 38, 0.12)",
            padding: "30px 36px",
            boxSizing: "border-box",
            position: "relative",
            transform: `scale(${interpolate(globeSpring, [0, 1], [0.88, 1])})`,
            opacity: interpolate(globeSpring, [0, 1], [0, 1]),
            overflow: "hidden",
          }}
        >
          {/* Card Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#7a766c", letterSpacing: 1 }}>
              REALITY · SPHERE SPACE S²
            </div>
            <div
              style={{
                fontFamily: SERIF_STACK,
                fontSize: 14,
                color: "#315f6d",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#315f6d" }} />
              现实三维正球体
            </div>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 32,
              fontWeight: 700,
              color: "#26332e",
              marginTop: 10,
            }}
          >
            球面真实大圆测地距
          </div>

          {/* 3D Globe with Rotating Graticules */}
          <div
            style={{
              position: "relative",
              width: 320,
              height: 320,
              margin: "12px auto 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Outer Astrolabe Rings */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "1.5px dashed rgba(49, 95, 109, 0.3)",
                borderRadius: "50%",
                transform: `rotate(${ringRotation}deg)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 22,
                border: "1px solid rgba(167, 119, 72, 0.25)",
                borderRadius: "50%",
                transform: `rotate(${-ringRotation * 1.4}deg)`,
              }}
            />

            {/* Rotating 3D Globe */}
            <div style={{ filter: "drop-shadow(0 18px 30px rgba(49, 95, 109, 0.25))" }}>
              <RotatingGlobe3D size={230} />
            </div>
          </div>

          {/* Metric Readout */}
          <div
            style={{
              marginTop: 10,
              padding: "12px 18px",
              background: "rgba(49, 95, 109, 0.08)",
              borderRadius: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: SERIF_STACK, fontSize: 16, color: "#315f6d", fontWeight: 700 }}>
              点 A 至 点 B 大圆测地距
            </span>
            <span style={{ fontFamily: MONO_STACK, fontSize: 24, fontWeight: 800, color: "#26332e" }}>
              d_S(A, B) = 8,216 km
            </span>
          </div>
        </div>
      </Float>

      {/* Packet flow connecting Earth to Planar Map */}
      <Packet
        progress={packetProgress}
        opacity={packetOpacity}
        label="保距投影映射"
        startX={750}
        endX={970}
        y={280}
        color="#315f6d"
      />

      {/* 2. Right Card: Planar Map (The Impossible Hypothesis) */}
      <Float speed={50} amplitude={5} delay={15}>
        <div
          style={{
            width: 720,
            height: 530,
            background: "rgba(255, 252, 244, 0.9)",
            border: `1.5px solid ${isStamped ? "rgba(158, 42, 43, 0.35)" : "rgba(47, 55, 49, 0.16)"}`,
            borderRadius: 12,
            boxShadow: isStamped
              ? "0 28px 75px rgba(158, 42, 43, 0.16)"
              : "0 24px 65px rgba(55, 48, 38, 0.12)",
            padding: "30px 36px",
            boxSizing: "border-box",
            position: "relative",
            transform: `scale(${interpolate(mapSpring, [0, 1], [0.88, 1])})`,
            opacity: interpolate(mapSpring, [0, 1], [0, 1]),
            overflow: "hidden",
          }}
        >
          {/* Card Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#7a766c", letterSpacing: 1 }}>
              HYPOTHESIS · PLANAR MAP R²
            </div>
            <div
              style={{
                fontFamily: SERIF_STACK,
                fontSize: 14,
                color: isStamped ? "#9e2a2b" : "#a77748",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: isStamped ? "#9e2a2b" : "#a77748",
                }}
              />
              假想平面世界地图
            </div>
          </div>

          <div
            style={{
              fontFamily: SERIF_STACK,
              fontSize: 32,
              fontWeight: 700,
              color: "#26332e",
              marginTop: 10,
            }}
          >
            全局严格等比例距离？
          </div>

          {/* Formula Callout */}
          <div
            style={{
              marginTop: 18,
              padding: "16px 20px",
              background: "rgba(247, 244, 235, 0.9)",
              border: "1px dashed rgba(47, 55, 49, 0.2)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <KaTeXFormula
              math="d_M(A, B) \equiv c \cdot d_S(A, B) \quad (\forall A, B \in S^2)"
              fontSize={24}
              color="#26332e"
            />
            <div style={{ fontFamily: SERIF_STACK, fontSize: 14, color: "#6f7368", marginTop: 8 }}>
              等距同构（Global Isometry）：全图任意两点距离绝对保真
            </div>
          </div>

          {/* Distorted Planar Grid Visual */}
          <div
            style={{
              marginTop: 20,
              height: 180,
              border: "1px solid rgba(47, 55, 49, 0.15)",
              borderRadius: 8,
              background:
                "linear-gradient(rgba(47, 55, 49, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 55, 49, 0.05) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Distorted distance lines */}
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <line x1="120" y1="120" x2="480" y2="60" stroke="#9e2a2b" strokeWidth="2.5" strokeDasharray="6 4" />
              <circle cx="120" cy="120" r="6" fill="#9e2a2b" />
              <circle cx="480" cy="60" r="6" fill="#9e2a2b" />
              <text x="300" y="80" fill="#9e2a2b" fontFamily={MONO_STACK} fontSize="14" fontWeight="800">
                比例剧烈失真 ×1.48 ~ ×4.2
              </text>
            </svg>
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 18,
                fontFamily: SERIF_STACK,
                fontSize: 14,
                color: "#8a8b80",
              }}
            >
              高纬经线被撕扯拉长，各方向拉伸率无法恒定
            </div>
          </div>

          {/* Focus Beam Sweep */}
          <FocusBeam progress={beamProgress} tone="red" />

          {/* Physical Drawn Stamp: MATHEMATICAL IMPOSSIBILITY */}
          {isStamped && (
            <DrawnStamp
              progress={stampSpring}
              tone="red"
              title="MATHEMATICALLY IMPOSSIBLE"
              label="数学上绝不存在"
            />
          )}
        </div>
      </Float>
    </div>
  );
};
