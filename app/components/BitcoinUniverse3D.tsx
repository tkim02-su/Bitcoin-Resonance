// app/components/BitcoinUniverse3D.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import EnhancedStars from './EnhancedStars';

export default function BitcoinUniverse3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <Suspense fallback={null}>
        <group>
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={1} />
            <EnhancedStars />
        </group>
      </Suspense>
      </Canvas>
    </div>
  );
}