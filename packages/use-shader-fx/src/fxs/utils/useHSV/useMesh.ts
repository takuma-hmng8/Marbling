import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useMemo } from "react";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps, Size } from "../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../libs/constants";
import { HSV_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class HSVMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_brightness: { value: number };
      u_saturation: { value: number };
   };
}

export const useMesh = ({
   scene,
   onBeforeInit,
}: {
   scene: THREE.Scene;
   size: Size;
} & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  u_texture: { value: DEFAULT_TEXTURE },
                  u_brightness: { value: HSV_PARAMS.brightness },
                  u_saturation: { value: HSV_PARAMS.saturation },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });
      return mat;
   }, [onBeforeInit]) as HSVMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
