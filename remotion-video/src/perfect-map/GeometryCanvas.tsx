import React, {useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {geoEquirectangular, geoPath} from 'd3-geo';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import {WORLD, RAD, ROUTES, routePoints, capPoint, gorePoint} from './math';
import {EVENTS as T} from './timing';
import {motion} from './Typography';

type Runtime = {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.OrthographicCamera; globe: THREE.Group; sphere: THREE.Mesh; routes: THREE.Mesh[]; cap: THREE.Group; capMesh: THREE.Mesh; capGrid: THREE.LineSegments; plane: THREE.Mesh; peel: THREE.Group; gores: THREE.Mesh[]; goreLines: THREE.LineSegments[]; texture: THREE.CanvasTexture};
const xyz = ([lon, lat]: number[], radius: number) => new THREE.Vector3(radius * Math.cos(lat * RAD) * Math.sin(lon * RAD), radius * Math.sin(lat * RAD), radius * Math.cos(lat * RAD) * Math.cos(lon * RAD));
const gridGeometry = (nu: number, nv: number, point: (u: number, v: number) => number[]) => {
  const vertices: number[] = [], indices: number[] = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) vertices.push(...point(i / nu, j / nv));
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {const a = j * (nu + 1) + i; indices.push(a, a + 1, a + nu + 1, a + 1, a + nu + 2, a + nu + 1);}
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
};
const updateGrid = (geometry: THREE.BufferGeometry, nu: number, nv: number, point: (u: number, v: number) => number[]) => {
  const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {const p = point(i / nu, j / nv); attribute.setXYZ(j * (nu + 1) + i, p[0], p[1], p[2]);}
  attribute.needsUpdate = true; geometry.computeVertexNormals(); geometry.computeBoundingSphere();
};
const wire = (geometry: THREE.BufferGeometry, color: number) => new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({color, transparent: true, opacity: .28}));

