"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useRGBShift,
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl({
   fragmentShader: `
	uniform sampler2D src;
	void main() {      
		vec4 oC = texture2D(src, vUv);            
      gl_FragColor = oC;
	}
`,
});
const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size } = useThree();

   const [app] = useTexture(["/funkun.jpg"]);

   const rgbShift = useRGBShift({
      size,
      dpr: 1,
      shiftScale: 0.3,
      shiftPower: new THREE.Vector2(32, 2),
      // shiftPowerSrcR: noise.texture,
      // shiftPowerSrcG: noise2.texture,
      // shiftPowerSrcB: noise3.texture,
      // isUseShiftPowerSrcR: true,
      // isUseShiftPowerSrcG: true,
      // isUseShiftPowerSrcB: true,
      texture: {
         src: app,
         fit: "cover",
      },
   });

   rgbShift.setValues({
      shiftScale: 0.3,
      shiftPower: new THREE.Vector2(3, 20),
      texture: {
         src: app,
         fit: "cover",
      },
   });

   useFrame((state) => {
      rgbShift.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={rgbShift.texture} />
      </mesh>
   );
};
