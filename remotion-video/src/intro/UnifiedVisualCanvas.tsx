import React, {useLayoutEffect, useRef} from 'react';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import {geoArea, geoEquirectangular, geoGraticule, geoPath} from 'd3-geo';
import * as THREE from 'three';
import {africa, greenland, world} from './geography';

type Runtime = {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.OrthographicCamera; globe: THREE.Mesh; texture: THREE.CanvasTexture};

export const UnifiedVisualCanvas: React.FC<{opacity: number; unfold: number}> = ({opacity, unfold}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<Runtime | null>(null);
  const frame = useCurrentFrame(); const {width, height, fps} = useVideoConfig();
  useLayoutEffect(() => {
    const renderer = new THREE.WebGLRenderer({canvas: canvas.current!, alpha: true, antialias: true, preserveDrawingBuffer: true});
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-960, 960, 540, -540, .1, 3000);
    camera.position.z = 1600;
    const surface = document.createElement('canvas'); surface.width = 3072; surface.height = 1536;
    const context = surface.getContext('2d')!;
    context.fillStyle = '#e2eeed'; context.fillRect(0, 0, surface.width, surface.height);
    const projection = geoEquirectangular().scale(surface.width / (2 * Math.PI)).translate([surface.width / 2, surface.height / 2]);
    const path = geoPath(projection, context);
    const draw = (rings: typeof world, color: string) => {
      context.fillStyle = color; context.strokeStyle = '#7f9f93'; context.lineWidth = 1;
      rings.forEach(ring => {
        const points = geoArea({type: 'Polygon', coordinates: [ring]}) > Math.PI * 2 ? [...ring].reverse() : ring;
        context.beginPath(); path({type: 'Polygon', coordinates: [points]}); context.fill(); context.stroke();
      });
    };
    draw(world, '#b1c9b6'); draw(africa, '#477f68'); draw(greenland, '#bf594c');
    context.beginPath(); path(geoGraticule().step([20, 20])()); context.strokeStyle = '#72959a60'; context.lineWidth = 1.3; context.stroke();
    const texture = new THREE.CanvasTexture(surface); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const globe = new THREE.Mesh(new THREE.SphereGeometry(224, 96, 64), new THREE.MeshStandardMaterial({map: texture, roughness: 1, metalness: 0}));
    scene.add(globe);
    scene.add(new THREE.AmbientLight(0xffffff, 1.3));
    const key = new THREE.DirectionalLight(0xfff7e9, 1.8); key.position.set(-500, 800, 1400); scene.add(key);
    const fill = new THREE.DirectionalLight(0xb8e5ec, .7); fill.position.set(600, -100, 700); scene.add(fill);
    runtime.current = {renderer, scene, camera, globe, texture};
    return () => {globe.geometry.dispose(); (globe.material as THREE.Material).dispose(); texture.dispose(); renderer.dispose(); runtime.current = null;};
  }, [width, height]);
  useLayoutEffect(() => {
    const state = runtime.current; if (!state) return;
    state.globe.position.set(465 + (1 - unfold) * 150, 140 - (1 - unfold) * 50, 0);
    state.globe.scale.setScalar(.78 + unfold * .22);
    state.globe.rotation.set(.12, -1.5 + (frame / fps - 43) * .085, -.12);
    state.renderer.render(state.scene, state.camera);
  }, [frame, fps, opacity, unfold, width, height]);
  return <canvas ref={canvas} aria-label="旋转地球" style={{position: 'absolute', inset: 0, width: 1920, height: 1080, opacity, pointerEvents: 'none'}}/>;
};