export const GeometryCanvas: React.FC = () => {
  const element = useRef<HTMLCanvasElement>(null), runtime = useRef<Runtime | null>(null);
  const frame = useCurrentFrame(); const {fps, width, height} = useVideoConfig();
  useLayoutEffect(() => {
    const renderer = new THREE.WebGLRenderer({canvas: element.current!, alpha: true, antialias: true, preserveDrawingBuffer: true});
    renderer.setSize(width, height, false); renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-960, 960, 540, -540, .1, 4000); camera.position.z = 1800;
    scene.add(new THREE.AmbientLight(0xffffff, 1.5)); const light = new THREE.DirectionalLight(0xfffaf1, 2); light.position.set(-650, 700, 1400); scene.add(light);
    const surface = document.createElement('canvas'); surface.width = 2048; surface.height = 1024;
    const context = surface.getContext('2d')!; context.fillStyle = '#e0eeeb'; context.fillRect(0, 0, 2048, 1024);
    const path = geoPath(geoEquirectangular().scale(2048 / (Math.PI * 2)).translate([1024, 512]), context);
    context.beginPath(); path(WORLD); context.fillStyle = '#9fbea9'; context.fill(); context.strokeStyle = '#6e9784'; context.lineWidth = 1; context.stroke();
    const texture = new THREE.CanvasTexture(surface); texture.colorSpace = THREE.SRGBColorSpace;
    const globe = new THREE.Group(); scene.add(globe);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(238, 96, 64), new THREE.MeshStandardMaterial({map: texture, roughness: 1}));
    sphere.rotation.y = -Math.PI / 2; globe.add(sphere);
    for (let latitude = -60; latitude <= 60; latitude += 30) {
      const points = Array.from({length: 145}, (_, i) => xyz([i * 2.5, latitude], 239)); globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color: 0x6c928b, transparent: true, opacity: .32})));
    }
    const routes = ROUTES.map((route, i) => {const curve = new THREE.CatmullRomCurve3(routePoints(route).map(p => xyz(p, 242))); const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 2.2, 8, false), new THREE.MeshBasicMaterial({color: i === 0 ? 0x427d99 : 0xbf594c})); globe.add(line); return line;});
    const cap = new THREE.Group(); scene.add(cap);
    const capGeometry = gridGeometry(64, 14, (u, v) => capPoint(.95 * v, u * Math.PI * 2, 0));
    const capMesh = new THREE.Mesh(capGeometry, new THREE.MeshStandardMaterial({color: 0x75a99b, side: THREE.DoubleSide, roughness: .85, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1})); cap.add(capMesh);
    const capGrid = wire(capGeometry, 0x21483d); cap.add(capGrid);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(480, 420, 12, 10), new THREE.MeshStandardMaterial({color: 0xd5e6ee, side: THREE.DoubleSide, roughness: 1})); scene.add(plane);
    const peel = new THREE.Group(); scene.add(peel); const gores: THREE.Mesh[] = [], goreLines: THREE.LineSegments[] = [];
    for (let i = 0; i < 8; i++) {
      const center = (i - 3.5) * Math.PI / 4;
      const geometry = gridGeometry(10, 28, (u, v) => gorePoint(center + (u - .5) * Math.PI / 4, (v - .5) * Math.PI, center, i, 0));
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: i % 2 ? 0xe59b45 : 0xeeb666, side: THREE.DoubleSide, roughness: 1, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1}));
      const lines = wire(geometry, 0x855630); peel.add(mesh, lines); gores.push(mesh); goreLines.push(lines);
    }
    runtime.current = {renderer, scene, camera, globe, sphere, routes, cap, capMesh, capGrid, plane, peel, gores, goreLines, texture};
    return () => {scene.traverse(object => {if (object instanceof THREE.Mesh || object instanceof THREE.Line) {object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(m => m.dispose());}}); texture.dispose(); renderer.dispose(); runtime.current = null;};
  }, [width, height]);
  useLayoutEffect(() => {
    const r = runtime.current; if (!r) return; const s = frame / fps;
    const toTheorem = motion(s, T.theorem, T.theorem + 2), toCap = motion(s, T.flatten, T.flatten + 2), toPeel = motion(s, T.peel, T.peel + 2);
    r.globe.visible = s < 72 || s >= T.conclusion;
    const ending = motion(s, T.conclusion, T.final);
    r.globe.position.set(-410 + toTheorem * 20 + ending * 790, -40 - ending * 20, 0);
    r.globe.scale.setScalar((1 - toCap) * (1 - toPeel) + ending);
    r.globe.rotation.set(.13, -.48 + .08 * Math.sin(s * .12), -.08);
    r.routes.forEach((route, i) => {route.visible = s < T.theorem; route.geometry.setDrawRange(0, Math.floor(motion(s, i ? T.secondRoute : T.routes, (i ? T.secondRoute : T.routes) + 2) * 80) * 8 * 6);});
    r.cap.visible = s >= T.flatten && s < T.peel + 2;
    r.cap.position.set(-400, -40, 110); r.cap.scale.setScalar(toCap * (1 - toPeel)); r.cap.rotation.set(-.65 + .3 * motion(s, T.flatten, T.flattenEnd), .18, .04);
    const flatten = motion(s, T.flatten + 2, T.flattenEnd);
    if (r.cap.visible) {updateGrid(r.capMesh.geometry, 64, 14, (u, v) => capPoint(.95 * v, u * Math.PI * 2, flatten)); r.capGrid.geometry.dispose(); r.capGrid.geometry = new THREE.WireframeGeometry(r.capMesh.geometry);}
    r.plane.visible = s >= T.curvature && s < T.peel + 2;
    r.plane.position.set(470, -50, 0); r.plane.rotation.set(-.45 + .04 * Math.sin(s * .15), -.2, -.08); r.plane.scale.setScalar(motion(s, T.curvature, T.curvature + 2) * (1 - toPeel));
    r.peel.visible = s >= T.peel && s < T.choices + 2;
    const spread = motion(s, T.spread, T.spreadEnd), exit = motion(s, T.choices, T.choices + 2);
    r.peel.position.set(0, -50 + exit * 100, 0); r.peel.scale.setScalar(toPeel * (1 - exit)); r.peel.rotation.set(.1 * (1 - spread), .2 * (1 - spread), 0);
    if (r.peel.visible) r.gores.forEach((gore, i) => {
      const center = (i - 3.5) * Math.PI / 4, cut = motion(s, T.cut, T.spread) * 9;
      updateGrid(gore.geometry, 10, 28, (u, v) => {const p = gorePoint(center + (u - .5) * Math.PI / 4, (v - .5) * Math.PI, center, i, spread); p[0] += Math.sin(center) * cut * (1 - spread); p[2] += Math.cos(center) * cut * (1 - spread); return p;});
      r.goreLines[i].geometry.dispose(); r.goreLines[i].geometry = new THREE.WireframeGeometry(gore.geometry);
    });
    r.renderer.render(r.scene, r.camera);
  }, [frame, fps, width, height]);
  return <canvas ref={element} data-geometry aria-label="连续曲面几何演示" style={{position: 'absolute', inset: 0, width: 1920, height: 1080}}/>;
};
