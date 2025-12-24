import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { CONFIG, COLORS } from '../constants';
import { getRandomSpherePoint, getTreePoint } from '../utils/math';

// Custom Shader for high-performance morphing
const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aRandom;
  
  varying vec3 vColor;
  
  // Easing function
  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  void main() {
    // Add individual delay based on random attribute
    float localProgress = clamp((uProgress * 1.2) - (aRandom * 0.2), 0.0, 1.0);
    float eased = easeInOutCubic(localProgress);
    
    vec3 pos = mix(aChaosPos, aTargetPos, eased);
    
    // Add a gentle sway wind effect when formed
    if (localProgress > 0.8) {
        float wind = sin(uTime * 2.0 + pos.y * 0.5 + pos.x) * 0.1 * (1.0 - eased); 
        // Logic check: wind actually applies when eased is high, but we want it subtle.
        // Let's make wind scale with height (pos.y)
        float swayIntensity = (pos.y + 5.0) * 0.02 * eased;
        pos.x += sin(uTime + pos.y) * swayIntensity;
        pos.z += cos(uTime * 0.8 + pos.y) * swayIntensity;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (4.0 * (1.0 + aRandom)) * (10.0 / -mvPosition.z);
    
    // Varying color mixing (Emerald to Gold highlights)
    vec3 c1 = vec3(${COLORS.EMERALD.r}, ${COLORS.EMERALD.g}, ${COLORS.EMERALD.b});
    vec3 c2 = vec3(${COLORS.EMERALD_BRIGHT.r}, ${COLORS.EMERALD_BRIGHT.g}, ${COLORS.EMERALD_BRIGHT.b});
    vec3 c3 = vec3(${COLORS.GOLD.r}, ${COLORS.GOLD.g}, ${COLORS.GOLD.b});
    
    // Mix based on random and height
    vec3 baseColor = mix(c1, c2, aRandom);
    // Add gold tips at the ends/top
    float goldMix = step(0.95, aRandom);
    vColor = mix(baseColor, c3, goldMix);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

interface FoliageProps {
  treeState: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate Geometry Data
  const { chaosPositions, targetPositions, randoms } = useMemo(() => {
    const chaos = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);
    const targets = new Float32Array(CONFIG.FOLIAGE_COUNT * 3);
    const rands = new Float32Array(CONFIG.FOLIAGE_COUNT);
    
    for (let i = 0; i < CONFIG.FOLIAGE_COUNT; i++) {
      const cPos = getRandomSpherePoint(CONFIG.CHAOS_RADIUS);
      const tPos = getTreePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS, i, CONFIG.FOLIAGE_COUNT);
      
      chaos.set(cPos, i * 3);
      targets.set(tPos, i * 3);
      rands[i] = Math.random();
    }
    
    return { chaosPositions: chaos, targetPositions: targets, randoms: rands };
  }, []);

  // Animation Loop
  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const targetProgress = treeState === TreeState.FORMED ? 1.0 : 0.0;
      // Lerp the uniform for smooth global transition
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgress.value,
        targetProgress,
        delta * 0.8 // Speed of foliage assembly
      );
    }
  });

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 }
  }), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Use chaos as initial position just to satisfy ThreeJS bounding box
          array={chaosPositions}
          count={CONFIG.FOLIAGE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aChaosPos"
          array={chaosPositions}
          count={CONFIG.FOLIAGE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          array={targetPositions}
          count={CONFIG.FOLIAGE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          array={randoms}
          count={CONFIG.FOLIAGE_COUNT}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;