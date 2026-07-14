import { OrbitControls, Text } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const pitchLength = 22;
const pitchWidth = 13;
const center = new THREE.Vector3(0, 0, 0);
const crowdPalette = ['#d83636', '#f6cf46', '#2f7eea', '#f8f4df', '#25a55f', '#162a6a', '#f16b4f', '#111827'];
const skinPalette = ['#f3c7a2', '#d9a272', '#8d5b3d', '#f0d1b2'];
const confettiPalette = ['#ff3b5f', '#ffd23f', '#3fffb2', '#37a2ff', '#ffffff', '#ff8f3f'];

function seeded(seed) {
  return Math.abs(Math.sin(seed * 91.73) * 10000) % 1;
}

function Line({ points, color = '#f7fff4', width = 0.035 }) {
  const shape = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0.035, z)));
    return curve.getPoints(40);
  }, [points]);

  return (
    <mesh>
      <tubeGeometry args={[new THREE.CatmullRomCurve3(shape), 32, width, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function RectLine({ x1, x2, z1, z2 }) {
  return <Line points={[[x1, z1], [x2, z1], [x2, z2], [x1, z2], [x1, z1]]} />;
}

function Goal({ x }) {
  const sign = Math.sign(x);
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.18, 1.6, 3.8]} />
        <meshStandardMaterial color="#dff8ff" emissive="#9fe8ff" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.55 * Math.sign(x), 0.35, 0]}>
        <boxGeometry args={[0.9, 0.05, 3.8]} />
        <meshStandardMaterial color="#dff8ff" transparent opacity={0.5} />
      </mesh>
      {[-1.6, -0.8, 0, 0.8, 1.6].map((z) => (
        <Line key={`v-${z}`} points={[[0.58 * sign, z], [0.58 * sign, z]]} color="#dff8ff" width={0.012} />
      ))}
      {[-1.55, -0.75, 0.05, 0.85, 1.55].map((z) => (
        <mesh key={z} position={[0.55 * sign, 0.82, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 1.38, 6]} />
          <meshBasicMaterial color="#dff8ff" transparent opacity={0.46} />
        </mesh>
      ))}
      {[0.35, 0.7, 1.05, 1.38].map((y) => (
        <mesh key={y} position={[0.55 * sign, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 3.62, 6]} />
          <meshBasicMaterial color="#dff8ff" transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  );
}

// Stadium bowl: tiered concrete slabs plus instanced crowd bodies and heads on all four sides.
function Stand({ side }) {
  const bodies = useRef();
  const heads = useRef();
  const isLong = side === 'north' || side === 'south';
  const direction = side === 'north' ? -1 : side === 'south' ? 1 : side === 'east' ? 1 : -1;
  const rows = isLong ? 12 : 10;
  const cols = isLong ? 48 : 28;
  const count = rows * cols;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const shirtColors = useMemo(() => crowdPalette.map((color) => new THREE.Color(color)), []);
  const skinColors = useMemo(() => skinPalette.map((color) => new THREE.Color(color)), []);

  useEffect(() => {
    if (!bodies.current || !heads.current) return;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const index = row * cols + col;
        const lateral = (col - (cols - 1) / 2) * 0.46 + (seeded(index + 11) - 0.5) * 0.08;
        const depth = row * 0.42;
        const bobble = seeded(index + rows * 17) * 0.16;
        if (isLong) {
          const z = direction * (pitchWidth / 2 + 1.1 + depth);
          dummy.position.set(lateral, 0.56 + row * 0.24 + bobble, z);
          dummy.rotation.set(-0.1 * direction, 0, 0);
        } else {
          const x = direction * (pitchLength / 2 + 1.1 + depth);
          dummy.position.set(x, 0.56 + row * 0.24 + bobble, lateral);
          dummy.rotation.set(0, 0, 0.1 * direction);
        }
        dummy.scale.set(0.25, 0.34, 0.2);
        dummy.updateMatrix();
        bodies.current.setMatrixAt(index, dummy.matrix);
        bodies.current.setColorAt(index, shirtColors[Math.floor(seeded(index + direction * 31) * shirtColors.length)]);
        dummy.position.y += 0.28;
        dummy.scale.setScalar(0.13 + seeded(index + 7) * 0.035);
        dummy.updateMatrix();
        heads.current.setMatrixAt(index, dummy.matrix);
        heads.current.setColorAt(index, skinColors[Math.floor(seeded(index + direction * 43) * skinColors.length)]);
      }
    }
    bodies.current.instanceMatrix.needsUpdate = true;
    bodies.current.instanceColor.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceColor.needsUpdate = true;
  }, [cols, direction, dummy, isLong, rows, shirtColors, skinColors]);

  return (
    <group>
      {Array.from({ length: rows }).map((_, row) => {
        const depth = row * 0.42;
        const height = 0.26 + row * 0.14;
        const pos = isLong
          ? [0, height / 2, direction * (pitchWidth / 2 + 1.1 + depth)]
          : [direction * (pitchLength / 2 + 1.1 + depth), height / 2, 0];
        const args = isLong ? [pitchLength + 3.7, height, 0.38] : [0.38, height, pitchWidth + 3.7];
        return (
          <mesh key={row} position={pos} receiveShadow castShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={row % 2 ? '#4b5354' : '#677070'} roughness={0.9} />
          </mesh>
        );
      })}
      <instancedMesh ref={bodies} args={[null, null, count]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors roughness={0.72} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[null, null, count]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial vertexColors roughness={0.78} />
      </instancedMesh>
    </group>
  );
}

