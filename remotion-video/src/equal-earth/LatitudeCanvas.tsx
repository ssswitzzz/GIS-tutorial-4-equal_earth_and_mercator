import React,{useLayoutEffect,useRef} from 'react';
import * as THREE from 'three';
import {Line2} from 'three/examples/jsm/lines/Line2.js';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import {useVideoConfig} from 'remotion';
import {useAnimationFrame as useCurrentFrame} from '../AnimationClock';
import {motion} from '../perfect-map/Typography';
import {E,latitudes,rad,ringsPoint} from './model';
type State={renderer:THREE.WebGLRenderer;scene:THREE.Scene;camera:THREE.OrthographicCamera;group:THREE.Group;rings:Line2[];meridians:Line2[];dots:THREE.InstancedMesh};
export const LatitudeCanvas:React.FC=()=>{
  const ref=useRef<HTMLCanvasElement>(null),state=useRef<State|null>(null);const frame=useCurrentFrame(),{fps,width,height}=useVideoConfig();
  useLayoutEffect(()=>{
    const renderer=new THREE.WebGLRenderer({canvas:ref.current!,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(width,height,false);renderer.setClearColor(0,0);
    const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-960,960,540,-540,.1,3000);camera.position.z=1500;
    const group=new THREE.Group();scene.add(group);
    const makeLine=(color:number)=>{const geometry=new LineGeometry();geometry.setPositions([0,0,0,.01,0,0]);const material=new LineMaterial({color,linewidth:3.5,transparent:true,resolution:new THREE.Vector2(width,height)});const line=new Line2(geometry,material);group.add(line);return line;};
    const rings=latitudes.map(lat=>makeLine(lat===0?0xbf594c:0x477f68));
    const meridians=Array.from({length:13},()=>makeLine(0x427d99));
    const dots=new THREE.InstancedMesh(new THREE.SphereGeometry(2.8,8,6),new THREE.MeshBasicMaterial({color:0x427d99}),19*13);group.add(dots);
    state.current={renderer,scene,camera,group,rings,meridians,dots};
    return()=>{scene.traverse(o=>{if(o instanceof THREE.Line||o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();state.current=null;};
  },[width,height]);
  useLayoutEffect(()=>{
    const r=state.current;if(!r)return;const s=frame/fps;
    const open=motion(s,E.open,E.width),spread=motion(s,E.width,E.spacing),spacing=motion(s,E.spacing,E.ticks),fade=motion(s,E.slices,E.slices+2)*(1-motion(s,E.land,E.land+3));
    const align=motion(s,E.land-3,E.land);
    r.group.position.set(-210+150*align,-45,0);r.group.scale.setScalar(.8+.2*align);r.group.rotation.set(.35*(1-open),.14*(1-open),0);r.group.visible=fade>0;
    r.rings.forEach((line,j)=>{
      const reveal=motion(s,E.slices+j*.4,E.slices+j*.4+1.5),points:number[]=[];
      for(let i=0;i<=180;i++)points.push(...ringsPoint((i/180*reveal-.5)*Math.PI*2,latitudes[j]*rad,open,spread,spacing));
      line.geometry.setPositions(points);line.material.opacity=fade*reveal;
    });
    r.meridians.forEach((line,j)=>{const points:number[]=[],reveal=motion(s,E.meridians+j*.6,E.meridians+j*.6+5);
      for(let i=0;i<=180;i++)points.push(...ringsPoint((j/12-.5)*Math.PI*2,(90-i*reveal)*rad,1,1,1));
      line.geometry.setPositions(points);line.visible=s>=E.meridians;line.material.opacity=fade*reveal;
    });
    const matrix=new THREE.Matrix4();for(let j=0;j<19;j++)for(let i=0;i<13;i++){const p=ringsPoint((i/12-.5)*Math.PI*2,latitudes[j]*rad,1,1,1);matrix.makeTranslation(...p);r.dots.setMatrixAt(j*13+i,matrix);}
    r.dots.instanceMatrix.needsUpdate=true;r.dots.computeBoundingSphere();r.dots.count=Math.floor(motion(s,E.ticks,E.meridians)*247);r.dots.visible=s>=E.ticks;
    r.renderer.render(r.scene,r.camera);
  },[frame,fps,width,height]);
  return <canvas ref={ref} data-latitudes data-authored-frame={frame} data-longitude-dots={Math.floor(motion(frame/fps,E.ticks,E.meridians)*247)} style={{position:'absolute',inset:0,width:1920,height:1080}}/>;
};
