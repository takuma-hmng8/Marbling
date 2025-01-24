import * as THREE from "three";
import { useEffect, useState } from "react";
import { Size } from "../hooks/types";
import { useResolution } from "./useResolution";
import { FxMaterial, FxMaterialProps } from "../materials/core/FxMaterial";
import { useCamera } from "./useCamera";

type Object3DConstructor<T, M extends THREE.Material> = new (
   geometry: THREE.BufferGeometry,
   material: M
) => T;

type MaterialConstructor<M> = new (props: FxMaterialProps) => M;

type GeometryConstructor = new (
   width: number,
   height: number
) => THREE.BufferGeometry;

/**
 * Add geometry and material to Object3D and add them to scene.
 */
const useObject3D = <T extends THREE.Object3D, M extends THREE.Material>(
   scene: THREE.Scene | false,
   geometry: THREE.BufferGeometry,
   material: M,
   Proto: Object3DConstructor<T, M>
) => {
   const [object3D] = useState(() => new Proto(geometry, material));

   useEffect(() => {
      scene && scene.add(object3D);
      return () => {
         scene && scene.remove(object3D);
         geometry.dispose();
         material.dispose();
      };
   }, [scene, geometry, material, object3D]);

   return object3D;
};

export const useSetup = <M extends FxMaterial>({
   size,
   dpr,
   material,
   geometry = THREE.PlaneGeometry,
   geometrySize,
   ...materialProps
}: {
   size: Size;
   dpr: number | false;
   material: MaterialConstructor<M>;
   geometry?: GeometryConstructor;
   geometrySize?: {
      width: number;
      height: number;
   };
} & FxMaterialProps) => {
   // Mutable THREE objects should retain their values in useState
   // https://github.com/FunTechInc/use-shader-fx/issues/145
   const [scene] = useState(() => new THREE.Scene());
   const [_geometry] = useState(
      () => new geometry(geometrySize?.width || 2, geometrySize?.height || 2)
   );
   const [_material] = useState(() => new material(materialProps));

   // materialのresolutionはreactiveに更新する
   const resolution = useResolution(size, dpr);
   _material.updateResolution(resolution);

   useObject3D(scene, _geometry, _material, THREE.Mesh);

   const camera = useCamera(size);

   return {
      scene,
      material: _material,
      camera,
   };
};
