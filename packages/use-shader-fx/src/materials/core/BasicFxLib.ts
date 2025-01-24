import * as THREE from "three";
import { mergeShaderCode } from "../../shaders/shaderUtils";
import { DefaultUniforms } from "./FxMaterial";
import {
   NestUniformValues,
   UniformParentKey,
} from "../../shaders/uniformsUtils";

/*===============================================
types
===============================================*/
export type FitType = "fill" | "cover" | "contain";
export type TextureResolution = THREE.Vector2 | null;

export type BasicFxUniformsUnique = {
   // mixSrc
   mixSrc: { value: UniformParentKey };
   mixSrc_src: { value: THREE.Texture };
   mixSrc_resolution: { value: TextureResolution };
   mixSrc_uvFactor: { value: number };
   mixSrc_alphaFactor: { value: number };
   mixSrc_colorFactor: { value: number };
   mixSrc_fit: { value: FitType };
   mixSrc_aspectRatio: { value: number };
   mixSrc_fitScale: { value: THREE.Vector2 };
   // mixDst
   mixDst: { value: UniformParentKey };
   mixDst_src: { value: THREE.Texture };
   mixDst_resolution: { value: TextureResolution };
   mixDst_uvFactor: { value: number };
   mixDst_alphaFactor: { value: number };
   mixDst_colorFactor: { value: number };
   mixDst_fit: { value: FitType };
   mixDst_aspectRatio: { value: number };
   mixDst_fitScale: { value: THREE.Vector2 };
   // levels
   levels: { value: UniformParentKey };
   levels_shadows: { value: THREE.Vector4 };
   levels_midtones: { value: number };
   levels_highlights: { value: number };
   levels_outputMin: { value: number };
   levels_outputMax: { value: number };
   // contrast
   contrast: { value: UniformParentKey };
   contrast_factor: { value: THREE.Vector4 };
};

export type BasicFxUniforms = BasicFxUniformsUnique & DefaultUniforms;

export type BasicFxValues = NestUniformValues<BasicFxUniforms>;

export type FxKey = {
   srcSystem: boolean;
   mixSrc: boolean;
   mixDst: boolean;
   levels: boolean;
   contrast: boolean;
};

/*===============================================
constants
===============================================*/
export const BASICFX_VALUES: BasicFxUniformsUnique = {
   // mixSrc
   mixSrc: { value: false },
   mixSrc_src: { value: new THREE.Texture() },
   mixSrc_resolution: { value: null },
   mixSrc_uvFactor: { value: 0 },
   mixSrc_alphaFactor: { value: 0 },
   mixSrc_colorFactor: { value: 0 },
   mixSrc_fit: { value: "fill" },
   mixSrc_aspectRatio: { value: 0 },
   mixSrc_fitScale: { value: new THREE.Vector2(1, 1) },
   // mixDst
   mixDst: { value: false },
   mixDst_src: { value: new THREE.Texture() },
   mixDst_resolution: { value: null },
   mixDst_uvFactor: { value: 0 },
   mixDst_alphaFactor: { value: 0 },
   mixDst_colorFactor: { value: 0 },
   mixDst_fit: { value: "fill" },
   mixDst_aspectRatio: { value: 0 },
   mixDst_fitScale: { value: new THREE.Vector2(1, 1) },
   // levels
   levels: { value: false },
   levels_shadows: { value: new THREE.Vector4(0, 0, 0, 0) },
   levels_midtones: { value: 1 },
   levels_highlights: { value: 1 },
   levels_outputMin: { value: 0 },
   levels_outputMax: { value: 1 },
   // contrast
   contrast: { value: false },
   contrast_factor: { value: new THREE.Vector4(1, 1, 1, 1) },
};

export const BASICFX_SHADER_PREFIX = {
   srcSystem: "#define USF_USE_SRC_SYSTEM",
   mixSrc: "#define USF_USE_MIXSRC",
   mixDst: "#define USF_USE_MIXDST",
   levels: "#define USF_USE_LEVELS",
   contrast: "#define USF_USE_CONTRAST",
};

/*===============================================
functions
===============================================*/
export function handleUpdateFxShaderPrefixes(fxKey: FxKey): {
   vertex: string;
   fragment: string;
} {
   const { mixSrc, mixDst, srcSystem, levels, contrast } = fxKey;
   return {
      vertex: mergeShaderCode([
         srcSystem ? BASICFX_SHADER_PREFIX.srcSystem : "",
         mixSrc ? BASICFX_SHADER_PREFIX.mixSrc : "",
         mixDst ? BASICFX_SHADER_PREFIX.mixDst : "",
         "\n",
      ]),
      fragment: mergeShaderCode([
         srcSystem ? BASICFX_SHADER_PREFIX.srcSystem : "",
         mixSrc ? BASICFX_SHADER_PREFIX.mixSrc : "",
         mixDst ? BASICFX_SHADER_PREFIX.mixDst : "",
         levels ? BASICFX_SHADER_PREFIX.levels : "",
         contrast ? BASICFX_SHADER_PREFIX.contrast : "",
         "\n",
      ]),
   };
}

/** setterで定義される場合もあるため、valuesではなくuniformsから判定する */
export function getFxKeyFromUniforms(uniforms: BasicFxUniformsUnique): FxKey {
   const isMixSrc = uniforms.mixSrc.value ? true : false;
   const isMixDst = uniforms.mixDst.value ? true : false;
   const isSrcSystem = isMixSrc || isMixDst;
   return {
      mixSrc: isMixSrc,
      mixDst: isMixDst,
      srcSystem: isSrcSystem,
      levels: uniforms.levels.value ? true : false,
      contrast: uniforms.contrast.value ? true : false,
   };
}