function StadiumRoof() {
  return (
    <group>
      <mesh position={[0, 4.55, -12.15]} rotation={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[30.8, 0.22, 3.0]} />
        <meshStandardMaterial color="#111b22" metalness={0.25} roughness={0.48} />
      </mesh>
      <mesh position={[0, 4.55, 12.15]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[30.8, 0.22, 3.0]} />
        <meshStandardMaterial color="#111b22" metalness={0.25} roughness={0.48} />
      </mesh>
      <mesh position={[-17.3, 4.3, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[3.0, 0.22, 22.2]} />
        <meshStandardMaterial color="#111b22" metalness={0.25} roughness={0.48} />
      </mesh>
      <mesh position={[17.3, 4.3, 0]} rotation={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[3.0, 0.22, 22.2]} />
        <meshStandardMaterial color="#111b22" metalness={0.25} roughness={0.48} />
      </mesh>
      {[-10, -5, 0, 5, 10].map((x) => (
        <mesh key={x} position={[x, 4.2, -11.05]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 2.6]} />
          <meshStandardMaterial color="#d8e7ef" emissive="#a8e9ff" emissiveIntensity={0.18} />
        </mesh>
      ))}
      {[-10, -5, 0, 5, 10].map((x) => (
        <mesh key={x} position={[x, 4.2, 11.05]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 2.6]} />
          <meshStandardMaterial color="#d8e7ef" emissive="#a8e9ff" emissiveIntensity={0.18} />
        </mesh>
      ))}
    </group>
  );
}

function LedBoards() {
  const boardColor = '#061017';
  const textColor = '#7dfad5';
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0.42, side * 7.32]}>
          <mesh>
            <boxGeometry args={[23.8, 0.58, 0.08]} />
            <meshStandardMaterial color={boardColor} emissive="#0b4f5a" emissiveIntensity={0.35} roughness={0.45} />
          </mesh>
          <Text position={[0, 0.05, side * -0.06]} rotation={[0, side > 0 ? Math.PI : 0, 0]} fontSize={0.34} color={textColor} anchorX="center">
            FOOTBALL IQ  •  MATCH MODE  •  QUIZ ARENA
          </Text>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 12.35, 0.42, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[13.8, 0.58, 0.08]} />
            <meshStandardMaterial color={boardColor} emissive="#1b2d7a" emissiveIntensity={0.34} roughness={0.45} />
          </mesh>
          <Text position={[0, 0.05, side * 0.06]} rotation={[0, side > 0 ? Math.PI : 0, 0]} fontSize={0.32} color="#9ee8ff" anchorX="center">
            eFOOTBALL IQ
          </Text>
        </group>
      ))}
    </group>
  );
}

function StadiumBowl() {
  return (
    <>
      <StadiumRoof />
      <Stand side="north" />
      <Stand side="south" />
      <Stand side="east" />
      <Stand side="west" />
      <LedBoards />
    </>
  );
}

