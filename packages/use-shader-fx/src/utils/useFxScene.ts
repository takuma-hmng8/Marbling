import * as THREE from "three";
import { useEffect, useState } from "react";
import { useObject3D } from "./useObject3D";
import { Size } from "../hooks/types";
import { useResolution } from "./useResolution";
import { FxMaterial, FxMaterialProps } from "../materials/core/FxMaterial";
import { useCamera } from "./useCamera";

type MaterialConstructor<M> = new (props: FxMaterialProps) => M;

type GeometryConstructor = new (
   width: number,
   height: number
) => THREE.BufferGeometry;

export const useFxScene = <M extends FxMaterial>({
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
