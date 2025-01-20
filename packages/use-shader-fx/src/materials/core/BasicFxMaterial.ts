import * as THREE from "three";
import { FxMaterial, FxMaterialProps, DefaultUniforms } from "./FxMaterial";
import { TexturePipelineSrc } from "../../misc";
import { NestUniformValues } from "../../shaders/uniformsUtils";
import { joinShaderPrefix } from "../../shaders/mergeShaderLib";
import { mergeShaderLib, ShaderLibType } from "../../shaders/mergeShaderLib";

export type FitType = "fill" | "cover" | "contain";

export type TextureResolution = THREE.Vector2 | null;

export type BasicFxUniformsUnique = {
   // mixSrc
   mixSrc_src: { value: TexturePipelineSrc };
   mixSrc_resolution: { value: TextureResolution };
   mixSrc_uvFactor: { value: number };
   mixSrc_alphaFactor: { value: number };
   mixSrc_colorFactor: { value: number };
   mixSrc_fit: { value: FitType };
   mixSrc_aspectRatio: { value: number };
   mixSrc_fitScale: { value: THREE.Vector2 };
   // mixDst
   mixDst_src: { value: TexturePipelineSrc };
   mixDst_resolution: { value: TextureResolution };
   mixDst_uvFactor: { value: number };
   mixDst_alphaFactor: { value: number };
   mixDst_colorFactor: { value: number };
   mixDst_fit: { value: FitType };
   mixDst_aspectRatio: { value: number };
   mixDst_fitScale: { value: THREE.Vector2 };
};

export type BasicFxUniforms = BasicFxUniformsUnique & DefaultUniforms;

export type BasicFxValues = NestUniformValues<BasicFxUniforms>;

export type FxFlag = {
   srcSystem: boolean; // src stystemが使われているかどうか
   mixSrc: boolean;
   mixDst: boolean;
};

export function hasMatchingKeys(
   target: { [key: string]: any } | null,
   source: { [key: string]: { value: any } }
) {
   if (!target) return false;
   return Object.keys(target).some((key) => Object.keys(source).includes(key));
}

export class BasicFxMaterial extends FxMaterial {
   static readonly BASIC_VALUES: BasicFxUniformsUnique = {
      // mixSrc
      mixSrc_src: { value: null },
      mixSrc_resolution: { value: null },
      mixSrc_uvFactor: { value: 0 },
      mixSrc_alphaFactor: { value: 0 },
      mixSrc_colorFactor: { value: 0 },
      mixSrc_fit: { value: "fill" },
      mixSrc_aspectRatio: { value: 0 },
      mixSrc_fitScale: { value: new THREE.Vector2(1, 1) },
      // mixDst
      mixDst_src: { value: null },
      mixDst_resolution: { value: null },
      mixDst_uvFactor: { value: 0 },
      mixDst_alphaFactor: { value: 0 },
      mixDst_colorFactor: { value: 0 },
      mixDst_fit: { value: "fill" },
      mixDst_aspectRatio: { value: 0 },
      mixDst_fitScale: { value: new THREE.Vector2(1, 1) },
   };

   static readonly SHADER_PREFIX = {
      srcSystem: "#define USF_USE_SRC_SYSTEM",
      mixSrc: "#define USF_USE_MIXSRC",
      mixDst: "#define USF_USE_MIXDST",
   };

   fxFlag: FxFlag;

   uniforms!: BasicFxUniforms;

   vertexShaderCache: string;
   vertexPrefixCache: string;
   fragmentShaderCache: string;
   fragmentPrefixCache: string;
   programCache: number;

   constructor({
      uniformValues,
      materialParameters = {},
      uniforms,
      vertexShader,
      fragmentShader,
   }: FxMaterialProps<BasicFxValues> = {}) {
      super({
         uniformValues,
         materialParameters,
         uniforms: THREE.UniformsUtils.merge([
            BasicFxMaterial.BASIC_VALUES,
            uniforms || {},
         ]),
      });

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;
      this.vertexPrefixCache = "";
      this.fragmentPrefixCache = "";
      this.programCache = 0;

      this.fxFlag = this.setupDefaultFlag(uniformValues);

      this.setupFxShaders(vertexShader, fragmentShader, "basicFx");
   }

