/**
 * Medhā 3D Character — Premium procedural humanoid built with React Three Fiber.
 * Pixar-inspired proportions with blue hoodie, round glasses, brown ponytail hair,
 * white sneakers. Full animation state machine with idle breathing, blinking,
 * head/eye tracking, pose transitions, micro-gestures, and weight shifting.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type MedhaPose =
  | 'standing'
  | 'waving'
  | 'sitting'
  | 'pointing'
  | 'celebrating'
  | 'thinking'
  | 'reading'
  | 'peeking'
  | 'clapping'
  | 'writing'
  | 'encouraging'
  | 'listening';

interface Medha3DCharacterProps {
  pose?: MedhaPose;
  mouseX?: number;
  mouseY?: number;
  isBlinking?: boolean;
  scale?: number;
  showTablet?: boolean;
  emotionalState?: 'neutral' | 'happy' | 'thinking' | 'proud' | 'encouraging';
}

/* ── Shared Materials (singleton, GPU-efficient) ── */
const mat = (color: string, opts?: Partial<THREE.MeshStandardMaterialParameters>) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...opts });

const skinMat = mat('#F4C8A4', { roughness: 0.65 });
const hoodieMat = mat('#3B5EE8', { roughness: 0.5, metalness: 0.08 });
const hoodieDetailMat = mat('#3352CC', { roughness: 0.6 });
const shirtMat = mat('#FFFFFF', { roughness: 0.7, metalness: 0 });
const jeansMat = mat('#1E3A5F', { roughness: 0.65 });
const shoeMat = mat('#F8F8F8', { roughness: 0.45, metalness: 0.1 });
const shoeAccentMat = mat('#3B5EE8', { roughness: 0.5, metalness: 0.1 });
const soleMat = mat('#DDDDDD', { roughness: 0.6 });
const hairMat = mat('#2C1810', { roughness: 0.75, metalness: 0.12 });
const glassMat = mat('#1a1a2e', { roughness: 0.25, metalness: 0.65 });
const lenseMat = mat('#c0d8f0', { roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.3 });
const eyeWhiteMat = mat('#FFFFFF', { roughness: 0.3, metalness: 0 });
const irisMat = mat('#5C3317', { roughness: 0.3, metalness: 0.05 });
const pupilMat = mat('#0C0804', { roughness: 0.2, metalness: 0.1 });
const mouthMat = mat('#C46B5A', { roughness: 0.6, metalness: 0 });
const cheekMat = mat('#E8A090', { roughness: 0.8, transparent: true, opacity: 0.4 });
const tabletMat = mat('#2a2a3e', { roughness: 0.3, metalness: 0.4 });
const tabletScreenMat = mat('#4a90d9', { roughness: 0.1, metalness: 0.1, emissive: '#2a5aa0', emissiveIntensity: 0.3 });

/* ── Pose Configuration ── */
interface PoseConfig {
  rightArmZ: number; rightArmX: number;
  leftArmZ: number; leftArmX: number;
  bodyY: number; bodyTilt: number;
  headTiltZ: number; headTiltX: number;
  mouthScale: number;
}

