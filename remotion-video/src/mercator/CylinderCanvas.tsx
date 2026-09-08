import React, {useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {geoEquirectangular, geoMercator, geoPath, geoGraticule} from 'd3-geo';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import {WORLD} from '../perfect-map/math';
import {motion} from '../perfect-map/Typography';
import {M} from './timing';
import {paperPoint, mercatorY, RAD, SEA_VIEW} from './math';

type State = {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.OrthographicCamera; group: THREE.Group; sphere: THREE.Mesh; paper: THREE.Mesh; equator: THREE.Mesh; texture: THREE.CanvasTexture; construction: THREE.Group; correspondence: THREE.Group; rims: THREE.Line[]; ink:HTMLCanvasElement; surface:CanvasRenderingContext2D; transfer:THREE.LineSegments; coast:number[][]; lastPrint:number};
export const CylinderCanvas: React.FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null), state = useRef<State | null>(null);
  const frame = useCurrentFrame(); const {fps, width, height} = useVideoConfig();
  useLayoutEffect(() => {
    const renderer = new THREE.WebGLRenderer({canvas: canvas.current!, alpha: true, antialias: true, preserveDrawingBuffer: true}); renderer.setSize(width, height, false); renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-960, 960, 540, -540, .1, 4000); camera.position.z = 1900;
    scene.add(new THREE.AmbientLight(0xffffff, 1.7)); const key = new THREE.DirectionalLight(0xfff9ed, 1.5); key.position.set(-600, 700, 1000); scene.add(key);
    const group = new THREE.Group(); scene.add(group);
    const construction = new THREE.Group(), correspondence = new THREE.Group(); group.add(construction, correspondence);
    const line = (points: THREE.Vector3[], color: number) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color}));
    construction.add(line([new THREE.Vector3(0,-620,0),new THREE.Vector3(0,620,0)],0x427d99));
    for (const y of [-175,175]) {const pole=new THREE.Mesh(new THREE.SphereGeometry(5,12,8),new THREE.MeshBasicMaterial({color:0x427d99}));pole.position.y=y;construction.add(pole);}
    const rims = [-Math.PI,Math.PI].map(y => {const rim=line(Array.from({length:129},(_,i)=>new THREE.Vector3(...paperPoint((i/128-.5)*Math.PI*2,y,0))),0x427d99);group.add(rim);return rim;});
    [0,45,70].forEach((lat,i)=>{
      const lon=[-45,0,45][i]*RAD, phi=lat*RAD;
      const a=new THREE.Vector3(175*Math.cos(phi)*Math.sin(lon),175*Math.sin(phi),175*Math.cos(phi)*Math.cos(lon));
      const b=new THREE.Vector3(175*Math.sin(lon),175*mercatorY(lat),175*Math.cos(lon));
      if(a.distanceTo(b)>1e-6){
        const link=new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a,b),12,2,8,false),new THREE.MeshBasicMaterial({color:0xdf913f,depthTest:false}));
        link.renderOrder=5;correspondence.add(link);
      }
      for(const point of [a,b]){const dot=new THREE.Mesh(new THREE.SphereGeometry(4,12,8),new THREE.MeshBasicMaterial({color:0xbf594c}));dot.position.copy(point);correspondence.add(dot);}
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(175, 64, 40), new THREE.MeshStandardMaterial({color: 0x83aa9b, roughness: 1, transparent: true})); group.add(sphere);
    const globeCanvas=document.createElement('canvas');globeCanvas.width=2048;globeCanvas.height=1024;
    const globeContext=globeCanvas.getContext('2d')!;globeContext.fillStyle='#b8d5d4';globeContext.fillRect(0,0,2048,1024);
    const globePath=geoPath(geoEquirectangular().scale(2048/(2*Math.PI)).translate([1024,512]),globeContext);
    globeContext.beginPath();globePath(WORLD);globeContext.fillStyle='#477f68';globeContext.fill();
    const globeTexture=new THREE.CanvasTexture(globeCanvas);globeTexture.colorSpace=THREE.SRGBColorSpace;(sphere.material as THREE.MeshStandardMaterial).map=globeTexture;
    sphere.rotation.y=-Math.PI/2;sphere.renderOrder=0;
    const sphereGrid = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(175.5, 24, 12)), new THREE.LineBasicMaterial({color: 0x365d56, transparent: true, opacity: .15})); sphere.add(sphereGrid);sphereGrid.renderOrder=1;
    const equator = new THREE.Mesh(new THREE.TorusGeometry(176, 2.4, 10, 128), new THREE.MeshBasicMaterial({color: 0xbf594c})); equator.rotation.x = Math.PI / 2; group.add(equator);
    const textureCanvas = document.createElement('canvas'); textureCanvas.width = 2048; textureCanvas.height = 2048;
    const ctx = textureCanvas.getContext('2d')!; ctx.fillStyle = '#fffdf3'; ctx.fillRect(0, 0, 2048, 2048);
    const projection = geoMercator().scale(2048 / (Math.PI * 2)).translate([1024, 1024]); const path = geoPath(projection, ctx);
    ctx.beginPath(); path(WORLD); ctx.fillStyle = '#d3e1d6'; ctx.fill(); ctx.strokeStyle = '#87a392'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.beginPath(); path(geoGraticule().step([30, 15])()); ctx.strokeStyle = '#427d9980'; ctx.lineWidth = 1.5; ctx.stroke();
    const ink=document.createElement('canvas');ink.width=2048;ink.height=2048;ink.getContext('2d')!.drawImage(textureCanvas,0,0);
    const texture = new THREE.CanvasTexture(textureCanvas); texture.colorSpace = THREE.SRGBColorSpace;
    const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
    for (let j = 0; j <= 32; j++) for (let i = 0; i <= 96; i++) {positions.push(...paperPoint((i / 96 - .5) * 2 * Math.PI, (j / 32 - .5) * 2 * Math.PI, 0)); uvs.push(i / 96, j / 32);}
    for (let j = 0; j < 32; j++) for (let i = 0; i < 96; i++) {const a = j * 97 + i; indices.push(a, a + 1, a + 97, a + 1, a + 98, a + 97);}
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
    const paper = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({map: texture, color: 0xffffff, side: THREE.DoubleSide, roughness: 1, transparent: true, depthWrite:false, opacity: .6})); paper.renderOrder=2;group.add(paper);
    const coast:number[][]=[];
    for(const polygon of WORLD.coordinates)for(const ring of polygon)for(let i=1;i<ring.length;i++){
      const a=ring[i-1],b=ring[i];if(Math.abs(a[0]-b[0])<180&&Math.abs(a[1])<85&&Math.abs(b[1])<85)coast.push(a,b);
    }
    const transferGeometry=new THREE.BufferGeometry();transferGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(coast.length*3),3));
    const transfer=new THREE.LineSegments(transferGeometry,new THREE.LineBasicMaterial({color:0xdf913f,transparent:true,depthWrite:false}));transfer.renderOrder=3;group.add(transfer);
    state.current = {renderer, scene, camera, group, sphere, paper, equator, texture, construction, correspondence, rims,ink,surface:ctx,transfer,coast,lastPrint:-1};
    return () => {scene.traverse(o => {if(o instanceof THREE.Mesh || o instanceof THREE.Line) {o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());}}); globeTexture.dispose();texture.dispose(); renderer.dispose(); state.current = null;};
  }, [width, height]);
  useLayoutEffect(() => {
    const r = state.current; if (!r) return; const s = frame / fps;
    const wrap = motion(s, M.wrap, M.wrapped), open = motion(s, M.unwrap, M.flat-1), exit = motion(s, M.flat-1, M.flat+2);
    const dock = motion(s, M.unwrap+3, M.flat-1);
    const paperOpen = s < M.unwrap ? 1 - wrap : open;
    const p = r.paper.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let j = 0; j <= 32; j++) for (let i = 0; i <= 96; i++) {const v = paperPoint((i / 96 - .5) * Math.PI * 2, (j / 32 - .5) * 2 * Math.PI, paperOpen); p.setXYZ(j * 97 + i, ...v);}
    p.needsUpdate = true; r.paper.geometry.computeVertexNormals(); r.paper.geometry.computeBoundingSphere();
    r.paper.position.z = 175 * (1 - paperOpen);
    r.rims.forEach((rim,index)=>{
      const positions=rim.geometry.getAttribute('position') as THREE.BufferAttribute;
      for(let i=0;i<=128;i++){const v=paperPoint((i/128-.5)*Math.PI*2,index?Math.PI:-Math.PI,paperOpen);positions.setXYZ(i,v[0],v[1],v[2]+175*(1-paperOpen));}
      positions.needsUpdate=true;rim.geometry.computeBoundingSphere();
      rim.visible=s>=M.wrapped;
      (rim.material as THREE.LineBasicMaterial).transparent=true;(rim.material as THREE.LineBasicMaterial).opacity=1-exit;
    });
    r.construction.visible=s>=M.wrapped&&s<M.unwrap;
    r.correspondence.visible=s>=M.equator+1&&s<M.unwrap;
    r.correspondence.children.forEach(object=>{
      const material=(object as THREE.Mesh).material as THREE.Material;
      material.transparent=true;material.opacity=motion(s,M.equator+1,M.equator+3)*.65;
    });
    const printed=motion(s,M.equator+1,M.unwrap);
    if(printed!==r.lastPrint){r.surface.fillStyle='#fffdf3';r.surface.fillRect(0,0,2048,2048);if(printed>0)r.surface.drawImage(r.ink,0,0,2048,Math.max(1,2048*printed),0,0,2048,Math.max(1,2048*printed));r.texture.needsUpdate=true;r.lastPrint=printed;}
    const transferPositions=r.transfer.geometry.getAttribute('position') as THREE.BufferAttribute;
    r.coast.forEach(([lon,lat],i)=>{
      const lambda=lon*RAD,phi=lat*RAD,blend=motion(s,M.equator+1+(85-lat)/170*7,M.equator+5+(85-lat)/170*7);
      const radius=175.8,c=Math.cos(phi)*(1-blend)+blend;
      transferPositions.setXYZ(i,radius*c*Math.sin(lambda),radius*(Math.sin(phi)*(1-blend)+mercatorY(lat)*blend),radius*c*Math.cos(lambda));
    });
    transferPositions.needsUpdate=true;r.transfer.geometry.computeBoundingSphere();r.transfer.visible=s>=M.equator+1&&s<M.unwrap+2;(r.transfer.material as THREE.LineBasicMaterial).opacity=motion(s,M.equator+1,M.equator+2)*(1-motion(s,M.unwrap,M.unwrap+2));
    const material = r.paper.material as THREE.MeshStandardMaterial; material.opacity = (.14 + motion(s, M.unwrap, M.unwrap + 3) * .86) * motion(s, M.wrap, M.wrap + 2)*(1-exit);
    r.sphere.scale.setScalar(1);
    (r.sphere.material as THREE.MeshStandardMaterial).opacity=1-motion(s,M.unwrap,M.unwrap+2);
    r.sphere.visible=s<M.unwrap+2;
    r.equator.visible = s >= M.equator && s < M.unwrap; r.equator.scale.setScalar(1 + .018 * Math.sin(s * 2));
    r.group.position.set(-160+(SEA_VIEW.x-960+160)*dock, -65+(540-SEA_VIEW.y+65)*dock, 0); r.group.rotation.set(.22 * (1 - open), -.28 * (1 - open) + .03 * Math.sin(s * .2) * (1 - open), 0);
    r.group.scale.setScalar((.52+(SEA_VIEW.scale/175-.52)*dock)*motion(s, M.wrap, M.wrap + 2));
    r.group.visible = s >= M.wrap && s < M.flat + 2;
    r.renderer.render(r.scene, r.camera);
  }, [frame, fps, width, height]);
  return <canvas data-cylinder data-sphere-scale="1" data-transfer={motion(frame/fps,M.equator+1,M.unwrap)} ref={canvas} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}}/>;
};
