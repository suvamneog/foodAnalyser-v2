/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

// Simple floating particles component - FALLBACK VERSION
function FloatingParticles() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Physics gravity={[0, -15, 0]}>
          {/* Main floating card */}
          <FloatingCard position={[0, 2, 0]} />
          
          {/* Floating food particles */}
          {[...Array(12)].map((_, i) => (
            <FoodParticle key={i} index={i} />
          ))}
        </Physics>
        <Environment preset="dawn" />
      </Canvas>
    </div>
  );
}

function FloatingCard({ position = [0, 0, 0] }) {
  const meshRef = useRef();
  const rigidBodyRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      colliders="cuboid" 
      position={position}
      type="dynamic"
      angularDamping={2}
      linearDamping={1}
    >
      <group ref={meshRef}>
        {/* Card base */}
        <mesh>
          <boxGeometry args={[3, 4, 0.1]} />
          <meshPhysicalMaterial
            color="#3b82f6"
            metalness={0.8}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Card front design */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[2.8, 3.8]} />
          <meshBasicMaterial color="#1e40af" side={THREE.DoubleSide} />
        </mesh>
        
        {/* Indian food icon */}
        <mesh position={[0, 0.5, 0.07]}>
          <ringGeometry args={[0, 0.8, 32]} />
          <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
        </mesh>
        
        {/* Text area */}
        <mesh position={[0, -0.8, 0.07]}>
          <planeGeometry args={[2, 0.8]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        
        {/* Decorative elements */}
        <mesh position={[-1, 1.2, 0.07]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.3, 0.3, 0.01]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        
        <mesh position={[1, 1.2, 0.07]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.3, 0.3, 0.01]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </RigidBody>
  );
}

function FoodParticle({ index }) {
  const meshRef = useRef();
  const rigidBodyRef = useRef();
  
  const initialX = (Math.random() - 0.5) * 12;
  const initialY = Math.random() * 8 + 2;
  const initialZ = (Math.random() - 0.5) * 6;
  
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const shapes = ['sphere', 'box', 'cylinder'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  
  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.8;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  const getGeometry = () => {
    switch (shape) {
      case 'box':
        return <boxGeometry args={[0.2, 0.2, 0.2]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />;
      default:
        return <sphereGeometry args={[0.15, 16, 16]} />;
    }
  };

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      colliders={shape}
      position={[initialX, initialY, initialZ]}
      type="dynamic"
      angularDamping={1}
      linearDamping={0.5}
    >
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial 
          color={colors[index % colors.length]} 
          metalness={0.6}
          roughness={0.3}
          emissive={colors[index % colors.length]}
          emissiveIntensity={0.2}
        />
      </mesh>
    </RigidBody>
  );
}

// Main Lanyard component with physics (original version)
function Band({ maxSpeed = 50, minSpeed = 0 }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  
  const segmentProps = { 
    type: 'dynamic', 
    canSleep: true, 
    colliders: false, 
    angularDamping: 4, 
    linearDamping: 4 
  };
  
  // Create a simple card geometry
  const [cardGeometry] = useState(() => new THREE.BoxGeometry(1.6, 2.25, 0.02));
  
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(), 
      new THREE.Vector3(), 
      new THREE.Vector3(), 
      new THREE.Vector3()
    ])
  );
  
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() => window.innerWidth < 1024);

  // Set up physics joints
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ 
        x: vec.x - dragged.x, 
        y: vec.y - dragged.y, 
        z: vec.z - dragged.z 
      });
    }
    
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) {
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        }
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      
      if (band.current?.geometry) {
        band.current.geometry.setPoints(curve.getPoints(32));
      }
      
      if (card.current) {
        ang.copy(card.current.angvel());
        rot.copy(card.current.rotation());
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
      }
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody 
          position={[2, 0, 0]} 
          ref={card} 
          {...segmentProps} 
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={1}
            position={[0, 0, 0]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            {/* Custom card with Indian food theme */}
            <mesh geometry={cardGeometry}>
              <meshPhysicalMaterial
                color={hovered ? "#10b981" : "#3b82f6"}
                clearcoat={1}
                clearcoatRoughness={0.1}
                roughness={0.5}
                metalness={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Card details */}
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[1.4, 2]} />
              <meshBasicMaterial color="#1f2937" side={THREE.DoubleSide} />
            </mesh>
            
            {/* Indian food icon on card */}
            <mesh position={[0, 0.3, 0.03]}>
              <planeGeometry args={[0.6, 0.6]} />
              <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
            </mesh>
            
            <mesh position={[0, -0.4, 0.03]}>
              <planeGeometry args={[1, 0.3]} />
              <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      
      {/* Lanyard line */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#ffffff"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          lineWidth={2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
}

// Main Lanyard component
export default function Lanyard({ 
  position = [0, 0, 20], 
  gravity = [0, -40, 0], 
  fov = 20, 
  transparent = true,
  useFallback = true  // Default to fallback version
}) {
  
  if (useFallback) {
    return <FloatingParticles />;
  }

  return (
    <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
      <Canvas
        camera={{ position: position, fov: fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}