// Floodlight towers: physical pole and lamp head with a real spotlight aimed at midfield.
function FloodlightTower({ position }) {
  const light = useRef();
  const target = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    target.position.set(0, 0, 0);
    if (light.current) light.current.target = target;
  }, [target]);

  return (
    <>
      <primitive object={target} />
      <group position={position}>
        <mesh position={[0, 3.4, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 6.8, 10]} />
          <meshStandardMaterial color="#9fa9aa" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 6.95, 0]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.36, 0.5]} />
          <meshStandardMaterial color="#e8f5ff" emissive="#c7f5ff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 3.75, 0]}>
          <coneGeometry args={[2.4, 6.3, 32, 1, true]} />
          <meshBasicMaterial color="#dff8ff" transparent opacity={0.075} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <spotLight ref={light} position={[0, 6.9, 0]} angle={0.43} penumbra={0.72} intensity={72} color="#eefcff" castShadow />
      </group>
    </>
  );
}

function StadiumLights() {
  return (
    <>
      <FloodlightTower position={[-15.2, 0, -10.4]} />
      <FloodlightTower position={[15.2, 0, -10.4]} />
      <FloodlightTower position={[-15.2, 0, 10.4]} />
      <FloodlightTower position={[15.2, 0, 10.4]} />
      <pointLight position={[0, 5.2, 0]} intensity={8} color="#7dfad5" />
    </>
  );
}

// Striped turf: separate plane strips create real mowed bands instead of one flat material.
function StripedTurf() {
  const stripes = 12;
  return (
    <group>
      {Array.from({ length: stripes }).map((_, index) => (
        <mesh
          key={index}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, -pitchWidth / 2 + (index + 0.5) * (pitchWidth / stripes)]}
        >
          <planeGeometry args={[pitchLength, pitchWidth / stripes + 0.02]} />
          <meshStandardMaterial color={index % 2 ? '#0a7a43' : '#138b4a'} roughness={0.92} />
        </mesh>
      ))}
      {Array.from({ length: 70 }).map((_, index) => (
        <mesh
          key={`grain-${index}`}
          rotation={[-Math.PI / 2, 0, seeded(index) * 0.08 - 0.04]}
          position={[-10.6 + seeded(index + 4) * 21.2, 0.012, -6.1 + seeded(index + 9) * 12.2]}
        >
          <planeGeometry args={[0.9 + seeded(index + 2) * 1.4, 0.012]} />
          <meshBasicMaterial color={seeded(index + 6) > 0.5 ? '#b9ffd1' : '#063d27'} transparent opacity={0.13} />
        </mesh>
      ))}
    </group>
  );
}

// Low-poly footballer: progress-driven run with a dribbled ball at his feet.
function PlayerRunner({ progress, lastAnswer, hidden }) {
  const group = useRef();
  const leftLeg = useRef();
  const rightLeg = useRef();
  const ball = useRef();
  const jersey = useRef();
  const target = useMemo(() => new THREE.Vector3(), []);
  const current = useMemo(() => new THREE.Vector3(-9.6, 0, 0), []);
  const green = useMemo(() => new THREE.Color('#27d17f'), []);
  const red = useMemo(() => new THREE.Color('#ff445c'), []);

  useFrame(({ clock }, delta) => {
    if (hidden) return;
    target.set(-9.6 + progress * 19.2, 0, 0);
    current.lerp(target, 1 - Math.pow(0.001, delta));
    group.current.position.copy(current);
    const stride = Math.sin(clock.elapsedTime * 8.5) * 0.65;
    leftLeg.current.rotation.x = stride;
    rightLeg.current.rotation.x = -stride;
    ball.current.position.set(0.42 + Math.sin(clock.elapsedTime * 7.5) * 0.08, 0.18, Math.sin(clock.elapsedTime * 4.2) * 0.2);
    ball.current.rotation.x += delta * 7;
    ball.current.rotation.z -= delta * 5;
    jersey.current.color.lerp(lastAnswer === 'wrong' ? red : green, 1 - Math.pow(0.02, delta));
  });

  if (hidden) return null;

  return (
    <group ref={group} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.68, 4, 8]} />
        <meshStandardMaterial ref={jersey} color="#27d17f" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.47, 0]} castShadow>
        <sphereGeometry args={[0.23, 14, 10]} />
        <meshStandardMaterial color="#f0c69b" roughness={0.7} />
      </mesh>
      <mesh ref={leftLeg} position={[0.1, 0.42, -0.13]} castShadow>
        <boxGeometry args={[0.16, 0.62, 0.16]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.72} />
      </mesh>
      <mesh ref={rightLeg} position={[0.1, 0.42, 0.13]} castShadow>
        <boxGeometry args={[0.16, 0.62, 0.16]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.72} />
      </mesh>
      <mesh ref={ball} position={[0.43, 0.18, 0]} castShadow>
        <icosahedronGeometry args={[0.18, 1]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 28]} />
        <meshBasicMaterial color="#05110f" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

