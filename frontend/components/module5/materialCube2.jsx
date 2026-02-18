import React, { useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const TypeCube = ({ position, color, label }) => {
  const cubeRef = useRef();

  // Rotate cube on y-axis
  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += 0.01; // speed
    }
  });

  return (
    <group position={position}>
      {/* Rotating Cube */}
      <mesh ref={cubeRef}>
        <boxGeometry args={[0.40, 0.40, 0.40]} />
        <meshStandardMaterial
          color={color}
          roughness={0.45}
          metalness={0.12}
        />
      </mesh>

      {/* Label (does NOT rotate) */}
      <Text
        position={[0, -0.2, 0]}
        fontSize={0.25}
        color="#fff"
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>
    </group>
  );
};

export default TypeCube;
