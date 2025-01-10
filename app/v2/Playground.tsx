"use client";

import * as THREE from "three";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
   useFrame,
   useThree,
   extend,
   createPortal,
   MeshProps,
} from "@react-three/fiber";
import {
   useNoise,
   useSingleFBO,
   useGaussianBlur,
   useFluid,
} from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import { Float } from "@react-three/drei";

extend({ FxMaterial });

// ここをシングルトンでメソッド化する
const newPosition = [
   new THREE.Vector3(2, 1, -1),
   new THREE.Vector3(-2, 2, 0),
   new THREE.Vector3(1, 2, 2),
];

/** 円 */
const Sphere = forwardRef<THREE.Mesh, MeshProps>((props, ref) => {
   return (
      <mesh ref={ref} {...props}>
         <sphereGeometry args={[2, 32, 32]} />
         <meshStandardMaterial />
      </mesh>
   );
});

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [offscreenScene] = useState(() => new THREE.Scene());

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene: offscreenScene,
      camera,
      size,
      dpr: viewport.dpr,
      depthBuffer: true,
   });

   const blur = useGaussianBlur({
      size,
      dpr: 0.2,
      texture: {
         src: renderTarget.texture,
      },
   });
   blur.setValues({
      radius: 24,
   });

   const gooey = useGaussianBlur({
      size,
      dpr: 1,
      texture: {
         src: renderTarget.texture,
      },
   });
   gooey.setValues({
      radius: 24,
   });

   const noise = useNoise({
      size,
      dpr: 0.1,
   });
   noise.setValues({
      scale: 0.03,
      timeStrength: 0.3,
   });

   const fluid = useFluid({
      size,
      dpr: 0.3,
   });

   const mesh0 = useRef<THREE.Mesh>(null);
   const mesh1 = useRef<THREE.Mesh>(null);
   const mesh2 = useRef<THREE.Mesh>(null);
   const spheres = [mesh0, mesh1, mesh2];

   // これもシングルトンでメソッド化
   const lerpSpheresPosition = (
      position: THREE.Vector3[],
      alpha: number = 0.03
   ) => {
      spheres.forEach((sphere, i) => {
         sphere.current!.position.lerp(position[i], alpha);
      });
   };

   useFrame((state) => {
      blur.render(state);
      gooey.render(state);
      noise.render(state);
      fluid.render(state);
      updateRenderTarget({ gl: state.gl });
      // mesh0.current!.position.x -=
      //    Math.sin(state.clock.getElapsedTime()) * 0.02;

      // positionの設定
      lerpSpheresPosition(newPosition);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial
               u_blur={blur.texture}
               u_gooey={gooey.texture}
               u_model={renderTarget.texture}
               u_noise={noise.texture}
               u_fluid={fluid.texture}
               key={FxMaterial.key}
            />
         </mesh>
         {createPortal(
            <>
               <ambientLight intensity={2} />
               <color attach="background" args={["#000000"]} />
               <Float rotationIntensity={2} floatIntensity={2} speed={2}>
                  <Sphere ref={mesh0} scale={1.2} position={[1, 0, 0]} />
                  <Sphere ref={mesh1} scale={1} position={[2, 2, 0]} />
                  <Sphere ref={mesh2} scale={0.5} position={[-2, -1, 0]} />
               </Float>
            </>,
            offscreenScene
         )}
      </>
   );
};

/*===============================================
必要な機能
1. マウスでカメラ視点の操作
2. 数字を与えるとその数字でランダムで位置とカメラワークがlerpする的なの
===============================================*/
