"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Instances, Instance, Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Individual bits inside the 320-bit matrix structure
function BitMatrixInstances({ activeBits }: { activeBits: Set<number> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  
  // Create positions for 5 words x 64 bits = 320 bits
  const particles = useMemo(() => {
    const temp = [];
    // We try to arrange 320 bits in a 3D cylindrical or cubic formation.
    // Let's do 5 layers (Y axis) by a 8x8 grid (X/Z axes) to equal 320 blocks!
    for (let word = 0; word < 5; word++) {
      for (let x = 0; x < 8; x++) {
        for (let z = 0; z < 8; z++) {
          const index = word * 64 + (x * 8 + z);
          temp.push({
            position: [x * 1.5 - 5.25, (word - 2) * 2, z * 1.5 - 5.25] as [number, number, number],
            index
          });
        }
      }
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    // Rotate the entire cluster slowly
    ref.current.rotation.y += delta * 0.2;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <Instances
      ref={ref}
      limit={320} // 320 bits
      range={320}
    >
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial 
        roughness={0.1} 
        metalness={0.8} 
        envMapIntensity={2} 
        transparent 
        opacity={0.8} 
      />
      {particles.map((data, i) => {
        const isActive = activeBits.has(data.index);
        return (
          <Instance
            key={i}
            position={data.position}
            color={isActive ? "#3b82f6" : "#27272a"}
            scale={isActive ? 1.2 : 0.9}
          />
        );
      })}
    </Instances>
  );
}

export function ThreeCube({ bitData = [] }: { bitData?: number[] }) {
  const activeBits = useMemo(() => new Set(bitData), [bitData]);

  return (
    <div className="w-full h-full relative cursor-move">
      <Canvas camera={{ position: [15, 10, 15], fov: 45 }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[20, 20, 20]} angle={0.2} penumbra={1} intensity={2} color="#3b82f6" />
        <spotLight position={[-20, -20, -20]} angle={0.2} penumbra={1} intensity={1} color="#a855f7" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           <BitMatrixInstances activeBits={activeBits} />
        </Float>
        
        <Sparkles size={2} color="#3b82f6" scale={[20, 20, 20]} count={150} speed={0.4} opacity={0.2} />
        
        <Environment preset="city" />
        <OrbitControls makeDefault enablePan={false} maxDistance={30} minDistance={5} />
      </Canvas>
    </div>
  );
}