// Referee: raises a visible card whenever the last answer was wrong.
function Referee({ lastAnswer }) {
  const arm = useRef();
  const card = useRef();
  const cardScale = useRef(0);

  useFrame((_, delta) => {
    const target = lastAnswer === 'wrong' ? 1 : 0;
    cardScale.current = THREE.MathUtils.lerp(cardScale.current, target, 1 - Math.pow(0.015, delta));
    arm.current.rotation.z = THREE.MathUtils.lerp(arm.current.rotation.z, target ? -1.85 : -0.2, 0.14);
    arm.current.rotation.x = THREE.MathUtils.lerp(arm.current.rotation.x, target ? -0.25 : 0, 0.14);
    card.current.scale.setScalar(cardScale.current);
  });

  return (
    <group position={[-2.8, 0, -pitchWidth / 2 - 0.8]} rotation={[0, 0.1, 0]}>
      <mesh position={[0, 0.82, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.52, 4, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.27, 0]} castShadow>
        <sphereGeometry args={[0.17, 12, 8]} />
        <meshStandardMaterial color="#d7ad82" />
      </mesh>
      <mesh ref={arm} position={[0.2, 1.04, 0]} castShadow>
        <boxGeometry args={[0.12, 0.56, 0.1]} />
        <meshStandardMaterial color="#d7ad82" />
        <mesh ref={card} position={[0, 0.36, 0]}>
          <boxGeometry args={[0.26, 0.36, 0.025]} />
          <meshStandardMaterial color="#ffd447" emissive="#ffd447" emissiveIntensity={0.25} />
        </mesh>
      </mesh>
    </group>
  );
}

function PulseCone({ position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const s = 0.82 + Math.sin(clock.elapsedTime * 3.8 + position[0]) * 0.16;
    ref.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={ref} position={position} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.22, 0.55, 18]} />
      <meshStandardMaterial color="#54e6ff" emissive="#38dfff" emissiveIntensity={0.75} transparent opacity={0.86} />
    </mesh>
  );
}

