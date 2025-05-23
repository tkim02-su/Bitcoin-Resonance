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
import MissileManager from './MissileManager';
import SpaceshipFlyController from './SpaceshipFlyController';

// Define a safe zone function for planet generation
const createPlanetsWithSafeZone = (altcoins: AltcoinInfo[]) => {
  // Define a safe zone radius around the origin (where the spaceship spawns)
  const safeZoneRadius = 30;
  
  return altcoins.map(() => {
    // Generate a random position that's outside the safe zone
    let position: [number, number, number];
    let distance = 0;
    
    // Keep generating positions until we find one outside the safe zone
    do {
      position = [
        (Math.random() - 0.5) * 150, 
        (Math.random() - 0.5) * 150, 
        (Math.random() - 0.5) * 150
      ] as [number, number, number];
      
      // Calculate distance from origin
      distance = Math.sqrt(
        position[0] * position[0] + 
        position[1] * position[1] + 
        position[2] * position[2]
      );
    } while (distance < safeZoneRadius);
    
    return {
      position,
      scale: Math.random() * 3 + 3,
      color: new THREE.Color(`hsl(${Math.random() * 360}, 60%, 60%)`),
      rotationSpeed: Math.random() * 0.002 + 0.001,
    };
  });
};

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

  // Track destroyed planets
  const [destroyedPlanets, setDestroyedPlanets] = useState<Set<number>>(new Set());

  // Updated missile ref with proper typings
  interface MissileType {
    position: THREE.Vector3;
    direction: THREE.Vector3;
    startTime: number;
    active: boolean;
  }

  const missilesRef = useRef<MissileType[]>([]);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Add this function to handle planet explosions
  const handlePlanetExploded = (planetIndex: number) => {
    console.log(`💥 Planet ${planetIndex} got hit!`);
    
    // Add planet to destroyed list
    setDestroyedPlanets((prevPlanets: Set<number>) => {
      const newSet = new Set(prevPlanets);
      newSet.add(planetIndex);
      return newSet;
    });
    
    // Optional: Add explosion sound
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5);
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.error("Explosion sound failed:", error);
    }
  };

  useEffect(() => {
    if (exploreMode && altcoins.length) {
      // Use the safe zone function for planet generation
      const newPlanets = createPlanetsWithSafeZone(altcoins);
      setPlanets(newPlanets);
      setCameraZ(20);
    } else {
      setPlanets([]);
      setCameraZ(5);
    }
  }, [exploreMode, altcoins]);

  useEffect(() => {
    // Initialize missiles array if empty
    if (!missilesRef.current || missilesRef.current.length === 0) {
      missilesRef.current = Array(20).fill(null).map(() => ({
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        startTime: 0,
        active: false,
      }));
    }
  }, []);

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
    setDestroyedPlanets(new Set());
    
    if (missilesRef.current) {
      missilesRef.current.forEach(missile => {
        missile.active = false;
      });
    }

    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      orbitControlsRef.current.update();
    }
  };

  const resetCameraToStart = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 20);
      cameraRef.current.lookAt(new THREE.Vector3(0,0,0));
    }
  };

  const handleShoot = () => {
    if (!(cameraRef.current && isFlyMode && !crashed)) return;
      const position = cameraRef.current.position.clone();
      const direction = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(cameraRef.current.quaternion)
        .normalize();

      // Find a free missile in the pool:
      const slot = missilesRef.current!.find(m => !m.active);
      if (slot) {
        slot.position.copy(position);
        slot.direction.copy(direction);
        slot.startTime = clockRef.current!.getElapsedTime();
        slot.active = true;
      
      // Grant temporary invincibility when shooting
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).grantSpaceshipInvincibility) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).grantSpaceshipInvincibility();
      }
      
      // Add a sound effect for feedback
      try {
        // Use proper type declaration for AudioContext
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioContext = new AudioContextClass();
          const oscillator = audioContext.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          oscillator.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
        }
      } catch (error) {
        console.error("Audio not supported:", error);
      }
    }
  };

  const handleMouseClick = () => {
    if (isFlyMode && !crashed) {
      handleShoot();
    }
  };

  return (
    <CameraTravelContext.Provider value={{ cameraTarget, setCameraTarget, isTraveling, setIsTraveling, orbitControlsRef }}>
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          onPointerDown={handleMouseClick}
          onCreated={({ camera, clock }) => {
            cameraRef.current = camera as THREE.PerspectiveCamera;
            clockRef.current = clock;
          }}
        >
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
                {isFlyMode && 
                  <SpaceshipFlyController 
                    setCrashed={setCrashed} 
                    planets={planets.filter((_, index) => !destroyedPlanets.has(index))}
                  />
                }
                
                {/* Missile Manager Component */}
                {isFlyMode && (
                  <MissileManager
                    missilesRef={missilesRef}
                    planets={planets.filter((_, index) => !destroyedPlanets.has(index))}
                    onExplode={handlePlanetExploded}
                  />
                )}
                
                <PlanetsInstanced 
                  planets={planets} 
                  onPlanetClick={handlePlanetClick}
                  destroyedPlanets={destroyedPlanets} 
                />
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
            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="64" height="64" viewBox="0 0 64 64" className="opacity-60">
                <circle cx="32" cy="32" r="30" stroke="#ff3333" strokeWidth="1" fill="none" />
                <circle cx="32" cy="32" r="2" fill="#ff3333" />
                <line x1="32" y1="10" x2="32" y2="20" stroke="#ff3333" strokeWidth="1" />
                <line x1="32" y1="44" x2="32" y2="54" stroke="#ff3333" strokeWidth="1" />
                <line x1="10" y1="32" x2="20" y2="32" stroke="#ff3333" strokeWidth="1" />
                <line x1="44" y1="32" x2="54" y2="32" stroke="#ff3333" strokeWidth="1" />
              </svg>
            </div>
            
            {/* HUD Panel */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-40 rounded-lg p-3 text-white font-mono text-sm border border-white border-opacity-20">
              <div className="flex items-center space-x-4">
                <div>🚀 <span className="text-green-400">Speed:</span> 80km/s</div>
                <div>🛰️ <span className="text-blue-400">Altitude:</span> {(cameraRef.current?.position.length() || 0).toFixed(0)}km</div>
                <div>🔫 <span className="text-yellow-400">Missiles:</span> {missilesRef.current?.length || 0}/10</div>
                <div>💥 <span className="text-red-400">Destroyed:</span> {destroyedPlanets.size}/{planets.length}</div>
              </div>
            </div>
            
            {/* Missile Instruction */}
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-red-500 bg-opacity-70 px-4 py-2 rounded-full text-white font-mono text-sm animate-pulse">
              🎯 Click to fire missiles
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
            onStart={() => {
              resetCameraToStart();      // ✨ Reset position before flight
              setShowFlyTip(false);      // ✨ Hide modal
              setDestroyedPlanets(new Set()); // Reset destroyed planets
            }}
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