import * as THREE from "three";
import { useMemo } from "react";
import { Size } from "../hooks/types";

/**
 * @params dpr if dpr is set, it returns the resolution which is size multiplied by dpr.
 */
// TODO : materialを引数に取る場合はmaterialのupdateResolutionを呼び出す:M extends FxMaterial
export const useResolution = (size: Size, dpr: number | false = false) => {
   const _width = dpr ? size.width * dpr : size.width;
   const _height = dpr ? size.height * dpr : size.height;

   const resolution = useMemo(
      () => new THREE.Vector2(_width, _height),
      [_width, _height]
   );
   return resolution;
};
