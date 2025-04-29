'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState, createContext, useContext } from 'react';
import EnhancedStars from './EnhancedStars';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import PlanetStoryCard from './PlanetStoryCard';
import { altcoinDescriptions } from '../../lib/altcoinDescriptions';
import * as THREE from 'three';
import PlanetsInstanced from './PlanetsInstanced';
import FloatingLabel from './FloatingLabel';
import CrashOverlay from './CrashOverlay';
import FlyBriefingModal from './FlyBriefingModal';

interface BitcoinUniverse3DProps {
  exploreMode: boolean;
  setExploreMode: (mode: boolean) => void;
  initialAltcoins: AltcoinInfo[];
}

interface AltcoinInfo {
  id: string;
  symbol: string;
  name: string;
}

interface PlanetInfo {
  position: [number, number, number];
  scale: number;
  color: THREE.Color;
  rotationSpeed: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CameraTravelContext = createContext<any>(null);
function useCameraTravel() {
  return useContext(CameraTravelContext);
}

function MilkyWayBackground() {
  const texture = new THREE.TextureLoader().load('/textures/milkyway.jpg');
  return (
    <mesh scale={[-500, 500, 500]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function CameraAnimator({ targetZ }: { targetZ: number }) {
  const { camera } = useThree();
  const { cameraTarget, isTraveling, setIsTraveling, orbitControlsRef } = useCameraTravel();

  useFrame(() => {
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    if (cameraTarget && isTraveling) {
      const targetVec = new THREE.Vector3(...cameraTarget);
      camera.position.lerp(targetVec, 0.02);
      camera.lookAt(targetVec);

      if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;

      if (camera.position.distanceTo(targetVec) < 5) {
        setIsTraveling(false);
        setTimeout(() => {
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = true;
            orbitControlsRef.current.target.copy(targetVec);
            orbitControlsRef.current.update();
          }
        }, 300);
      }
    } else {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
        orbitControlsRef.current.update();
      }
    }
  });

  return null;
}

function SpaceshipFlyController({ setCrashed, planets }: { setCrashed: (value: boolean) => void; planets: PlanetInfo[] }) {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  const direction = useRef(new THREE.Vector3());
  const up = new THREE.Vector3(0, 1, 0);
  const rollSpeed = 0.005;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const moveSpeed = 80;
    direction.current.set(0, 0, -1).applyQuaternion(camera.quaternion);

    if (keys.current['w']) camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -rollSpeed));
    if (keys.current['s']) camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rollSpeed));
    if (keys.current['a']) camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(up, rollSpeed));
    if (keys.current['d']) camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(up, -rollSpeed));

    camera.position.add(direction.current.multiplyScalar(moveSpeed * delta));

    if (camera.position.length() > 450) setCrashed(true);
    for (const planet of planets) {
      if (new THREE.Vector3(...planet.position).distanceTo(camera.position) < planet.scale + 2) {
        setCrashed(true);
        break;
      }
    }
  });

  return null;
}

