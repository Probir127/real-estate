import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FaCube, FaSun, FaMoon, FaRedo } from 'react-icons/fa';
import './Property3DView.css';

const FLOOR_LEVELS = [
  { id: 0, label: 'Ground floor', height: 0 },
  { id: 1, label: 'Main floor', height: 2.4 },
  { id: 2, label: 'Upper floor', height: 4.8 },
];

function buildFloor(scene, floorHeight, property) {
  const group = new THREE.Group();
  const area = Math.max(Number(property?.area_sqft) || 1600, 900);
  const scale = Math.min(Math.max(Math.sqrt(area) / 38, 1), 1.35);
  const width = 7.2 * scale;
  const depth = 5.1 * scale;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.22, depth),
    new THREE.MeshStandardMaterial({ color: 0xf5f8f6, roughness: 0.9 })
  );
  floor.position.y = floorHeight;
  group.add(floor);

  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.24, depth)),
    new THREE.LineBasicMaterial({ color: 0x0b5d4e, transparent: true, opacity: 0.65 })
  );
  outline.position.y = floorHeight;
  group.add(outline);

  const roomColors = [0xc9eadf, 0xe9d59b, 0xd9e7f4, 0xf0d4c7];
  const rooms = [
    ['Living', [-width * 0.22, -depth * 0.24], [width * 0.48, depth * 0.38]],
    ['Dining', [width * 0.25, -depth * 0.24], [width * 0.38, depth * 0.38]],
    ['Bedroom', [-width * 0.22, depth * 0.22], [width * 0.48, depth * 0.34]],
    ['Kitchen', [width * 0.25, depth * 0.22], [width * 0.38, depth * 0.34]],
  ];

  rooms.forEach(([name, position, size], index) => {
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(size[0], 0.12, size[1]),
      new THREE.MeshStandardMaterial({ color: roomColors[index], roughness: 0.86 })
    );
    room.position.set(position[0], floorHeight + 0.2, position[1]);
    room.userData = { name };
    group.add(room);
  });

  group.position.y = 0;
  scene.add(group);
  return group;
}

export default function Property3DView({ property }) {
  const mountRef = useRef(null);
  const [floor, setFloor] = useState(1);
  const [daylight, setDaylight] = useState(true);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const floorData = FLOOR_LEVELS[floor];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f8f6);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(9, 8, 10);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglUnavailable(true);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = 18;
    controls.target.set(0, 1, 0);

    const ambient = new THREE.HemisphereLight(0xffffff, 0x8aa79b, daylight ? 2.2 : 0.75);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff2ce, daylight ? 3.5 : 0.65);
    sun.position.set(5, 10, 5);
    sun.castShadow = true;
    scene.add(sun);

    const floorGroup = buildFloor(scene, floorData.height, property);
    const grid = new THREE.GridHelper(14, 14, 0xb5d4c9, 0xdce9e4);
    grid.position.y = -0.16;
    scene.add(grid);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      floorGroup.rotation.y += 0.0008;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.domElement.remove();
    };
  }, [property, floorData.height, daylight]);

  if (webglUnavailable) {
    return (
      <section className="pd-3d-card pd-3d-card--unsupported" aria-label="Interactive 3D property layout">
        <div className="pd-3d-card__header">
          <div>
            <p className="pd-3d-card__eyebrow"><FaCube /> Space planner</p>
            <h2 className="pd-3d-card__title">3D layout unavailable</h2>
            <p className="pd-3d-card__sub">Enable hardware acceleration or open this listing in a modern browser to view the interactive layout.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pd-3d-card" aria-label="Interactive 3D property layout">
      <div className="pd-3d-card__header">
        <div>
          <p className="pd-3d-card__eyebrow"><FaCube /> Space planner</p>
          <h2 className="pd-3d-card__title">See the layout in 3D</h2>
          <p className="pd-3d-card__sub">Drag to orbit. Scroll to zoom.</p>
        </div>
        <button
          type="button"
          className="pd-3d-icon-btn"
          onClick={() => setFloor(1)}
          aria-label="Reset to main floor"
          title="Reset view"
        >
          <FaRedo />
        </button>
      </div>

      <div ref={mountRef} className="pd-3d-canvas" />

      <div className="pd-3d-controls">
        <div className="pd-3d-floor-tabs" role="tablist" aria-label="Choose floor">
          {FLOOR_LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={floor === item.id}
              className={floor === item.id ? 'active' : ''}
              onClick={() => setFloor(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`pd-3d-light-toggle ${daylight ? 'active' : ''}`}
          onClick={() => setDaylight((value) => !value)}
          aria-pressed={daylight}
          title="Toggle daylight"
        >
          {daylight ? <FaSun /> : <FaMoon />}
          <span>{daylight ? 'Daylight' : 'Evening'}</span>
        </button>
      </div>
    </section>
  );
}
