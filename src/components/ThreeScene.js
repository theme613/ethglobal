"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Circle } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const DetailedCoin = () => {
  const groupRef = useRef();
  const edgeRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Rim/Edge - Metallic Silver */}
      <mesh ref={edgeRef} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[1, 1, 0.1, 64]} />
        <meshStandardMaterial
          color="#E5E4E2"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Front Face - Muted Gold */}
      <Circle args={[0.95, 64]} position-z={0.051}>
        <meshStandardMaterial
          color="#a49264"
          metalness={0.8}
          roughness={0.2}
        />
      </Circle>
      {/* Back Face - Muted Gold */}
      <Circle args={[0.95, 64]} position-z={-0.051} rotation-y={Math.PI}>
        <meshStandardMaterial
          color="#a49264"
          metalness={0.8}
          roughness={0.2}
        />
      </Circle>
    </group>
  );
};

export const ThreeScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        {/* Centered highlight */}
        <directionalLight
          position={[0, 3, 5]}
          intensity={1.5}
          color="white"
        />
        {/* Symmetrical side glows */}
        <pointLight position={[-4, 0, 0]} intensity={1.5} color="#008080" />
        <pointLight position={[4, 0, 0]} intensity={1.5} color="#005f5f" />

        <DetailedCoin />
        <OrbitControls enableZoom={false} enablePan={false} />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            height={300}
            intensity={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
