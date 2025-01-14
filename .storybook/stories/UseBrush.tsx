import * as React from "react";
import * as THREE from "three";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import { FxMaterial, FxMaterialProps } from "../../utils/fxMaterial";
import GUI from "lil-gui";
import { useGUI } from "../../utils/useGUI";
import { useBrush, useFxTexture } from "../../packages/use-shader-fx/src";
import {
   BrushParams,
   BRUSH_PARAMS,
} from "../../packages/use-shader-fx/src/fxs/interactions/useBrush";

extend({ FxMaterial });

const CONFIG: BrushParams = structuredClone(BRUSH_PARAMS);
const setGUI = (gui: GUI) => {
   gui.add(CONFIG, "radius", 0, 0.1, 0.01);
   gui.add(CONFIG, "smudge", 0, 10, 0.01);
   gui.add(CONFIG, "dissipation", 0, 1, 0.01);
   gui.add(CONFIG, "motionBlur", 0, 10, 0.01);
   gui.add(CONFIG, "motionSample", 0, 20, 1);
   gui.addColor(CONFIG, "color");
};
const setConfig = () => {
   return {
      ...CONFIG,
   } as BrushParams;
};

export const UseBrush = (args: BrushParams) => {
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateBrush] = useBrush({
      size,
      dpr,
   });
   useFrame((props) => {
      const fx = updateBrush(props, setConfig());
      fxRef.current!.u_fx = fx;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};

export const UseBrushWithTexture = (args: BrushParams) => {
   const [bg] = useLoader(THREE.TextureLoader, ["thumbnail.jpg"]);
   const updateGUI = useGUI(setGUI);
   const fxRef = React.useRef<FxMaterialProps>();
   const { size, dpr } = useThree((state) => {
      return { size: state.size, dpr: state.viewport.dpr };
   });
   const [updateFxTexture] = useFxTexture({ size, dpr });
   const [updateBrush, setBrush] = useBrush({ size, dpr });

   useFrame((props) => {
      const bgTexture = updateFxTexture(props, {
         texture0: bg,
      });
      const fx = updateBrush(props, {
         ...setConfig(),
         texture: bgTexture,
      });
      fxRef.current!.u_fx = fx;
      updateGUI();
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterial key={FxMaterial.key} ref={fxRef} />
      </mesh>
   );
};
