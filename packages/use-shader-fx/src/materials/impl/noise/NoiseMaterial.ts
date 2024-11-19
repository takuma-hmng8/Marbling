import * as THREE from "three";
import { noiseFragment, noiseVertex } from "./noise.glsl";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxLib";
import {
   ExtractUniformValues,
   NestUniformValues,
} from "../../../shaders/uniformsUtils";

type NoiseUniforms = {
   /** useBeatを渡せば、リズムを変えられる。 */
   tick: { value: number };
   /** noise scale , default : `0.004` */
   scale: { value: number };
   /** time factor default : `0.3` */
   timeStrength: { value: number };
   /** noiseOctaves, affects performance default : `2` */
   noiseOctaves: { value: number };
   /** fbmOctaves, affects performance default : `2` */
   fbmOctaves: { value: number };
   /** domain warping octaves , affects performance default : `2`  */
   warpOctaves: { value: number };
   /** direction of domain warping , default : `(2.0,2,0)` */
   warpDirection: { value: THREE.Vector2 };
   /** strength of domain warping , default : `8.0` */
   warpStrength: { value: number };
   /** offset of the time */
   timeOffset: { value: number };
} & BasicFxUniforms;

export type NoiseValues = NestUniformValues<NoiseUniforms> & BasicFxValues;

export type NoiseMaterialProps = ExtractUniformValues<NoiseUniforms>;

export class NoiseMaterial extends BasicFxMaterial {
   public static readonly key: string = THREE.MathUtils.generateUUID();

   static get type() {
      return "NoiseMaterial";
   }

   uniforms!: NoiseUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<NoiseValues> = {}) {
      super({
         uniformValues,
         materialParameters,
         vertexShader: noiseVertex,
         fragmentShader: noiseFragment,
         uniforms: {
            tick: { value: 0.0 },
            scale: { value: 0.03 },
            timeStrength: { value: 0.3 },
            noiseOctaves: { value: 2 },
            fbmOctaves: { value: 2 },
            warpOctaves: { value: 2 },
            warpDirection: { value: new THREE.Vector2(2.0, 2.0) },
            warpStrength: { value: 8 },
            timeOffset: { value: 0 },
         } as NoiseUniforms,
      });
      this.type = NoiseMaterial.type;
   }
}