// Visible hints for clickable spatial questions, with neutral colors regardless of correctness.
function SpatialZones({ question, onPick, disabled }) {
  if (!question?.type || question.type !== 'spatial' || disabled) return null;

  const handlePick = (zone) => (event) => {
    event.stopPropagation();
    onPick(zone === question.spatial.validZone, zone);
  };

  return (
    <group>
      {question.spatial.validZone === 'touchline' && (
        <>
          <PulseCone position={[-4.2, 0.55, -pitchWidth / 2 - 0.05]} />
          <PulseCone position={[4.2, 0.55, pitchWidth / 2 + 0.05]} />
          <PulseCone position={[8.7, 0.55, 0]} />
          <mesh position={[0, 0.08, -pitchWidth / 2 - 0.05]} onClick={handlePick('touchline')}>
            <boxGeometry args={[pitchLength, 0.12, 1.55]} />
            <meshBasicMaterial color="#58f7ff" transparent opacity={0.18} />
          </mesh>
          <mesh position={[0, 0.08, pitchWidth / 2 + 0.05]} onClick={handlePick('touchline')}>
            <boxGeometry args={[pitchLength, 0.12, 1.55]} />
            <meshBasicMaterial color="#58f7ff" transparent opacity={0.18} />
          </mesh>
          <mesh position={[8.7, 0.08, 0]} onClick={handlePick('goalMouth')}>
            <boxGeometry args={[2.4, 0.08, 3]} />
            <meshBasicMaterial color="#58f7ff" transparent opacity={0.13} />
          </mesh>
        </>
      )}
      {question.spatial.validZone === 'onside' && (
        <>
          <Line points={[[3.2, -pitchWidth / 2], [3.2, pitchWidth / 2]]} color="#fff8a5" width={0.055} />
          <PulseCone position={[-0.4, 0.55, -2.5]} />
          <PulseCone position={[6.9, 0.55, 2.2]} />
          <mesh position={[-0.4, 0.08, 0]} onClick={handlePick('onside')}>
            <boxGeometry args={[7.2, 0.08, pitchWidth]} />
            <meshBasicMaterial color="#58f7ff" transparent opacity={0.16} />
          </mesh>
          <mesh position={[6.9, 0.08, 0]} onClick={handlePick('offside')}>
            <boxGeometry args={[7.4, 0.08, pitchWidth]} />
            <meshBasicMaterial color="#58f7ff" transparent opacity={0.1} />
          </mesh>
        </>
      )}
      {question.spatial.validZone === 'penaltyArea' && (
        <>
          <PulseCone position={[8.6, 0.55, -2.3]} />
          <PulseCone position={[6.4, 0.55, 0]} />
          <mesh position={[8.6, 0.08, 0]} onClick={handlePick('penaltyArea')}>
            <boxGeometry args={[3.7, 0.08, 7.6]} />
            <meshBasicMaterial color="#58f7ff" transparent opacity={0.16} />
          </mesh>
          <mesh position={[6.4, 0.1, 0]} onClick={handlePick('penaltySpot')}>
            <cylinderGeometry args={[0.45, 0.45, 0.08, 32]} />
            <meshBasicMaterial color="#58f7ff" transparent opacity={0.17} />
          </mesh>
        </>
      )}
      <Text position={[0, 0.22, -7.9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.52} color="#eafff7" anchorX="center">
        {question.spatial.prompt}
      </Text>
    </group>
  );
}

function CameraFacingText({ position, children, fontSize = 0.28, color = '#ffffff', opacity = 1 }) {
  const ref = useRef();
  const { camera } = useThree();

  useFrame(() => {
    ref.current.quaternion.copy(camera.quaternion);
  });

  return (
    <Text ref={ref} position={position} fontSize={fontSize} color={color} anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#07100f">
      <meshBasicMaterial color={color} transparent opacity={opacity} />
      {children}
    </Text>
  );
}

function NamedPlayer({ name, position, color = '#27d17f' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.54, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.07, 0]} castShadow>
        <sphereGeometry args={[0.17, 12, 8]} />
        <meshStandardMaterial color="#d7ad82" roughness={0.72} />
      </mesh>
      <mesh position={[-0.1, 0.28, 0]} castShadow>
        <boxGeometry args={[0.12, 0.42, 0.12]} />
        <meshStandardMaterial color="#f6f7fb" />
      </mesh>
      <mesh position={[0.1, 0.28, 0]} castShadow>
        <boxGeometry args={[0.12, 0.42, 0.12]} />
        <meshStandardMaterial color="#f6f7fb" />
      </mesh>
      <CameraFacingText position={[0, 1.48, 0]} fontSize={0.17} color="#faff7a" opacity={0.68}>
        {name}
      </CameraFacingText>
    </group>
  );
}

function PassingSquad({ hidden }) {
  const ball = useRef();
  const players = useMemo(
    () => [
      { name: 'Arpita', position: [-5.2, 0, -2.5], color: '#27d17f' },
      { name: 'Tanvi', position: [-2.8, 0, 1.9], color: '#37a2ff' },
      { name: 'Honnesh', position: [-0.2, 0, -2.7], color: '#f6cf46' },
      { name: 'Anujith', position: [2.3, 0, 2.3], color: '#ff6b4a' },
      { name: 'Deepanshu', position: [5.1, 0, -1.7], color: '#9b8cff' },
      { name: 'Poonam', position: [-6.7, 0, 2.0], color: '#f472b6' },
      { name: 'Chandani', position: [-1.1, 0, 4.1], color: '#2dd4bf' },
      { name: 'Taniya', position: [3.6, 0, -4.0], color: '#84cc16' },
      { name: 'Harsha', position: [6.6, 0, 2.8], color: '#60a5fa' }
    ],
    []
  );

  useFrame(({ clock }) => {
    if (hidden || !ball.current) return;
    const passTime = 1.4;
    const raw = clock.elapsedTime / passTime;
    const index = Math.floor(raw) % players.length;
    const nextIndex = (index + 1) % players.length;
    const t = raw - Math.floor(raw);
    const start = players[index].position;
    const end = players[nextIndex].position;
    const arc = Math.sin(t * Math.PI) * 0.42;
    ball.current.position.set(
      THREE.MathUtils.lerp(start[0], end[0], t),
      0.23 + arc,
      THREE.MathUtils.lerp(start[2], end[2], t)
    );
    ball.current.rotation.x += 0.08;
    ball.current.rotation.z -= 0.11;
  });

  if (hidden) return null;

  return (
    <group>
      {players.map((player) => (
        <NamedPlayer key={player.name} {...player} />
      ))}
      <mesh ref={ball} position={[-5.2, 0.23, -2.5]} castShadow>
        <icosahedronGeometry args={[0.15, 1]} />
        <meshStandardMaterial color="#f8fbff" roughness={0.35} />
      </mesh>
    </group>
  );
}