   updateFxShaders() {
      // shaderのsetup前は実行しない
      if (!this.fxFlag) return;

      const _cache = this.programCache;

      const { validCount, updatedFlag } = this.handleUpdateFxShaders(
         this.uniforms,
         this.fxFlag
      );

      this.programCache += validCount;
      this.fxFlag = updatedFlag;

      if (_cache !== this.programCache) {
         this.updateFxShaderPrefixes();
         this.compileFxShaders();
         this.version++; // same as this.needsUpdate = true;
      }
   }
   handleUpdateFxShaders(
      uniforms: BasicFxUniforms,
      fxFlag: FxFlag
   ): {
      validCount: number;
      updatedFlag: FxFlag;
   } {
      // THINK : `handleUpdateFx`での判定は、uniformの値で行っている.例えばsaturation・brightnessとかはどう判定する？
      // THINK : `isMixSrc` みたいなuniform値をつくる？ uniformValues?.mixSrcを判定するイメージ
      const isMixSrc = uniforms.mixSrc_src.value ? true : false;
      const isMixDst = uniforms.mixDst_src.value ? true : false;
      const isSrcSystem = isMixSrc || isMixDst;

      const { mixSrc, mixDst, srcSystem } = fxFlag;

      const updatedFlag = fxFlag;

      let validCount = 0;

      if (mixSrc !== isMixSrc) {
         updatedFlag.mixSrc = isMixSrc;
         validCount++;
      }

      if (mixDst !== isMixDst) {
         updatedFlag.mixDst = isMixDst;
         validCount++;
      }

      if (srcSystem !== isSrcSystem) {
         updatedFlag.srcSystem = isSrcSystem;
         validCount++;
      }

      return {
         validCount,
         updatedFlag,
      };
   }
   // シェーダーをコンパイルする
   compileFxShaders() {
      this.vertexShader = this.vertexPrefixCache + this.vertexShaderCache;
      this.fragmentShader = this.fragmentPrefixCache + this.fragmentShaderCache;
   }
   // シェーダーのプレフィックスを更新する
   updateFxShaderPrefixes() {
      const { prefixVertex, prefixFragment } =
         this.handleUpdateFxShaderPrefixes(this.fxFlag);
      this.vertexPrefixCache = prefixVertex;
      this.fragmentPrefixCache = prefixFragment;
   }
   handleUpdateFxShaderPrefixes(fxFlag: FxFlag): {
      prefixVertex: string;
      prefixFragment: string;
   } {
      const { mixSrc, mixDst, srcSystem } = fxFlag;
      const SHADER_PREFIX = BasicFxMaterial.SHADER_PREFIX;
      const prefixVertex = joinShaderPrefix([
         srcSystem ? SHADER_PREFIX.srcSystem : "",
         mixSrc ? SHADER_PREFIX.mixSrc : "",
         mixDst ? SHADER_PREFIX.mixDst : "",
         "\n",
      ]);
      const prefixFragment = joinShaderPrefix([
         srcSystem ? SHADER_PREFIX.srcSystem : "",
         mixSrc ? SHADER_PREFIX.mixSrc : "",
         mixDst ? SHADER_PREFIX.mixDst : "",
         "\n",
      ]);

      return {
         prefixVertex,
         prefixFragment,
      };
   }

   // 初回にFxShadersをセットアップする
   setupFxShaders(
      vertexShader?: string,
      fragmentShader?: string,
      shaderType: ShaderLibType = "basicFx"
   ) {
      if (!vertexShader && !fragmentShader) return;

      this.updateFxShaderPrefixes();

      const [vertex, fragment] = mergeShaderLib(
         vertexShader,
         fragmentShader,
         shaderType
      );

      super.setupDefaultShaders(vertex, fragment);

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;

      this.updateFxShaders();
   }