const POSE_CONFIGS: Record<MedhaPose, PoseConfig> = {
  standing:     { rightArmZ: -0.15, rightArmX: 0,    leftArmZ: 0.15,  leftArmX: 0,    bodyY: 0, bodyTilt: 0,    headTiltZ: 0,    headTiltX: 0,    mouthScale: 1 },
  waving:       { rightArmZ: -2.4,  rightArmX: 0.2,  leftArmZ: 0.15,  leftArmX: 0,    bodyY: 0, bodyTilt: 0,    headTiltZ: 0.05, headTiltX: 0,    mouthScale: 1.3 },
  sitting:      { rightArmZ: -0.3,  rightArmX: -0.4, leftArmZ: 0.3,   leftArmX: -0.3, bodyY: 0, bodyTilt: 0.05, headTiltZ: -0.04,headTiltX: -0.05,mouthScale: 1 },
  pointing:     { rightArmZ: -1.5,  rightArmX: 0.6,  leftArmZ: 0.15,  leftArmX: 0,    bodyY: 0, bodyTilt: 0,    headTiltZ: 0.03, headTiltX: 0,    mouthScale: 1.1 },
  celebrating:  { rightArmZ: -2.7,  rightArmX: 0.15, leftArmZ: -2.5,  leftArmX: 0.15, bodyY: 0, bodyTilt: 0,    headTiltZ: 0,    headTiltX: 0.05, mouthScale: 1.5 },
  thinking:     { rightArmZ: -1.9,  rightArmX: -0.5, leftArmZ: 0.2,   leftArmX: 0,    bodyY: 0, bodyTilt: 0.03, headTiltZ: 0.08, headTiltX: 0.05, mouthScale: 0.7 },
  reading:      { rightArmZ: -0.8,  rightArmX: -0.3, leftArmZ: -0.7,  leftArmX: -0.3, bodyY: 0, bodyTilt: 0.05, headTiltZ: -0.08,headTiltX: -0.1, mouthScale: 0.9 },
  peeking:      { rightArmZ: -0.2,  rightArmX: 0,    leftArmZ: 0.2,   leftArmX: 0,    bodyY: 0, bodyTilt: -0.04,headTiltZ: 0.05, headTiltX: 0,    mouthScale: 1.1 },
  clapping:     { rightArmZ: -1.6,  rightArmX: 0.4,  leftArmZ: -1.4,  leftArmX: -0.4, bodyY: 0, bodyTilt: 0,    headTiltZ: 0,    headTiltX: 0.04, mouthScale: 1.4 },
  writing:      { rightArmZ: -1.0,  rightArmX: -0.4, leftArmZ: 0.3,   leftArmX: -0.2, bodyY: 0, bodyTilt: 0.04, headTiltZ: -0.05,headTiltX: -0.08,mouthScale: 0.9 },
  encouraging:  { rightArmZ: -1.2,  rightArmX: 0.3,  leftArmZ: 0.15,  leftArmX: 0,    bodyY: 0, bodyTilt: 0,    headTiltZ: 0.04, headTiltX: 0,    mouthScale: 1.3 },
  listening:    { rightArmZ: -0.15, rightArmX: 0,    leftArmZ: 0.15,  leftArmX: 0,    bodyY: 0, bodyTilt: 0.02, headTiltZ: 0.05, headTiltX: 0.04, mouthScale: 1 },
};

const lerp = THREE.MathUtils.lerp;
const LERP_SPEED = 0.045;

