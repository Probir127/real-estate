import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Grid, Environment } from '@react-three/drei';
import { FaCube, FaSun, FaMoon, FaRedo, FaImage, FaExpand } from 'react-icons/fa';
import './Property3DView.css';

/* ─── Constants ──────────────────────────────────────────────── */

const FLOOR_LEVELS = [
  { id: 0, label: 'Ground', height: 0 },
  { id: 1, label: 'Main', height: 2.8 },
  { id: 2, label: 'Upper', height: 5.6 },
];

const ROOM_PALETTE = [
  '#c9eadf', // Living  – soft mint
  '#e9d59b', // Dining  – warm sand
  '#d9e7f4', // Bedroom – sky blue
  '#f0d4c7', // Kitchen – blush
  '#d6d4f0', // Bathroom – lavender
  '#dff0d4', // Study   – pale green
  '#f0e4d4', // Storage – cream
  '#f4d4e6', // Hallway – pink
];

const DEFAULT_ROOMS = [
  { name: 'Living Room',  x: -1.8, z: -1.2, w: 3.8, d: 2.8 },
  { name: 'Dining Room',  x:  2.2, z: -1.2, w: 2.8, d: 2.8 },
  { name: 'Bedroom',      x: -1.8, z:  1.8, w: 3.8, d: 2.6 },
  { name: 'Kitchen',      x:  2.2, z:  1.8, w: 2.8, d: 2.6 },
];

/* ─── Helpers ────────────────────────────────────────────────── */

function sizeToMeters(size) {
  if (size === 'small')  return { w: 2.4, d: 2.0 };
  if (size === 'large')  return { w: 5.0, d: 4.0 };
  return { w: 3.5, d: 3.0 }; // medium
}

function buildRoomsFromData(layoutData, area) {
  if (!layoutData?.rooms?.length) return null;

  const rooms = layoutData.rooms;
  const cols = Math.ceil(Math.sqrt(rooms.length));
  const scale = Math.min(Math.max(Math.sqrt(Math.max(Number(area) || 1600, 900)) / 38, 1), 1.35);

  return rooms.map((room, i) => {
    const { w, d } = sizeToMeters(room.size || 'medium');
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      name: room.name || `Room ${i + 1}`,
      x: (col - cols / 2) * (w + 0.3) * scale + (w * scale) / 2,
      z: (row - 1) * (d + 0.3) * scale,
      w: w * scale,
      d: d * scale,
      description: room.description || '',
    };
  });
}

/* ─── Room Mesh Component ────────────────────────────────────── */

function RoomMesh({ room, index, floorY, isSelected, onSelect, daylight }) {
  const meshRef = useRef();
  const color = ROOM_PALETTE[index % ROOM_PALETTE.length];
  const wallHeight = 2.4;

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.04 : 1;
      meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.1;
      meshRef.current.scale.z += (targetScale - meshRef.current.scale.z) * 0.1;
    }
  });

  return (
    <group position={[room.x, floorY, room.z]}>
      {/* Floor slab */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(index); }}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[room.w, 0.12, room.d]} />
        <meshStandardMaterial
          color={isSelected ? '#0b5d4e' : color}
          roughness={0.82}
          metalness={0.04}
          opacity={isSelected ? 0.92 : 1}
          transparent={isSelected}
        />
      </mesh>

      {/* Walls (4 sides, low height) */}
      {[
        [0,               wallHeight / 2, -room.d / 2, room.w, wallHeight, 0.08],
        [0,               wallHeight / 2,  room.d / 2, room.w, wallHeight, 0.08],
        [-room.w / 2,     wallHeight / 2,  0,          0.08,   wallHeight, room.d],
        [ room.w / 2,     wallHeight / 2,  0,          0.08,   wallHeight, room.d],
      ].map(([wx, wy, wz, ww, wh, wd], wi) => (
        <mesh key={wi} position={[wx, wy, wz]} receiveShadow>
          <boxGeometry args={[ww, wh, wd]} />
          <meshStandardMaterial
            color="#dce9e4"
            roughness={0.9}
            transparent
            opacity={daylight ? 0.28 : 0.18}
          />
        </mesh>
      ))}

      {/* Room label */}
      <Text
        position={[0, 0.22, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={Math.min(room.w, room.d) * 0.14}
        color={isSelected ? '#ffffff' : '#0b5d4e'}
        anchorX="center"
        anchorY="middle"
        maxWidth={room.w * 0.85}
      >
        {room.name}
      </Text>

      {/* Outline: thin top-border ring using a box wireframe */}
      <mesh>
        <boxGeometry args={[room.w, 0.14, room.d]} />
        <meshBasicMaterial color="#0b5d4e" wireframe transparent opacity={isSelected ? 0.9 : 0.4} />
      </mesh>
    </group>
  );
}