function FallbackLoading() {
  return (
    <mesh>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}

export default function BitcoinUniverse3D({ exploreMode, setExploreMode, initialAltcoins }: BitcoinUniverse3DProps) {
  const [selectedAltcoin, setSelectedAltcoin] = useState<AltcoinInfo | null>(null);
  const [altcoins] = useState<AltcoinInfo[]>(initialAltcoins);
  const [planets, setPlanets] = useState<PlanetInfo[]>([]);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const [cameraZ, setCameraZ] = useState(5);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [isFlyMode, setIsFlyMode] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [showFlyTip, setShowFlyTip] = useState(false);

  useEffect(() => {
    if (exploreMode && altcoins.length) {
      const newPlanets = altcoins.map(() => ({
        position: [(Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150] as [number, number, number],
        scale: Math.random() * 3 + 3,
        color: new THREE.Color(`hsl(${Math.random() * 360}, 60%, 60%)`),
        rotationSpeed: Math.random() * 0.002 + 0.001,
      }));
      setPlanets(newPlanets);
      setCameraZ(20);
    } else {
      setPlanets([]);
      setCameraZ(5);
    }
  }, [exploreMode, altcoins]);

  const handlePlanetClick = (index: number) => {
    if (!altcoins.length || !planets.length || isFlyMode) return;
    const altcoin = altcoins[index % altcoins.length];
    setSelectedAltcoin(altcoin);
    setCameraTarget(planets[index].position);
    setIsTraveling(true);
  };

  const handleCloseInfo = () => {
    setSelectedAltcoin(null);
    setCameraTarget(null);
    setIsTraveling(false);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      orbitControlsRef.current.update();
    }
  };

  const handleReturnToWebMode = () => {
    setExploreMode(false);
    setSelectedAltcoin(null);
    setCameraTarget(null);
    setIsFlyMode(false);
    setIsTraveling(false);
    setCrashed(false);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      orbitControlsRef.current.update();
    }
  };

  return (
    <CameraTravelContext.Provider value={{ cameraTarget, setCameraTarget, isTraveling, setIsTraveling, orbitControlsRef }}>
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }} onCreated={({ camera }) => { cameraRef.current = camera as THREE.PerspectiveCamera; }}>
          <Suspense fallback={<FallbackLoading />}>
            {exploreMode && <MilkyWayBackground />}

            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <pointLight position={[0, 5, 5]} intensity={2} distance={100} />

            <EnhancedStars exploreMode={exploreMode} />

            {exploreMode && !crashed && (
              <>
                {!isFlyMode && (
                  <DreiOrbitControls
                    ref={orbitControlsRef}
                    makeDefault={!isFlyMode}
                    enableZoom
                    enableRotate
                    enablePan={false}
                    zoomSpeed={0.3}
                    rotateSpeed={0.3}
                    minDistance={5}
                    maxDistance={50}
                    enableDamping
                    dampingFactor={0.2}
                    autoRotate
                    autoRotateSpeed={0.2}
                  />
                )}
                {isFlyMode && <SpaceshipFlyController setCrashed={setCrashed} planets={planets} />}

                <PlanetsInstanced planets={planets} onPlanetClick={handlePlanetClick} />
                {planets.map((planet, i) => (
                  <FloatingLabel
                    key={`label-${i}`}
                    text={altcoins[i % altcoins.length]?.symbol.toUpperCase() || ''}
                    position={planet.position}
                    scale={planet.scale}
                  />
                ))}
              </>
            )}

            <CameraAnimator targetZ={cameraZ} />
          </Suspense>
        </Canvas>

        {exploreMode && isFlyMode && !crashed && (
          <>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full opacity-50 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center text-white font-mono text-sm opacity-80">
              🚀 Speed: 80km/s | 🛰️ Altitude: {(cameraRef.current?.position.length() || 0).toFixed(0)}km
            </div>
          </>
        )}

        {exploreMode && crashed && (
          <CrashOverlay
            onReturnToWebMode={handleReturnToWebMode}
            onResumeFlyMode={() => {
              setCrashed(false);
              if (cameraRef.current) cameraRef.current.position.set(0, 0, 20);
            }}
          />
        )}

        {exploreMode && !crashed && (
          <>
            <button
              onClick={() => setIsFlyMode(prev => { setShowFlyTip(prev ? false : true); return !prev; })}
              className={`fixed bottom-20 right-6 px-5 py-2 ${isFlyMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-full transition z-20 shadow`}
            >
              {isFlyMode ? '🛑 Exit Fly Free Mode' : '🚀 Activate Fly Free Mode'}
            </button>

            <button
              onClick={handleReturnToWebMode}
              className="fixed bottom-6 right-6 px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition z-20 shadow"
            >
              🏠 Return to Web Mode
            </button>
          </>
        )}

        {exploreMode && showFlyTip && (
          <FlyBriefingModal
            onStart={() => setShowFlyTip(false)}
            onCancel={() => setIsFlyMode(false)}
          />
        )}

        {exploreMode && selectedAltcoin && !crashed && (
          <PlanetStoryCard
            name={selectedAltcoin.name}
            symbol={selectedAltcoin.symbol}
            description={altcoinDescriptions[selectedAltcoin.id]?.description || `Explore the wonders of ${selectedAltcoin.name}`}
            mission={`Discover the mission of ${selectedAltcoin.name}`}
            link={`https://www.coingecko.com/en/coins/${selectedAltcoin.id}`}
            onAbort={handleCloseInfo}
          />
        )}
      </div>
    </CameraTravelContext.Provider>
  );
}