// Final mini penalty shootout: click a goal target, animate the shot, and submit correctness.
function PenaltyShootout({ question, onPick, disabled }) {
  const ball = useRef();
  const keeper = useRef();
  const [shot, setShot] = useState(null);
  const targets = question?.penalty?.targets || [];

  useFrame((_, delta) => {
    if (!shot || !ball.current) return;
    ball.current.position.lerp(shot.target, 1 - Math.pow(0.002, delta));
    ball.current.scale.lerp(new THREE.Vector3(0.55, 0.55, 0.55), 0.05);
    keeper.current.position.lerp(new THREE.Vector3(10.8, 0, shot.target.z * 0.55), 0.08);
    keeper.current.rotation.x = THREE.MathUtils.lerp(keeper.current.rotation.x, shot.correct ? 0.1 : 0.55, 0.08);
  });

  if (question?.type !== 'penalty') return null;

  const choose = (target) => (event) => {
    event.stopPropagation();
    if (disabled || shot) return;
    const correct = target.id === question.penalty.correctTarget;
    const targetVector = new THREE.Vector3(10.92, target.y, target.z);
    setShot({ target: targetVector, correct });
    onPick(correct, target.id);
  };

  return (
    <group>
      <Text position={[5.7, 0.25, -5.8]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#eafff7" anchorX="center">
        Pick the best shootout target.
      </Text>
      <mesh ref={ball} position={[4.9, 0.22, 0]} castShadow>
        <icosahedronGeometry args={[0.24, 1]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.35} />
      </mesh>
      <group ref={keeper} position={[10.8, 0, 0]}>
        <mesh position={[0, 0.82, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.62, 4, 8]} />
          <meshStandardMaterial color="#ff8f3f" roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 8]} />
          <meshStandardMaterial color="#d7ad82" />
        </mesh>
      </group>
      {targets.map((target) => (
        <group key={target.id}>
          <mesh position={[10.72, target.y, target.z]} rotation={[0, Math.PI / 2, 0]} onClick={choose(target)}>
            <planeGeometry args={[1.45, 1.2]} />
            <meshStandardMaterial color="#54e6ff" emissive="#38dfff" emissiveIntensity={0.95} transparent opacity={disabled || shot ? 0.26 : 0.72} />
          </mesh>
          <mesh position={[10.7, target.y, target.z]} rotation={[0, Math.PI / 2, 0]} onClick={choose(target)}>
            <ringGeometry args={[0.34, 0.42, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={disabled || shot ? 0.28 : 0.88} side={THREE.DoubleSide} />
          </mesh>
          <CameraFacingText position={[10.45, target.y - 0.52, target.z]} fontSize={0.16}>
            {target.label}
          </CameraFacingText>
        </group>
      ))}
    </group>
  );
}

// Finish-screen payoff: instanced confetti burst that tumbles down around the right goal.
function FinishConfetti({ finished }) {
  const confetti = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pieces = useMemo(() => {
    const count = 120;
    return Array.from({ length: count }).map((_, index) => ({
      x: 8.5 + seeded(index + 1) * 5,
      y: 2.4 + seeded(index + 20) * 4.5,
      z: -3.1 + seeded(index + 40) * 6.2,
      speed: 0.45 + seeded(index + 80) * 0.9,
      spin: seeded(index + 100) * Math.PI * 2,
      color: new THREE.Color(confettiPalette[index % confettiPalette.length])
    }));
  }, []);

  useEffect(() => {
    if (!confetti.current) return;
    pieces.forEach((piece, index) => confetti.current.setColorAt(index, piece.color));
    confetti.current.instanceColor.needsUpdate = true;
  }, [pieces]);

  useFrame(({ clock }) => {
    if (!finished || !confetti.current) return;
    pieces.forEach((piece, index) => {
      const fall = (clock.elapsedTime * piece.speed) % 5.6;
      dummy.position.set(piece.x, Math.max(0.45, piece.y - fall), piece.z);
      dummy.rotation.set(piece.spin + clock.elapsedTime * 2.2, piece.spin * 0.5, clock.elapsedTime * 3 + piece.spin);
      dummy.scale.setScalar(0.32);
      dummy.updateMatrix();
      confetti.current.setMatrixAt(index, dummy.matrix);
    });
    confetti.current.instanceMatrix.needsUpdate = true;
  });

  if (!finished) return null;

  return (
    <instancedMesh ref={confetti} args={[null, null, pieces.length]}>
      <planeGeometry args={[0.16, 0.07]} />
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function CameraRig({ difficulty, finished, penaltyMode }) {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const hard = difficulty === 'hard';
    const t = clock.elapsedTime;
    let target = hard ? new THREE.Vector3(1.2, 5.2, 8.6) : new THREE.Vector3(-0.5, 6.4, 10.4);
    let lookAt = center;
    if (penaltyMode) {
      target = new THREE.Vector3(3.1, 1.75, 0);
      lookAt = new THREE.Vector3(10.8, 0.85, 0);
    } else if (finished) {
      target = new THREE.Vector3(7.6, 3.1, 5.7);
      lookAt = new THREE.Vector3(10.6, 0.85, 0);
    } else {
      target.x += Math.sin(t * 0.28) * 0.5;
    }
    camera.position.lerp(target, penaltyMode || finished ? 0.055 : 0.025);
    camera.lookAt(lookAt);
  });

  return null;
}

function Pitch({ progress, question, onSpatialPick, spatialDisabled, lastAnswer, finished }) {
  const penaltyMode = question?.type === 'penalty' && !finished;

  return (
    <group>
      <StripedTurf />
      <RectLine x1={-pitchLength / 2} x2={pitchLength / 2} z1={-pitchWidth / 2} z2={pitchWidth / 2} />
      <Line points={[[0, -pitchWidth / 2], [0, pitchWidth / 2]]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.28, 1.34, 72]} />
        <meshBasicMaterial color="#f7fff4" />
      </mesh>
      <RectLine x1={-pitchLength / 2} x2={-7.3} z1={-3.8} z2={3.8} />
      <RectLine x1={7.3} x2={pitchLength / 2} z1={-3.8} z2={3.8} />
      <RectLine x1={-pitchLength / 2} x2={-9.6} z1={-2.2} z2={2.2} />
      <RectLine x1={9.6} x2={pitchLength / 2} z1={-2.2} z2={2.2} />
      <Goal x={-11.25} />
      <Goal x={11.25} />
      <SpatialZones question={question} onPick={onSpatialPick} disabled={spatialDisabled} />
      <PenaltyShootout question={question} onPick={onSpatialPick} disabled={spatialDisabled} />
      <PassingSquad hidden={penaltyMode || finished} />
      <PlayerRunner progress={progress} lastAnswer={lastAnswer} hidden={penaltyMode} />
      <Referee lastAnswer={lastAnswer} />
      <FinishConfetti finished={finished} />
    </group>
  );
}

export default function Scene3D({ progress, question, onSpatialPick, spatialDisabled, lastAnswer, finished = false }) {
  const penaltyMode = question?.type === 'penalty' && !finished;

  return (
    <Canvas shadows camera={{ position: [-1, 6.5, 10.5], fov: 48 }} dpr={[1, 1.8]}>
      <color attach="background" args={['#07100f']} />
      <fog attach="fog" args={['#07100f', 18, 44]} />
      <ambientLight intensity={0.38} />
      <StadiumLights />
      <StadiumBowl />
      <Pitch
        progress={progress}
        question={question}
        onSpatialPick={onSpatialPick}
        spatialDisabled={spatialDisabled}
        lastAnswer={lastAnswer}
        finished={finished}
      />
      <CameraRig difficulty={question?.difficulty} finished={finished} penaltyMode={penaltyMode} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enabled={!penaltyMode && !finished}
        minPolarAngle={0.8}
        maxPolarAngle={1.25}
        autoRotate={!penaltyMode && !finished}
        autoRotateSpeed={0.28}
      />
    </Canvas>
  );
}
