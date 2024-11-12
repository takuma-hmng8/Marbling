"use client";

import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import { useNoise, useBoxBlur, useSingleFBO } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import { Float, OrbitControls } from "@react-three/drei";

extend({ FxMaterial });

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

   const blur = useBoxBlur({
      size,
      dpr: 0.4,
      blurSize: 4,
      blurIteration: 20,
      src: renderTarget.texture,
   });

   const gooey = useBoxBlur({
      size,
      dpr: 2,
      blurSize: 4,
      blurIteration: 30,
      src: renderTarget.texture,
   });

   const noise = useNoise({
      size,
      dpr: 0.05,
      scale: 0.03,
   });

   const mesh0 = useRef<THREE.Mesh>(null);
   const mesh1 = useRef<THREE.Mesh>(null);

   useFrame((state) => {
      blur.render(state);
      gooey.render(state);
      noise.render(state);
      updateRenderTarget({ gl: state.gl });
      mesh0.current!.position.x -=
         Math.sin(state.clock.getElapsedTime()) * 0.02;
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
               key={FxMaterial.key}
            />
         </mesh>
         {createPortal(
            <Float rotationIntensity={2} floatIntensity={2} speed={2}>
               <mesh ref={mesh0} scale={0.8} position={[2, 0, 0]}>
                  <torusKnotGeometry args={[1.8, 0.5, 400, 32]} />
                  <ambientLight intensity={2} />
                  <directionalLight intensity={2} />
                  <meshStandardMaterial />
               </mesh>
               <mesh ref={mesh1} scale={0.8} position={[-2, 0, 0]}>
                  <sphereGeometry args={[2, 64, 64]} />
                  <ambientLight intensity={2} />
                  <directionalLight intensity={2} />
                  <meshStandardMaterial />
               </mesh>
               <OrbitControls />
            </Float>,
            offscreenScene
         )}
      </>
   );
};
