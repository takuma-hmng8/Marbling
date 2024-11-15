import * as THREE from "three";
import { useState } from "react";
import { Size } from "../hooks/types";

/**
 * @params dpr if dpr is set, it returns the resolution which is size multiplied by dpr.
 */
export const useResolution = (size: Size, dpr: number | false = false) => {
   const _width = dpr ? size.width * dpr : size.width;
   const _height = dpr ? size.height * dpr : size.height;

   const [resolution] = useState(() => new THREE.Vector2(_width, _height));
   resolution.set(_width, _height);

   return resolution;
};
