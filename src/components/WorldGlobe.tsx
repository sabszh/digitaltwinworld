"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars, useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { locations } from "@/data/locations";
import type { GeneratedDilemma } from "@/types/world2046";

function latLngToVector3(lat: number, lng: number, radius = 2.05) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function rotationForLatLng(lat: number, lng: number) {
  const localPoint = latLngToVector3(lat, lng, 1).normalize();
  return new THREE.Quaternion().setFromUnitVectors(localPoint, new THREE.Vector3(0, 0, 1));
}

function CameraRig({
  active,
  zoomed,
  introProgressRef,
}: {
  active?: GeneratedDilemma;
  zoomed: boolean;
  introProgressRef?: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (introProgressRef && !active && !zoomed) {
      const p = Math.min(Math.max(introProgressRef.current, 0), 1);
      const targetZ = 5.15 - p * 2.35;
      camera.position.lerp(new THREE.Vector3(0, 0, targetZ), 0.08);
      return;
    }
    const targetZ = active && zoomed ? 3.6 : zoomed ? 4.2 : 5.15;
    camera.position.lerp(new THREE.Vector3(0, 0, targetZ), 0.055);
  });

  return null;
}

function GlobeMesh({ active, introProgressRef }: { active?: GeneratedDilemma; introProgressRef?: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const activeVector = active ? latLngToVector3(active.marker.lat, active.marker.lng, 2.18) : undefined;
  const activeLabel = active ? active.exactPlace?.name ?? active.city : undefined;
  const markerPositions = useMemo(() => locations.map((location) => latLngToVector3(location.lat, location.lng, 2.08)), []);
  const [earthTexture, specularTexture, cloudTexture] = useTexture([
    "/textures/earth_atmos_2048.jpg",
    "/textures/earth_specular_2048.jpg",
    "/textures/earth_clouds_1024.png",
  ]);
  const targetQuaternion = useMemo(() => {
    if (!active) return undefined;
    return rotationForLatLng(active.marker.lat, active.marker.lng);
  }, [active]);

  useFrame((state) => {
    if (!group.current) return;
    if (targetQuaternion) {
      group.current.quaternion.slerp(targetQuaternion, 0.055);
    } else {
      const progress = introProgressRef ? Math.min(Math.max(introProgressRef.current, 0), 1) : 1;
      const transitionInProgress = Boolean(introProgressRef && progress < 0.999);
      group.current.rotation.y += transitionInProgress ? 0.0012 + progress * 0.012 : 0.0012;
      const naturalTilt = Math.sin(state.clock.elapsedTime * 0.2) * 0.04;
      const targetTilt = transitionInProgress ? naturalTilt - progress * 0.42 : naturalTilt;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetTilt, 0.08);
    }
    if (clouds.current) clouds.current.rotation.y += 0.0007;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[2, 96, 96]} />
        <meshPhongMaterial
          map={earthTexture}
          specularMap={specularTexture}
          specular={new THREE.Color("#7fb7c8")}
          shininess={9}
          emissive={new THREE.Color("#041526")}
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.018, 96, 96]} />
        <meshBasicMaterial color="#9eeaff" transparent opacity={0.075} side={THREE.FrontSide} />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[2.026, 96, 96]} />
        <meshLambertMaterial map={cloudTexture} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.035, 64, 64]} />
        <meshBasicMaterial color="#9eeaff" wireframe transparent opacity={0.035} />
      </mesh>
      {markerPositions.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshBasicMaterial color="#d7fbff" transparent opacity={0.55} />
        </mesh>
      ))}
      {activeVector && (
        <group position={activeVector}>
          <mesh>
            <sphereGeometry args={[0.065, 20, 20]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshBasicMaterial color="#ffd166" transparent opacity={0.18} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.18, 0.26, 36]} />
            <meshBasicMaterial color="#ffd166" transparent opacity={0.48} side={THREE.DoubleSide} />
          </mesh>
          <Html center distanceFactor={8} transform occlude>
            <div className="surface-panel rounded-full px-3 py-1.5 text-xs font-medium text-[var(--text)]">
              {activeLabel}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

export function WorldGlobe({
  active,
  zoomed = false,
  introProgressRef,
}: {
  active?: GeneratedDilemma;
  zoomed?: boolean;
  introProgressRef?: React.MutableRefObject<number>;
}) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, zoomed ? 4.2 : 5.15], fov: 45 }}>
        <color attach="background" args={["#020b16"]} />
        <ambientLight intensity={0.32} />
        <directionalLight position={[4.5, 2.2, 5]} intensity={4.2} color="#ffffff" />
        <pointLight position={[-3, -2, 2]} intensity={1.2} color="#ffd166" />
        <Stars radius={70} depth={35} count={1100} factor={3} saturation={0} fade speed={0.35} />
        <GlobeMesh active={active} introProgressRef={introProgressRef} />
        <CameraRig active={active} zoomed={zoomed} introProgressRef={introProgressRef} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 scanline bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.08),transparent_34%)]" />
      {active && (
        <div className="surface-panel pointer-events-none absolute right-5 top-5 z-10 hidden rounded-xl px-3 py-2 text-right md:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--faint)]">Lokation</p>
          <p className="mt-1 text-sm font-medium text-[var(--text)]">{active.exactPlace?.name ?? `${active.city}, ${active.country}`}</p>
          <p className="text-sm text-[var(--muted)]">{active.marker.lat.toFixed(3)}, {active.marker.lng.toFixed(3)}</p>
        </div>
      )}
    </div>
  );
}
