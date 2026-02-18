import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TypeCube from "./materialCube2";

const COLORS = [
  "#7c3aed",
  "#22c55e",
  "#0ea5e9",
  "#f97316",
  "#ec4899"
];
const HIDDEN_TYPES = ["00", "BOIBOI"];

const TypeCubeScene = ({ rows = [] }) => {
  const types = useMemo(() => {
    return [
      ...new Set(
        rows
          .map(r => r.Type)
          .filter(
            t =>
              t &&
              !HIDDEN_TYPES.includes(t.trim().toUpperCase())
          )
      )
    ];
  }, [rows]);

  // --- Layout config (SAFE FOR 220px HEIGHT)
  const CENTER_ENABLED = true;
  const INNER_RADIUS = 1.4;
  const OUTER_RADIUS = 2.5;
  const INNER_LIMIT = 7;

  const centerType = CENTER_ENABLED ? types[0] : null;
  const remainingTypes = CENTER_ENABLED ? types.slice(1) : types;

  const innerTypes = remainingTypes.slice(0, INNER_LIMIT);
  const outerTypes = remainingTypes.slice(INNER_LIMIT);

  return (
    <div
      style={{
        height: "237px",
        width: "100%",
        fontSize: "13px",
        background: "#000",
        borderRadius: "12px",
        border: "1px solid #7e22ce",
        overflow: "hidden"
      }}
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        {/* Lights */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* 🟢 CENTER CUBE */}
        {centerType && (
          <TypeCube
            key={centerType}
            label={centerType}
            color={COLORS[0]}
            position={[0, 0, 0]}
          />
        )}

        {/* 🔵 INNER CIRCLE */}
        {innerTypes.map((type, index) => {
          const angle = (2 * Math.PI * index) / innerTypes.length;
          return (
            <TypeCube
              key={type}
              label={type}
              color={COLORS[(index + 1) % COLORS.length]}
              position={[
                Math.cos(angle) * INNER_RADIUS,
                Math.sin(angle) * INNER_RADIUS,
                0
              ]}
              
            />
          );
        })}

        {/* 🟣 OUTER CIRCLE */}
        {outerTypes.map((type, index) => {
          const angle = (2 * Math.PI * index) / outerTypes.length;
          return (
            <TypeCube
              key={type}
              label={type}
              color={COLORS[(index + innerTypes.length + 1) % COLORS.length]}
              position={[
                Math.cos(angle) * OUTER_RADIUS,
                Math.sin(angle) * OUTER_RADIUS,
                0
              ]}
            />
          );
        })}

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate
        />
      </Canvas>
    </div>
  );
};

export default TypeCubeScene;
