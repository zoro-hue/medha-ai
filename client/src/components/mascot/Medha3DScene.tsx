/**
 * Medha3DScene — R3F Canvas host for the Medhā character.
 * Framed perfectly to prevent clipping, overflow, or oversized rendering.
 * Supports mode ('full' | 'upper' | 'head') to adjust camera framing cleanly.
 */

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Medha3DCharacter, type MedhaPose } from './Medha3DCharacter';

export type SceneFramingMode = 'full' | 'upper' | 'head';

interface Medha3DSceneProps {
  pose?: MedhaPose;
  mode?: SceneFramingMode;
  mouseX?: number;
  mouseY?: number;
  isBlinking?: boolean;
  width?: number;
  height?: number;
  className?: string;
  showTablet?: boolean;
  emotionalState?: 'neutral' | 'happy' | 'thinking' | 'proud' | 'encouraging';
}

export function Medha3DScene({
  pose = 'standing',
  mode = 'full',
  mouseX = 0,
  mouseY = 0,
  isBlinking = false,
  width = 150,
  height = 210,
  className = '',
  showTablet = false,
  emotionalState = 'neutral',
}: Medha3DSceneProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Frame position & scale based on mode to guarantee ZERO clipping of hair or body
  const cameraConfig =
    mode === 'full'
      ? { position: [0, -0.1, 4.0] as [number, number, number], fov: 30, scale: 0.72 }
      : mode === 'upper'
      ? { position: [0, 0.18, 3.2] as [number, number, number], fov: 30, scale: 0.72 }
      : { position: [0, 0.42, 2.7] as [number, number, number], fov: 30, scale: 0.75 };

  return (
    <div className={`relative pointer-events-none select-none ${className}`} style={{ width, height }}>
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: 'default', failIfMajorPerformanceCaveat: false }}
        camera={{ position: cameraConfig.position, fov: cameraConfig.fov }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        frameloop={isVisible ? 'always' : 'never'}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);
          canvas.addEventListener('webglcontextrestored', () => { gl.forceContextRestore?.(); }, false);
        }}
      >
        <Suspense fallback={null}>
          {/* Studio Lighting — soft ambient + key directional */}
          <ambientLight intensity={0.65} />
          <directionalLight position={[3, 4, 4]} intensity={1.1} color="#fff5e6" />
          <directionalLight position={[-2, 2, 2]} intensity={0.4} color="#e6f0ff" />
          <pointLight position={[0, -0.5, 2]} intensity={0.2} color="#ffe8d6" />

          <Medha3DCharacter
            pose={pose}
            mouseX={mouseX}
            mouseY={mouseY}
            isBlinking={isBlinking}
            scale={cameraConfig.scale}
            showTablet={showTablet}
            emotionalState={emotionalState}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
