import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';

interface SceneProps {
  treeState: TreeState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
    >
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={45} />
      
      <color attach="background" args={['#020205']} />
      
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <group position={[0, -2, 0]}>
          <Foliage treeState={treeState} />
          <Ornaments treeState={treeState} />
        </group>

        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color="#004225" />
        <spotLight
          position={[10, 20, 10]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          color="#FFD700"
          castShadow
        />
        <pointLight position={[-10, 5, -10]} intensity={2} color="#ffffff" />
        
        {/* Dynamic Light in the center of tree */}
        <pointLight position={[0, 5, 0]} intensity={1} color="#FFD700" distance={10} decay={2} />

        {/* Post Processing */}
        <EffectComposer disableNormalPass>
          <Bloom
            luminanceThreshold={0.8}
            mipmapBlur
            intensity={1.2}
            radius={0.6}
            levels={8}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.6} />
          <Noise opacity={0.05} />
        </EffectComposer>
        
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={10}
          maxDistance={40}
        />
      </Suspense>
    </Canvas>
  );
};

export default Scene;