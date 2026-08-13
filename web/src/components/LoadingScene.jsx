import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Environment, OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

const LOGO_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#c67139"/>
      <path d="M52 26c-9 0-15 5-15 12 0 6 4 9 11 11l4 1c5 1 6 3 6 5 0 3-3 5-8 5-6 0-10-3-11-7l-9 3c2 8 9 13 19 13 10 0 17-5 17-13 0-6-4-10-12-12l-4-1c-4-1-6-2-6-5 0-3 3-4 7-4 5 0 8 2 9 6l9-3c-2-7-8-11-17-11z" fill="#f9f4ed"/>
      <rect x="62" y="68" width="8" height="14" rx="2.5" fill="#ecd3c0"/>
      <rect x="74" y="60" width="8" height="22" rx="2.5" fill="#f4e2d5"/>
      <rect x="86" y="52" width="8" height="30" rx="2.5" fill="#f9f4ed"/>
    </svg>`
  );

function LogoTile() {
  const meshRef = useRef();
  const texture = useTexture(LOGO_SVG);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);

  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: "#c67139", roughness: 0.35, metalness: 0.15 });
    const front = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3, metalness: 0.1 });
    const back = new THREE.MeshStandardMaterial({ color: "#8c491a", roughness: 0.4, metalness: 0.1 });
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    return [side, side, side, side, front, back];
  }, [texture]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.6}>
      <mesh ref={meshRef} material={materials} castShadow receiveShadow>
        <boxGeometry args={[2.3, 2.3, 0.42]} />
      </mesh>
    </Float>
  );
}

export default function LoadingScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.6, 5.2], fov: 38 }}
      dpr={[1, 2]}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#f5ead8"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, -2, -2]} intensity={0.3} color="#ffdcc0" />
      <Suspense fallback={null}>
        <LogoTile />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0} />
    </Canvas>
  );
}
