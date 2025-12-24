import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, OrnamentType } from '../types';
import { CONFIG, COLORS } from '../constants';
import { getRandomSpherePoint, getTreePoint } from '../utils/math';

interface OrnamentData {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  rotationAxis: THREE.Vector3;
  rotationSpeed: number;
  scale: number;
  type: OrnamentType;
  color: THREE.Color;
  weight: number; // 0 (light) to 1 (heavy)
}

interface OrnamentsProps {
  treeState: TreeState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [targetState, setTargetState] = useState(0); // 0 for Chaos, 1 for Formed
  
  // Data Generation
  const data = useMemo(() => {
    const items: OrnamentData[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const typeRoll = Math.random();
      let type = OrnamentType.BAUBLE;
      let weight = 0.5;
      let scale = 0.4;
      let color = COLORS.GOLD;

      if (typeRoll < 0.2) {
        type = OrnamentType.GIFT;
        weight = 0.1; // Gifts are "heavy", move slower (lower lerp factor)
        scale = 0.6;
        color = Math.random() > 0.5 ? COLORS.RED_LUXURY : COLORS.GOLD;
      } else if (typeRoll > 0.7) {
        type = OrnamentType.LIGHT;
        weight = 0.9; // Lights are light, move fast
        scale = 0.2;
        color = COLORS.GOLD_HIGH;
      } else {
        // Bauble
        weight = 0.4;
        scale = 0.35;
        color = Math.random() > 0.5 ? COLORS.GOLD : COLORS.SILVER;
      }

      const cPos = getRandomSpherePoint(CONFIG.CHAOS_RADIUS);
      // Place ornaments on outer edge of tree
      const tPosRaw = getTreePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS + 0.5, i, CONFIG.ORNAMENT_COUNT);
      
      items.push({
        chaosPos: new THREE.Vector3(...cPos),
        targetPos: new THREE.Vector3(...tPosRaw),
        currentPos: new THREE.Vector3(...cPos),
        rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        rotationSpeed: (Math.random() - 0.5) * 2,
        scale: scale,
        type,
        color,
        weight
      });
    }
    return items;
  }, []);

  // Update logic
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetProgress = treeState === TreeState.FORMED ? 1 : 0;
    const dummy = new THREE.Object3D();
    const time = state.clock.elapsedTime;

    data.forEach((item, i) => {
      // Calculate speed based on "weight". 
      // Heavier items (low weight value in my logic, actually let's flip it for code clarity)
      // Lerp factor: baseSpeed * weightMultiplier.
      // If weight is 0.1 (Heavy/Gift), it moves slow. If 0.9 (Light), moves fast.
      const speed = 1.0 * item.weight * delta; 
      
      // Interpolate position
      const dest = treeState === TreeState.FORMED ? item.targetPos : item.chaosPos;
      
      // Standard Lerp for position
      item.currentPos.lerp(dest, speed);

      // Add floating rotation
      dummy.position.copy(item.currentPos);
      
      // Add subtle bobbing when formed
      if (treeState === TreeState.FORMED) {
         dummy.position.y += Math.sin(time * 2 + item.chaosPos.x) * 0.05 * item.weight;
      }

      dummy.rotation.x = time * item.rotationSpeed;
      dummy.rotation.y = time * item.rotationSpeed * 0.5;
      dummy.scale.setScalar(item.scale);
      
      // Scale down to 0 if very close to center in Chaos mode (optional effect) or just scale in general
      // Let's pop them in/out slightly based on state
      // dummy.scale.multiplyScalar(item.currentPos.distanceTo(item.targetPos) < 1 ? 1 : 0.8);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, item.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        roughness={0.1} 
        metalness={0.9} 
        envMapIntensity={2}
      />
    </instancedMesh>
  );
};

export default Ornaments;