/* ─── Floor Platform ─────────────────────────────────────────── */

function FloorPlatform({ rooms, floorY }) {
  const allX = rooms.map(r => [r.x - r.w / 2, r.x + r.w / 2]).flat();
  const allZ = rooms.map(r => [r.z - r.d / 2, r.z + r.d / 2]).flat();
  const padX = Math.max(...allX) - Math.min(...allX) + 1.2;
  const padZ = Math.max(...allZ) - Math.min(...allZ) + 1.2;

  return (
    <mesh position={[0, floorY - 0.12, 0]} receiveShadow>
      <boxGeometry args={[padX, 0.1, padZ]} />
      <meshStandardMaterial color="#f0f4f2" roughness={0.95} metalness={0} />
    </mesh>
  );
}

/* ─── Scene ──────────────────────────────────────────────────── */

function Scene({ rooms, floorY, daylight, selectedRoom, onSelectRoom }) {
  return (
    <>
      {/* Set WebGL background so it's not black */}
      <color attach="background" args={[daylight ? '#f0f5f2' : '#0d1a2a']} />

      <ambientLight intensity={daylight ? 1.8 : 0.6} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={daylight ? 3.2 : 0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {!daylight && (
        <>
          <pointLight position={[-3, 3, -2]} intensity={1.2} color="#ffd580" />
          <pointLight position={[3, 3, 2]} intensity={0.8} color="#80c8ff" />
        </>
      )}

      <FloorPlatform rooms={rooms} floorY={floorY} />

      {rooms.map((room, i) => (
        <RoomMesh
          key={i}
          room={room}
          index={i}
          floorY={floorY + 0.06}
          isSelected={selectedRoom === i}
          onSelect={onSelectRoom}
          daylight={daylight}
        />
      ))}

      <Grid
        args={[18, 18]}
        position={[0, floorY - 0.17, 0]}
        cellColor="#c8d9d4"
        sectionColor="#a8c5be"
        cellThickness={0.5}
        sectionThickness={1}
        fadeDistance={22}
        fadeStrength={1}
        infiniteGrid
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={5}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, floorY + 0.5, 0]}
        makeDefault
      />
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export default function Property3DView({ property, initialViewMode = '3d' }) {
  const [floor, setFloor] = useState(1);
  const [daylight, setDaylight] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewMode, setViewMode] = useState(initialViewMode); // '3d' | '2d'

  // Sync if parent tab changes view mode
  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  const floorHeight = FLOOR_LEVELS[floor]?.height ?? 0;

  // Find floor plan image (uploaded with alt_text containing 'floor_plan' or 'floorplan')
  const floorPlanImage = useMemo(() => {
    const imgs = property?.images || [];
    return imgs.find(img =>
      img.alt_text?.toLowerCase().includes('floor') ||
      img.alt_text?.toLowerCase().includes('plan') ||
      img.alt_text?.toLowerCase().includes('layout')
    ) || null;
  }, [property?.images]);

  // Build rooms from layout_data or use smart defaults
  const rooms = useMemo(() => {
    const fromData = buildRoomsFromData(property?.layout_data, property?.area_sqft);
    if (fromData) return fromData;

    // Smart defaults: scale by area & bedrooms
    const area = Math.max(Number(property?.area_sqft) || 1600, 900);
    const scale = Math.min(Math.max(Math.sqrt(area) / 38, 1), 1.35);
    const beds = Number(property?.bedrooms) || 2;

    const base = DEFAULT_ROOMS.map(r => ({
      ...r,
      x: r.x * scale,
      z: r.z * scale,
      w: r.w * scale,
      d: r.d * scale,
      description: '',
    }));

    // Add extra bedrooms if needed
    for (let i = 1; i < Math.min(beds, 4); i++) {
      base.push({
        name: `Bedroom ${i + 1}`,
        x: (-1.8 + i * 3.2) * scale,
        z: 4.6 * scale,
        w: 3.2 * scale,
        d: 2.5 * scale,
        description: '',
      });
    }
    return base;
  }, [property]);

  const selectedRoomData = selectedRoom !== null ? rooms[selectedRoom] : null;
  const hasLayoutData = Boolean(property?.layout_data?.rooms?.length);
  const has2DPlan = Boolean(floorPlanImage);

  const handleReset = () => {
    setSelectedRoom(null);
    setFloor(1);
  };

  return (
    <section className="pd-3d-card" aria-label="Interactive 3D property layout">
      {/* ── Header ── */}
      <div className="pd-3d-card__header">
        <div>
          <p className="pd-3d-card__eyebrow"><FaCube /> Space Planner</p>
          <h2 className="pd-3d-card__title">
            {viewMode === '2d' ? 'Floor Plan' : 'See the layout in 3D'}
          </h2>
          <p className="pd-3d-card__sub">
            {viewMode === '3d'
              ? 'Drag to orbit · Scroll to zoom · Click a room for details'
              : 'Uploaded floor plan by the listing agent'}
          </p>
        </div>

        <div className="pd-3d-header-actions">
          {has2DPlan && (
            <button
              type="button"
              className={`pd-3d-view-pill ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => setViewMode(v => v === '2d' ? '3d' : '2d')}
              title={viewMode === '2d' ? 'Switch to 3D view' : 'Switch to 2D floor plan'}
            >
              {viewMode === '2d' ? <FaCube /> : <FaImage />}
              {viewMode === '2d' ? '3D View' : '2D Plan'}
            </button>
          )}
          {viewMode === '3d' && (
            <button
              type="button"
              className="pd-3d-icon-btn"
              onClick={handleReset}
              aria-label="Reset view"
              title="Reset view"
            >
              <FaRedo />
            </button>
          )}
        </div>
      </div>

      {/* ── 2D Floor Plan Image ── */}
      {viewMode === '2d' && has2DPlan && (
        <div className="pd-3d-floorplan-img-wrap">
          <img
            src={floorPlanImage.image_url}
            alt={floorPlanImage.alt_text || 'Floor plan'}
            className="pd-3d-floorplan-img"
          />
        </div>
      )}

      {/* ── 3D Canvas ── */}
      {viewMode === '3d' && (
        <div className="pd-3d-canvas">
          <Canvas
            frameloop="always"
            camera={{ position: [10, 9, 11], fov: 34 }}
            shadows
            gl={{ antialias: true, alpha: false }}
            onClick={(e) => {
              // Click on empty space deselects
              if (e.target === e.currentTarget) setSelectedRoom(null);
            }}
          >
            <Suspense fallback={null}>
              <Scene
                rooms={rooms}
                floorY={floorHeight}
                daylight={daylight}
                selectedRoom={selectedRoom}
                onSelectRoom={(i) => setSelectedRoom(prev => prev === i ? null : i)}
              />
            </Suspense>
          </Canvas>

          {/* No layout data notice */}
          {!hasLayoutData && (
            <div className="pd-3d-default-notice">
              <FaCube /> Auto-generated layout based on property specs
            </div>
          )}
        </div>
      )}

      {/* ── Room Info Panel ── */}
      {selectedRoomData && viewMode === '3d' && (
        <div className="pd-3d-room-info" role="status" aria-live="polite">
          <div className="pd-3d-room-info__pill" style={{ background: ROOM_PALETTE[selectedRoom % ROOM_PALETTE.length] }}>
            {selectedRoomData.name}
          </div>
          {selectedRoomData.description ? (
            <p className="pd-3d-room-info__desc">{selectedRoomData.description}</p>
          ) : (
            <p className="pd-3d-room-info__desc pd-3d-room-info__desc--empty">
              ~{Math.round(selectedRoomData.w * selectedRoomData.d * 10.76)} sq ft estimated
            </p>
          )}
          <button
            type="button"
            className="pd-3d-room-info__close"
            onClick={() => setSelectedRoom(null)}
            aria-label="Dismiss room info"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Controls Row ── */}
      {viewMode === '3d' && (
        <div className="pd-3d-controls">
          <div className="pd-3d-floor-tabs" role="tablist" aria-label="Choose floor">
            {FLOOR_LEVELS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={floor === item.id}
                className={floor === item.id ? 'active' : ''}
                onClick={() => { setFloor(item.id); setSelectedRoom(null); }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`pd-3d-light-toggle ${daylight ? 'active' : ''}`}
            onClick={() => setDaylight(v => !v)}
            aria-pressed={daylight}
            title="Toggle lighting"
          >
            {daylight ? <FaSun /> : <FaMoon />}
            <span>{daylight ? 'Daylight' : 'Evening'}</span>
          </button>
        </div>
      )}
    </section>
  );
}