   /** valuesのkeyにbasicValuesが含まれているかどうかの判定 */
   isContainsBasicValues(values?: { [key: string]: any }): boolean {
      return hasMatchingKeys(values ?? null, BasicFxMaterial.BASIC_VALUES);
   }

   setupDefaultFlag(uniformValues?: BasicFxValues): FxFlag {
      const isMixSrc = uniformValues?.mixSrc ? true : false;
      const isMixDst = uniformValues?.mixDst ? true : false;
      const isSrcSystem = isMixSrc || isMixDst;
      return {
         // THINK : `handleUpdateFx`での判定は、uniformの値で行っている.例えばsaturation・brightnessとかはどう判定する？
         // THINK : `isMixSrc` みたいなuniform値をつくる？ uniformValues?.mixSrcを判定するイメージ
         mixSrc: isMixSrc,
         mixDst: isMixDst,
         srcSystem: isSrcSystem,
      };
   }

   /*===============================================
	↓↓ FxMaterialの拡張 ↓↓
	===============================================*/
   setUniformValues(values?: { [key: string]: any }) {
      const flattenedValues = super.setUniformValues(values);
      if (this.isContainsBasicValues(flattenedValues)) {
         this.updateFxShaders();
         // aspectRationの更新を伴う可能性があるので、同時に実行する
         this.updateResolution(this.uniforms.resolution.value);
      }
      return flattenedValues;
   }

   // resolutionの更新
   updateResolution(resolution: THREE.Vector2) {
      super.updateResolution(resolution);

      const mixSrcAspect = this.calcAspectRatio(
         this.uniforms.mixSrc_fit.value,
         this.uniforms.mixSrc_src.value,
         this.uniforms.mixSrc_resolution.value
      );
      this.uniforms.mixSrc_aspectRatio.value = mixSrcAspect.srcAspectRatio;
      this.uniforms.mixSrc_fitScale.value = mixSrcAspect.fitScale;

      const mixDstAspect = this.calcAspectRatio(
         this.uniforms.mixDst_fit.value,
         this.uniforms.mixDst_src.value,
         this.uniforms.mixDst_resolution.value
      );
      this.uniforms.mixDst_aspectRatio.value = mixDstAspect.srcAspectRatio;
      this.uniforms.mixDst_fitScale.value = mixDstAspect.fitScale;
   }
   calcAspectRatio(
      type: FitType,
      src: TexturePipelineSrc,
      srcResolution: TextureResolution
   ): {
      srcAspectRatio: number;
      fitScale: THREE.Vector2;
   } {
      const baseAspectRatio = this.uniforms.aspectRatio.value;
      let srcAspectRatio = 1;
      let fitScale = new THREE.Vector2(1, 1);

      if (src === null) {
         // srcがnullの場合は、baseのアスペクト比を返す
         srcAspectRatio = baseAspectRatio;
      } else if (srcResolution != null) {
         // src の resolution が 設定されている場合
         srcAspectRatio = srcResolution.x / srcResolution.y;
      } else if (src?.image) {
         // TODO * VideoTextureも許容する
         srcAspectRatio = src.image.width / src.image.height;
      }

      if (type === "fill") {
         fitScale = new THREE.Vector2(1, 1);
      } else if (type === "cover") {
         fitScale = new THREE.Vector2(
            Math.min(baseAspectRatio / srcAspectRatio, 1),
            Math.min(srcAspectRatio / baseAspectRatio, 1)
         );
      } else if (type === "contain") {
         fitScale = new THREE.Vector2(
            Math.max(baseAspectRatio / srcAspectRatio, 1),
            Math.max(srcAspectRatio / baseAspectRatio, 1)
         );
      }

      return {
         srcAspectRatio,
         fitScale,
      };
   }

   defineUniformAccessors(onSet?: () => void) {
      super.defineUniformAccessors(() => {
         this.updateFxShaders();
         onSet?.();
      });
   }
}
