"use client";

import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { useBlank, useCoverTexture } from "@/packages/use-shader-fx/src";
import { FxMaterial } from "./FxMaterial";
import { useVideoTexture } from "@react-three/drei";
import { OnBeforeInitParameters } from "@/packages/use-shader-fx/src/fxs/types";

extend({ FxMaterial });

export const Playground = () => {
   const { size, viewport, gl } = useThree();
   const funkun_mov = useVideoTexture("/FT_Ch02-comp.mp4", {
      width: 1280,
      height: 720,
   });
   const [updateCover, setCover, { output: cover }] = useCoverTexture({
      size,
      dpr: 1,
   });
   setCover({
      texture: funkun_mov,
   });
   const [updateBlank, setBlank, { output: blank }] = useBlank({
      size,
      dpr: viewport.dpr,
      onBeforeInit: useCallback((params: OnBeforeInitParameters) => {
         Object.assign(params.uniforms, {
            hoge: { value: 0 },
         });
         params.fragmentShader = params.fragmentShader.replace(
            "#usf <uniforms>",
            "uniform float hoge;"
         );
         params.fragmentShader = params.fragmentShader.replace(
            "#usf <main>",
            `float t=uTime,c;vec2 z,u,n=vec2(cos(t),sin(t));z=vUv*2.-1.;for(int i=0;i<12;i++){if(dot(z,z)>8.)discard;z=vec2(z.x*z.x-z.y*z.y,z.x*z.y)+n;}c=cos(length(z)+log(length(z)));u=vUv;u+=z*hoge;usf_FragColor=vec4(mix(vec3(c),texture2D(uTexture,u).rgb,1.-hoge),1.);`
         );
         console.log(params);
      }, []),
   });
   setBlank({
      texture: cover,
   });

   useFrame((state) => {
      updateBlank(
         state,
         {},
         {
            hoge: Math.sin(state.clock.getElapsedTime()),
         }
      );
      updateCover(state);
   });

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <fxMaterial u_fx={blank} key={FxMaterial.key} />
         </mesh>
      </>
   );
};
