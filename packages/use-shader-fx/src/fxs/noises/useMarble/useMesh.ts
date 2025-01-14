import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import { MATERIAL_BASIC_PARAMS } from "../../../libs/constants";
import { MARBLE_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class MarbleMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_time: { value: number };
      u_pattern: { value: number };
      u_complexity: { value: number };
      u_complexityAttenuation: { value: number };
      u_iterations: { value: number };
      u_timeStrength: { value: number };
      u_scale: { value: number };
   };
}

export const useMesh = ({
   scene,
   onBeforeInit,
}: { scene: THREE.Scene } & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  u_time: { value: 0 },
                  u_pattern: { value: MARBLE_PARAMS.pattern },
                  u_complexity: { value: MARBLE_PARAMS.complexity },
                  u_complexityAttenuation: {
                     value: MARBLE_PARAMS.complexityAttenuation,
                  },
                  u_iterations: { value: MARBLE_PARAMS.iterations },
                  u_timeStrength: { value: MARBLE_PARAMS.timeStrength },
                  u_scale: { value: MARBLE_PARAMS.scale },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });

      return mat;
   }, [onBeforeInit]) as MarbleMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
