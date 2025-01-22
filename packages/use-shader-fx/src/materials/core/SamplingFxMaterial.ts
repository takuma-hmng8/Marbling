import * as THREE from "three";
import { FxMaterialProps } from "./FxMaterial";
import { TexturePipelineSrc } from "../../misc";
import { NestUniformValues } from "../../shaders/uniformsUtils";
import { joinShaderPrefix } from "../../shaders/mergeShaderLib";
import { BasicFxMaterial } from "./BasicFxMaterial";
import { DEFAULT_TEXTURE } from "../../libs/constants";
import { mergeShaderLib } from "../../shaders/mergeShaderLib";
import * as BasicFxLib from "./BasicFxLib";

/*===============================================
types
===============================================*/
type SamplingFxUniformsUnique = {
   texture_src: { value: TexturePipelineSrc };
   texture_resolution: { value: BasicFxLib.TextureResolution };
   texture_fit: { value: BasicFxLib.FitType };
   texture_aspectRatio: { value: number };
   texture_fitScale: { value: THREE.Vector2 };
};
export type SamplingFxUniforms = SamplingFxUniformsUnique &
   BasicFxLib.BasicFxUniforms;
export type SamplingFxValues = NestUniformValues<SamplingFxUniforms>;

/*===============================================
constants
===============================================*/
const SAMPLINGFX_VALUES: SamplingFxUniformsUnique = {
   texture_src: { value: DEFAULT_TEXTURE },
   texture_resolution: { value: null },
   texture_fit: { value: "fill" },
   texture_aspectRatio: { value: 0 },
   texture_fitScale: { value: new THREE.Vector2(1, 1) },
};

const SAMPLINGFX_SHADER_PREFIX = {
   texture: "#define USF_USE_TEXTURE",
};

/**
 * SamplingFxMaterialでは常にtextureはtrueであるはずなので、BasicFxMaterialを継承して、srcSystemは常にtrueになるように、継承する
 */
export class SamplingFxMaterial extends BasicFxMaterial {
   uniforms!: SamplingFxUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
      uniforms,
      vertexShader,
      fragmentShader,
   }: FxMaterialProps<SamplingFxValues>) {
      super({
         vertexShader,
         fragmentShader,
         uniformValues,
         materialParameters,
         uniforms: THREE.UniformsUtils.merge([
            SAMPLINGFX_VALUES,
            uniforms || {},
         ]),
      });
   }

   handleMergeShaderLib(vertexShader?: string, fragmentShader?: string) {
      return mergeShaderLib(vertexShader, fragmentShader, "samplingFx");
   }

   isContainsBasicFxValues(values?: { [key: string]: any }): boolean {
      return super.isContainsBasicFxValues(values, {
         ...BasicFxLib.BASICFX_VALUES,
         ...SAMPLINGFX_VALUES,
      });
   }

   updateResolution(resolution: THREE.Vector2) {
      super.updateResolution(resolution);

      const { srcAspectRatio, fitScale } = BasicFxLib.calcAspectRatio({
         type: this.uniforms.texture_fit.value,
         src: this.uniforms.texture_src.value,
         srcResolution: this.uniforms.texture_resolution.value,
         baseAspectRatio: this.uniforms.aspectRatio.value,
      });

      this.uniforms.texture_aspectRatio.value = srcAspectRatio;
      this.uniforms.texture_fitScale.value = fitScale;
   }

   setupDefaultFlag(
      uniformValues: BasicFxLib.BasicFxValues
   ): BasicFxLib.FxFlag {
      const flag = super.setupDefaultFlag(uniformValues);
      flag.srcSystem = true;
      return flag;
   }

   handleUpdateFxShaders(): {
      validCount: number;
      updatedFlag: BasicFxLib.FxFlag;
   } {
      const { validCount, updatedFlag } = super.handleUpdateFxShaders();
      updatedFlag.srcSystem = true;
      return {
         validCount,
         updatedFlag,
      };
   }

   handleUpdateFxShaderPrefixes(): {
      vertex: string;
      fragment: string;
   } {
      const prefix = super.handleUpdateFxShaderPrefixes();
      return {
         vertex: joinShaderPrefix([
            prefix.vertex.trim(),
            SAMPLINGFX_SHADER_PREFIX.texture,
            "\n",
         ]),
         fragment: joinShaderPrefix([
            prefix.fragment.trim(),
            SAMPLINGFX_SHADER_PREFIX.texture,
            "\n",
         ]),
      };
   }
}
