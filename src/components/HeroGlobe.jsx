import { useEffect, useRef } from 'react';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineLoop,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from 'three';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const INITIAL_SPIN = -(25 * Math.PI) / 180;
const TILT = 0.4;
const SPIN_SPEED = 0.1;

const CITIES = [
  { lat: 56.9496, lng: 24.1052 }, // Riga
  { lat: 60.1699, lng: 24.9384 }, // Helsinki
  { lat: 51.5072, lng: -0.1276 }, // London
  { lat: 52.52, lng: 13.405 }, // Berlin
  { lat: 40.7128, lng: -74.006 }, // New York
  { lat: 22.5726, lng: 88.3639 }, // Kolkata
  { lat: 19.076, lng: 72.8777 }, // Mumbai
  { lat: 1.3521, lng: 103.8198 }, // Singapore
];

function latLngToPosition(lat, lng) {
  const latRad = lat * (Math.PI / 180);
  const lngRad = lng * (Math.PI / 180);
  return {
    x: Math.cos(latRad) * Math.sin(lngRad),
    y: Math.sin(latRad),
    z: Math.cos(latRad) * Math.cos(lngRad),
  };
}

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

function addGraticule(globeGroup) {
  const material = new LineBasicMaterial({
    color: new Color('#F4EDE0'),
    transparent: true,
    opacity: 0.25,
  });
  const radius = 1.001;
  const count = 96;

  for (let lat = -90; lat <= 90; lat += 15) {
    if (lat === -90 || lat === 90) continue;
    const positions = [];
    for (let i = 0; i < count; i++) {
      const lng = (i / (count - 1)) * 360 - 180;
      const pos = latLngToPosition(lat, lng);
      positions.push(pos.x * radius, pos.y * radius, pos.z * radius);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    globeGroup.add(new Line(geometry, material));
  }

  for (let lng = -180; lng < 180; lng += 15) {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const lat = (i / (count - 1)) * 180 - 90;
      const pos = latLngToPosition(lat, lng);
      positions.push(pos.x * radius, pos.y * radius, pos.z * radius);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    globeGroup.add(new Line(geometry, material));
  }
}

function addMarkers(globeGroup) {
  const geometry = new SphereGeometry(0.012, 12, 12);
  const material = new MeshBasicMaterial({ color: new Color('#FF6B5B') });

  CITIES.forEach((city) => {
    const pos = latLngToPosition(city.lat, city.lng);
    const marker = new Mesh(geometry, material);
    marker.position.set(pos.x * 1.01, pos.y * 1.01, pos.z * 1.01);
    globeGroup.add(marker);
  });
}

function addLand(globeGroup, topology) {
  const land = feature(topology, topology.objects.land);
  const features = land.type === 'FeatureCollection' ? land.features : [land];

  const width = 2048;
  const height = 1024;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const projection = geoEquirectangular().fitSize([width, height], { type: 'Sphere' });
  const path = geoPath().projection(projection).context(ctx);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  features.forEach((item) => {
    ctx.beginPath();
    path(item);
    ctx.fill();
  });

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const isOnLand = (lng, lat) => {
    let x = Math.round(((lng + 180) / 360) * width) % width;
    if (x < 0) x += width;
    const y = Math.max(0, Math.min(height - 1, Math.round(((90 - lat) / 180) * height)));
    return pixels[(y * width + x) * 4] > 128;
  };

  const dotCoordinates = [];
  for (let lat = -90; lat <= 90; lat += 1.1) {
    const latRad = lat * (Math.PI / 180);
    const lngStep = 1.1 / Math.max(0.3, Math.cos(latRad));
    for (let lng = -180; lng < 180; lng += lngStep) {
      if (isOnLand(lng, lat)) dotCoordinates.push([lat, lng]);
    }
  }

  if (dotCoordinates.length > 0) {
    const dotGeometry = new SphereGeometry(0.0045, 4, 4);
    const dotMaterial = new MeshBasicMaterial({ color: new Color('#F4EDE0') });
    const dots = new InstancedMesh(dotGeometry, dotMaterial, dotCoordinates.length);
    const matrix = new Matrix4();

    dotCoordinates.forEach(([lat, lng], index) => {
      const pos = latLngToPosition(lat, lng);
      matrix.makeTranslation(pos.x * 1.001, pos.y * 1.001, pos.z * 1.001);
      dots.setMatrixAt(index, matrix);
    });
    dots.instanceMatrix.needsUpdate = true;
    globeGroup.add(dots);
  }

  const coastMaterial = new LineBasicMaterial({
    color: new Color('#F4EDE0'),
    transparent: true,
    opacity: 0.6,
  });

  function addRing(ring) {
    if (!ring || ring.length < 3) return;
    const positions = [];
    ring.forEach(([lng, lat]) => {
      const pos = latLngToPosition(lat, lng);
      positions.push(pos.x * 1.002, pos.y * 1.002, pos.z * 1.002);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    globeGroup.add(new LineLoop(geometry, coastMaterial));
  }

  features.forEach((item) => {
    const geometry = item.geometry;
    if (!geometry) return;
    if (geometry.type === 'Polygon') {
      addRing(geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon) => addRing(polygon[0]));
    }
  });
}

export default function HeroGlobe({ spinRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !canUseWebGL()) return undefined;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1.04, 1.04, 1.04, -1.04, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    let renderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const initialWidth = container.clientWidth || 1;
    const initialHeight = container.clientHeight || 1;
    renderer.setSize(initialWidth, initialHeight, false);

    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0';
    canvas.style.visibility = 'hidden';
    canvas.style.transition = 'opacity 0.8s ease-out';
    container.appendChild(canvas);

    const oceanGeometry = new SphereGeometry(1, 64, 64);
    const oceanMaterial = new MeshBasicMaterial({ color: new Color('#1B2B4D') });
    scene.add(new Mesh(oceanGeometry, oceanMaterial));

    const globeGroup = new Group();
    globeGroup.rotation.x = TILT;
    globeGroup.rotation.y = INITIAL_SPIN;
    scene.add(globeGroup);

    addGraticule(globeGroup);
    addMarkers(globeGroup);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ready = false;
    let inView = true;
    let running = false;
    let frameId = null;
    let revealFrameId = null;
    let autoSpin = 0;
    let lastTime = 0;
    let cancelled = false;

    function renderFrame(now) {
      if (!running) return;
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      autoSpin += delta * SPIN_SPEED;

      const extra = spinRef && spinRef.current ? spinRef.current.extra : 0;
      globeGroup.rotation.y = INITIAL_SPIN + autoSpin + (Number.isFinite(extra) ? extra : 0);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderFrame);
    }

    function start() {
      if (reducedMotion || running || !ready) return;
      running = true;
      lastTime = performance.now();
      frameId = requestAnimationFrame(renderFrame);
    }

    function stop() {
      running = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stop();
      } else if (inView) {
        start();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
        if (inView && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      const width = Math.round(container.clientWidth);
      const height = Math.round(container.clientHeight);
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      if (ready) renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    (async () => {
      try {
        const world = await import('world-atlas/land-110m.json');
        if (cancelled) return;

        addLand(globeGroup, world.default || world);
        ready = true;
        renderer.render(scene, camera);

        canvas.style.visibility = 'visible';
        revealFrameId = requestAnimationFrame(() => {
          revealFrameId = null;
          canvas.style.opacity = '1';
        });

        if (!reducedMotion && inView && !document.hidden) start();
      } catch {
        // No WebGL scene is shown when the land data cannot be prepared.
      }
    })();

    return () => {
      cancelled = true;
      stop();
      if (revealFrameId !== null) cancelAnimationFrame(revealFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, [spinRef]);

  return <div ref={containerRef} aria-hidden="true" className="relative h-full w-full" />;
}
