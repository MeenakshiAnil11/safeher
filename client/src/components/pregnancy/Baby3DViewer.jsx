import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import "./Baby3DViewer.css";

function getTrimesterTheme(week) {
  if (week <= 12) return { color: "#f9a8d4", glow: "#f472b6" };
  if (week <= 27) return { color: "#c084fc", glow: "#8b5cf6" };
  return { color: "#2dd4bf", glow: "#14b8a6" };
}

function ProceduralBabyModel({ week = 1 }) {
  const normalizedWeek = Math.min(40, Math.max(1, Number(week) || 1));
  const growthRatio = normalizedWeek / 40;
  const growthScale = 0.5 + growthRatio * 1.05;
  const headScale = 1.15 - growthRatio * 0.35;
  const bodyStretch = 1 + growthRatio * 0.28;
  const { color, glow } = getTrimesterTheme(normalizedWeek);
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.26;
    groupRef.current.rotation.x = 0.13 + Math.cos(t * 0.28) * 0.05;
    groupRef.current.position.y = Math.sin(t * 0.9) * 0.06;
  });

  return (
    <group ref={groupRef} scale={[growthScale, growthScale, growthScale]}>
      <mesh position={[0, 0.05, 0]} scale={[0.9, 1.18 * bodyStretch, 0.82]}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial color={color} roughness={0.32} metalness={0.06} />
      </mesh>

      <mesh position={[-0.62, 0.68, 0.2]} scale={[headScale, headScale, headScale]}>
        <sphereGeometry args={[0.42, 64, 64]} />
        <meshStandardMaterial color={glow} roughness={0.28} metalness={0.08} />
      </mesh>

      <mesh position={[0.34, -0.25, 0.22]} rotation={[0.25, 0, -0.2]} scale={[0.2, 0.5, 0.2]}>
        <sphereGeometry args={[0.58, 36, 36]} />
        <meshStandardMaterial color={glow} roughness={0.33} metalness={0.04} />
      </mesh>

      <mesh position={[0.84, -0.68, 0.18]} rotation={[0.2, 0, 0.12]} scale={[0.18, 0.35, 0.18]}>
        <sphereGeometry args={[0.56, 28, 28]} />
        <meshStandardMaterial color={glow} roughness={0.34} metalness={0.04} />
      </mesh>

      <mesh position={[0.26, 0.74, 0.18]} rotation={[0.35, 0, -0.45]} scale={[0.16, 0.32, 0.16]}>
        <sphereGeometry args={[0.56, 28, 28]} />
        <meshStandardMaterial color={glow} roughness={0.34} metalness={0.04} />
      </mesh>

      <mesh position={[0, 0.05, 0]} scale={[1.32, 1.58, 1.22]}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial
          color={glow}
          transparent
          opacity={0.07}
          roughness={0.22}
          metalness={0.08}
        />
      </mesh>
    </group>
  );
}

function SceneModel({ scene, week }) {
  const preparedScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);
    clone.scale.set(1.2, 1.2, 1.2);
    clone.position.set(0, -0.4, 0);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  if (!preparedScene) return <ProceduralBabyModel week={week} />;
  return <primitive object={preparedScene} />;
}

export default function Baby3DViewer({ currentWeek = 1 }) {
  const [gltfScene, setGltfScene] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelSource, setModelSource] = useState("");
  const [loadInfo, setLoadInfo] = useState("");

  const safeWeek = Math.min(40, Math.max(1, Number(currentWeek) || 1));
  const trimesterKey = safeWeek <= 12 ? "trimester1" : safeWeek <= 27 ? "trimester2" : "trimester3";
  const modelCandidates = useMemo(
    () => [
      `/baby-models/week${safeWeek}.glb`,
      `/baby-models/week-${safeWeek}.glb`,
      `/baby-models/week${safeWeek}.gltf`,
      `/baby-models/week-${safeWeek}.gltf`,
      `/baby-models/${trimesterKey}.glb`,
      `/baby-models/${trimesterKey}.gltf`,
      "/baby-models/default.glb",
      "/baby-models/default.gltf",
    ],
    [safeWeek, trimesterKey]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadInfo("");
    setGltfScene(null);
    setModelSource(modelCandidates[0]);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(dracoLoader);

    const loadModel = async () => {
      const candidateErrors = [];
      for (const candidate of modelCandidates) {
        try {
          const gltf = await loader.loadAsync(candidate);
          if (cancelled) return;
          setGltfScene(gltf.scene || null);
          setModelSource(candidate);
          setLoadInfo("Loaded 3D model successfully.");
          setLoading(false);
          return;
        } catch (error) {
          candidateErrors.push(candidate);
        }
      }

      if (cancelled) return;
      setModelSource("procedural-adaptive");
      setLoadInfo(
        candidateErrors.length
          ? "3D asset files were not found for this week. Showing adaptive interactive growth model."
          : "Showing adaptive interactive growth model."
      );
      setLoading(false);
    };

    loadModel();

    return () => {
      cancelled = true;
      dracoLoader.dispose();
    };
  }, [modelCandidates]);

  return (
    <section className="baby-3d-viewer-card">
      <div className="baby-3d-viewer-head">
        <h3>🧸 Baby 3D Growth Viewer</h3>
        <p>Week {safeWeek} interactive model</p>
      </div>

      <div className="baby-3d-canvas-wrap">
        <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }} shadows>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 6, 5]} intensity={1.1} castShadow />
          <pointLight position={[-4, -2, 3]} intensity={0.35} />
          <group position={[0, 0.2, 0]}>
            <SceneModel scene={gltfScene} week={safeWeek} />
          </group>
          <OrbitControls
            enableRotate
            enableZoom
            enablePan
            enableDamping
            dampingFactor={0.08}
            minDistance={2}
            maxDistance={8}
          />
        </Canvas>
      </div>

      <div className="baby-3d-viewer-foot">
        <span className="model-source">Model Source: {modelSource}</span>
        {loading ? <span className="loading">Loading model...</span> : null}
      </div>
      {loadInfo ? <p className="baby-3d-warning">{loadInfo}</p> : null}
    </section>
  );
}