export function Medha3DCharacter({
  pose = 'standing',
  mouseX = 0,
  mouseY = 0,
  isBlinking = false,
  scale = 1,
  showTablet = false,
  emotionalState = 'neutral',
}: Medha3DCharacterProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const leftPupilRef = useRef<THREE.Mesh>(null!);
  const rightPupilRef = useRef<THREE.Mesh>(null!);
  const leftIrisRef = useRef<THREE.Mesh>(null!);
  const rightIrisRef = useRef<THREE.Mesh>(null!);
  const eyeLidLRef = useRef<THREE.Mesh>(null!);
  const eyeLidRRef = useRef<THREE.Mesh>(null!);
  const ponytailRef = useRef<THREE.Group>(null!);
  const mouthRef = useRef<THREE.Mesh>(null!);

  const config = useMemo(() => POSE_CONFIGS[pose] || POSE_CONFIGS.standing, [pose]);

  // Smile scale based on emotional state
  const smileTarget = useMemo(() => {
    const base = config.mouthScale;
    if (emotionalState === 'happy' || emotionalState === 'proud') return base * 1.2;
    if (emotionalState === 'thinking') return base * 0.7;
    return base;
  }, [config.mouthScale, emotionalState]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // ── IDLE BREATHING ──
    if (bodyRef.current) {
      const breathe = Math.sin(t * 1.1) * 0.014;
      bodyRef.current.scale.y = 1 + breathe;
      bodyRef.current.position.y = breathe * 0.12;
      // Subtle body rotation toward pose target
      bodyRef.current.rotation.y = lerp(bodyRef.current.rotation.y, config.bodyY, LERP_SPEED);
      bodyRef.current.rotation.x = lerp(bodyRef.current.rotation.x, config.bodyTilt, LERP_SPEED);
    }

    // ── HEAD TRACKING ──
    if (headRef.current) {
      const targetY = mouseX * 0.22 + config.headTiltZ;
      const targetX = mouseY * -0.1 + config.headTiltX;
      headRef.current.rotation.y = lerp(headRef.current.rotation.y, targetY, 0.035);
      headRef.current.rotation.x = lerp(headRef.current.rotation.x, targetX, 0.035);
      headRef.current.rotation.z = Math.sin(t * 0.6) * 0.015;
    }

    // ── PUPIL + IRIS TRACKING ──
    const px = mouseX * 0.015;
    const py = mouseY * -0.008;
    [leftPupilRef, rightPupilRef].forEach((ref, i) => {
      if (ref.current) {
        const baseX = i === 0 ? -0.09 : 0.09;
        ref.current.position.x = baseX + px;
        ref.current.position.y = 0.15 + py;
      }
    });
    [leftIrisRef, rightIrisRef].forEach((ref, i) => {
      if (ref.current) {
        const baseX = i === 0 ? -0.09 : 0.09;
        ref.current.position.x = baseX + px * 0.8;
        ref.current.position.y = 0.15 + py * 0.8;
      }
    });

    // ── BLINK ──
    const blinkY = isBlinking ? 1 : 0;
    if (eyeLidLRef.current) eyeLidLRef.current.scale.y = lerp(eyeLidLRef.current.scale.y, blinkY, 0.4);
    if (eyeLidRRef.current) eyeLidRRef.current.scale.y = lerp(eyeLidRRef.current.scale.y, blinkY, 0.4);

    // ── ARM ANIMATIONS ──
    if (rightArmRef.current) {
      let tZ = config.rightArmZ;
      let tX = config.rightArmX;
      if (pose === 'waving') tZ += Math.sin(t * 3.2) * 0.3;
      if (pose === 'celebrating') tZ += Math.sin(t * 3.8) * 0.18;
      if (pose === 'clapping') { tZ += Math.sin(t * 5) * 0.2; tX += Math.cos(t * 5) * 0.15; }
      rightArmRef.current.rotation.z = lerp(rightArmRef.current.rotation.z, tZ, 0.055);
      rightArmRef.current.rotation.x = lerp(rightArmRef.current.rotation.x, tX, 0.055);
    }
    if (leftArmRef.current) {
      let tZ = config.leftArmZ;
      let tX = config.leftArmX;
      if (pose === 'celebrating') tZ += Math.sin(t * 3.8 + 1) * 0.18;
      if (pose === 'clapping') { tZ -= Math.sin(t * 5) * 0.2; tX -= Math.cos(t * 5) * 0.15; }
      leftArmRef.current.rotation.z = lerp(leftArmRef.current.rotation.z, tZ, 0.055);
      leftArmRef.current.rotation.x = lerp(leftArmRef.current.rotation.x, tX, 0.055);
    }

    // ── PONYTAIL PHYSICS ──
    if (ponytailRef.current) {
      ponytailRef.current.rotation.x = Math.sin(t * 1.3) * 0.06 + 0.15;
      ponytailRef.current.rotation.z = Math.sin(t * 0.9) * 0.04;
    }

    // ── MOUTH (smile intensity) ──
    if (mouthRef.current) {
      const curScale = mouthRef.current.scale.x;
      mouthRef.current.scale.x = lerp(curScale, smileTarget, 0.03);
      mouthRef.current.scale.y = lerp(mouthRef.current.scale.y, smileTarget, 0.03);
    }

    // ── WHOLE BODY FLOAT (Subtle 2-4px idle motion) ──
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.012;
      // Micro weight shift
      groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.005;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* ═══ BODY ═══ */}
      <group ref={bodyRef}>
        {/* Torso — Hoodie */}
        <mesh position={[0, 0.15, 0]} material={hoodieMat}>
          <capsuleGeometry args={[0.3, 0.52, 10, 18]} />
        </mesh>
        {/* Hoodie collar */}
        <mesh position={[0, 0.52, 0.1]} material={shirtMat}>
          <boxGeometry args={[0.24, 0.09, 0.13]} />
        </mesh>
        {/* Hoodie front pocket */}
        <mesh position={[0, -0.02, 0.3]} material={hoodieDetailMat}>
          <boxGeometry args={[0.3, 0.12, 0.02]} />
        </mesh>
        {/* Hoodie logo/brand mark */}
        <mesh position={[0.12, 0.28, 0.3]} material={shirtMat}>
          <boxGeometry args={[0.06, 0.025, 0.005]} />
        </mesh>
        {/* Hoodie strings */}
        <mesh position={[-0.06, 0.42, 0.28]} material={shirtMat}>
          <cylinderGeometry args={[0.005, 0.005, 0.18, 4]} />
        </mesh>
        <mesh position={[0.06, 0.42, 0.28]} material={shirtMat}>
          <cylinderGeometry args={[0.005, 0.005, 0.15, 4]} />
        </mesh>

        {/* Hips */}
        <mesh position={[0, -0.3, 0]} material={jeansMat}>
          <capsuleGeometry args={[0.24, 0.14, 8, 14]} />
        </mesh>

        {/* LEFT LEG */}
        <mesh position={[-0.11, -0.72, 0]} material={jeansMat}>
          <capsuleGeometry args={[0.095, 0.46, 8, 12]} />
        </mesh>
        {/* Left shoe */}
        <mesh position={[-0.11, -1.1, 0.05]} material={shoeMat}>
          <boxGeometry args={[0.15, 0.09, 0.24]} />
        </mesh>
        <mesh position={[-0.11, -1.145, 0.05]} material={soleMat}>
          <boxGeometry args={[0.16, 0.035, 0.26]} />
        </mesh>
        <mesh position={[-0.11, -1.08, 0.05]} material={shoeAccentMat}>
          <boxGeometry args={[0.155, 0.025, 0.1]} />
        </mesh>

        {/* RIGHT LEG */}
        <mesh position={[0.11, -0.72, 0]} material={jeansMat}>
          <capsuleGeometry args={[0.095, 0.46, 8, 12]} />
        </mesh>
        {/* Right shoe */}
        <mesh position={[0.11, -1.1, 0.05]} material={shoeMat}>
          <boxGeometry args={[0.15, 0.09, 0.24]} />
        </mesh>
        <mesh position={[0.11, -1.145, 0.05]} material={soleMat}>
          <boxGeometry args={[0.16, 0.035, 0.26]} />
        </mesh>
        <mesh position={[0.11, -1.08, 0.05]} material={shoeAccentMat}>
          <boxGeometry args={[0.155, 0.025, 0.1]} />
        </mesh>

        {/* LEFT ARM */}
        <group ref={leftArmRef} position={[-0.36, 0.32, 0]}>
          <mesh position={[0, -0.15, 0]} material={hoodieMat}>
            <capsuleGeometry args={[0.07, 0.22, 8, 10]} />
          </mesh>
          <mesh position={[0, -0.43, 0]} material={hoodieMat}>
            <capsuleGeometry args={[0.058, 0.2, 8, 10]} />
          </mesh>
          <mesh position={[0, -0.62, 0]} material={skinMat}>
            <sphereGeometry args={[0.058, 12, 12]} />
          </mesh>
        </group>

        {/* RIGHT ARM */}
        <group ref={rightArmRef} position={[0.36, 0.32, 0]}>
          <mesh position={[0, -0.15, 0]} material={hoodieMat}>
            <capsuleGeometry args={[0.07, 0.22, 8, 10]} />
          </mesh>
          <mesh position={[0, -0.43, 0]} material={hoodieMat}>
            <capsuleGeometry args={[0.058, 0.2, 8, 10]} />
          </mesh>
          <mesh position={[0, -0.62, 0]} material={skinMat}>
            <sphereGeometry args={[0.058, 12, 12]} />
          </mesh>
          {/* Tablet (conditional) */}
          {showTablet && (
            <group position={[0.02, -0.5, 0.08]} rotation={[0.3, 0.2, 0]}>
              <mesh material={tabletMat}>
                <boxGeometry args={[0.16, 0.22, 0.012]} />
              </mesh>
              <mesh position={[0, 0, 0.007]} material={tabletScreenMat}>
                <boxGeometry args={[0.13, 0.18, 0.002]} />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* ═══ HEAD ═══ */}
      <group ref={headRef} position={[0, 0.74, 0]}>
        {/* Neck */}
        <mesh position={[0, -0.12, 0]} material={skinMat}>
          <cylinderGeometry args={[0.065, 0.075, 0.13, 12]} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.13, 0]} material={skinMat}>
          <sphereGeometry args={[0.26, 24, 24]} />
        </mesh>

        {/* ── HAIR ── */}
        {/* Back volume */}
        <mesh position={[0, 0.17, -0.07]} material={hairMat}>
          <sphereGeometry args={[0.28, 18, 18]} />
        </mesh>
        {/* Top */}
        <mesh position={[0, 0.3, 0.02]} material={hairMat}>
          <sphereGeometry args={[0.22, 16, 16]} />
        </mesh>
        {/* Bangs/Fringe */}
        <mesh position={[0, 0.28, 0.18]} material={hairMat}>
          <boxGeometry args={[0.38, 0.1, 0.08]} />
        </mesh>
        {/* Side strands L */}
        <mesh position={[-0.22, 0, -0.04]} material={hairMat}>
          <capsuleGeometry args={[0.055, 0.32, 6, 8]} />
        </mesh>
        {/* Side strands R */}
        <mesh position={[0.22, 0, -0.04]} material={hairMat}>
          <capsuleGeometry args={[0.055, 0.32, 6, 8]} />
        </mesh>
        {/* Front wisps */}
        <mesh position={[-0.16, 0.18, 0.2]} material={hairMat} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.02, 0.12, 4, 6]} />
        </mesh>
        <mesh position={[0.14, 0.2, 0.19]} material={hairMat} rotation={[0, 0, -0.2]}>
          <capsuleGeometry args={[0.018, 0.1, 4, 6]} />
        </mesh>

        {/* Ponytail */}
        <group ref={ponytailRef} position={[0, 0.12, -0.24]}>
          <mesh position={[0, -0.05, -0.02]} material={hairMat}>
            <sphereGeometry args={[0.08, 10, 10]} />
          </mesh>
          <mesh position={[0, -0.18, -0.05]} material={hairMat}>
            <capsuleGeometry args={[0.06, 0.18, 8, 8]} />
          </mesh>
          <mesh position={[0, -0.34, -0.06]} material={hairMat}>
            <sphereGeometry args={[0.045, 8, 8]} />
          </mesh>
          {/* Hair tie */}
          <mesh position={[0, -0.04, -0.02]} material={hoodieDetailMat}>
            <torusGeometry args={[0.06, 0.015, 6, 12]} />
          </mesh>
        </group>

        {/* ── FACE ── */}

        {/* Left eye white */}
        <mesh position={[-0.09, 0.15, 0.21]} material={eyeWhiteMat}>
          <sphereGeometry args={[0.052, 14, 14]} />
        </mesh>
        {/* Left iris */}
        <mesh ref={leftIrisRef} position={[-0.09, 0.15, 0.245]} material={irisMat}>
          <sphereGeometry args={[0.032, 12, 12]} />
        </mesh>
        {/* Left pupil */}
        <mesh ref={leftPupilRef} position={[-0.09, 0.15, 0.255]} material={pupilMat}>
          <sphereGeometry args={[0.018, 10, 10]} />
        </mesh>
        {/* Left eyelid */}
        <mesh ref={eyeLidLRef} position={[-0.09, 0.185, 0.23]} material={skinMat} scale={[1, 0, 1]}>
          <boxGeometry args={[0.11, 0.055, 0.065]} />
        </mesh>

        {/* Right eye white */}
        <mesh position={[0.09, 0.15, 0.21]} material={eyeWhiteMat}>
          <sphereGeometry args={[0.052, 14, 14]} />
        </mesh>
        {/* Right iris */}
        <mesh ref={rightIrisRef} position={[0.09, 0.15, 0.245]} material={irisMat}>
          <sphereGeometry args={[0.032, 12, 12]} />
        </mesh>
        {/* Right pupil */}
        <mesh ref={rightPupilRef} position={[0.09, 0.15, 0.255]} material={pupilMat}>
          <sphereGeometry args={[0.018, 10, 10]} />
        </mesh>
        {/* Right eyelid */}
        <mesh ref={eyeLidRRef} position={[0.09, 0.185, 0.23]} material={skinMat} scale={[1, 0, 1]}>
          <boxGeometry args={[0.11, 0.055, 0.065]} />
        </mesh>

        {/* Cheeks */}
        <mesh position={[-0.15, 0.08, 0.19]} material={cheekMat}>
          <sphereGeometry args={[0.04, 10, 10]} />
        </mesh>
        <mesh position={[0.15, 0.08, 0.19]} material={cheekMat}>
          <sphereGeometry args={[0.04, 10, 10]} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, 0.09, 0.26]} material={skinMat}>
          <sphereGeometry args={[0.022, 10, 10]} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, 0.02, 0.235]} material={mouthMat} rotation={[0.1, 0, 0]}>
          <torusGeometry args={[0.038, 0.013, 8, 14, Math.PI]} />
        </mesh>

        {/* ── GLASSES ── */}
        {/* Left frame */}
        <mesh position={[-0.1, 0.15, 0.23]} material={glassMat}>
          <torusGeometry args={[0.062, 0.009, 8, 22]} />
        </mesh>
        <mesh position={[-0.1, 0.15, 0.225]} material={lenseMat}>
          <circleGeometry args={[0.055, 22]} />
        </mesh>
        {/* Right frame */}
        <mesh position={[0.1, 0.15, 0.23]} material={glassMat}>
          <torusGeometry args={[0.062, 0.009, 8, 22]} />
        </mesh>
        <mesh position={[0.1, 0.15, 0.225]} material={lenseMat}>
          <circleGeometry args={[0.055, 22]} />
        </mesh>
        {/* Bridge */}
        <mesh position={[0, 0.16, 0.25]} material={glassMat}>
          <boxGeometry args={[0.04, 0.009, 0.012]} />
        </mesh>
        {/* Left temple */}
        <mesh position={[-0.18, 0.15, 0.15]} material={glassMat} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.1, 0.009, 0.009]} />
        </mesh>
        {/* Right temple */}
        <mesh position={[0.18, 0.15, 0.15]} material={glassMat} rotation={[0, -0.5, 0]}>
          <boxGeometry args={[0.1, 0.009, 0.009]} />
        </mesh>
      </group>
    </group>
  );
}
