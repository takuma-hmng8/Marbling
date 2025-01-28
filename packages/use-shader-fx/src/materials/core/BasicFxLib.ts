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

export type BasicFxUniformsUnique = {
   // mixSrc
   mixSrc: { value: UniformParentKey };
   mixSrc_src: { value: THREE.Texture };
   mixSrc_fit: { value: FitType };
   mixSrc_uvFactor: { value: number };
   mixSrc_alphaFactor: { value: number };
   mixSrc_colorFactor: { value: number };
   // mixDst
   mixDst: { value: UniformParentKey };
   mixDst_src: { value: THREE.Texture };
   mixDst_fit: { value: FitType };
   mixDst_uv: { value: UniformParentKey };
   mixDst_uv_factor: { value: number };
   mixDst_uv_offset: { value: THREE.Vector2 };
   mixDst_uv_radius: { value: number }; // 負の値は画面全体
   mixDst_uv_position: { value: THREE.Vector2 };
   mixDst_color: { value: UniformParentKey };
   mixDst_color_factor: { value: number };
   mixDst_color_radius: { value: number }; // 負の値は画面全体
   mixDst_color_position: { value: THREE.Vector2 };
   mixDst_alpha: { value: UniformParentKey };
   mixDst_alpha_factor: { value: number };
   mixDst_alpha_radius: { value: number }; // 負の値は画面全体
   mixDst_alpha_position: { value: THREE.Vector2 };
   // levels
   levels: { value: UniformParentKey };
   levels_shadows: { value: THREE.Vector4 };
   levels_midtones: { value: THREE.Vector4 };
   levels_highlights: { value: THREE.Vector4 };
   levels_outputMin: { value: THREE.Vector4 };
   levels_outputMax: { value: THREE.Vector4 };
   // contrast
   contrast: { value: UniformParentKey };
   contrast_factor: { value: THREE.Vector4 };
   // colorBalance
   colorBalance: { value: UniformParentKey };
   colorBalance_factor: { value: THREE.Vector3 };
   // hsv
   hsv: { value: UniformParentKey };
   hsv_hueShift: { value: number }; // 色相を +X 度分回転 (0.0~1.0 で0~360度)
   hsv_saturation: { value: number }; // 彩度乗算 (1.0で変化なし)
   hsv_brightness: { value: number }; // 明度乗算 (1.0で変化なし)
   // posterize
   posterize: { value: UniformParentKey };
   posterize_levels: { value: THREE.Vector4 };
   // grayscale
   grayscale: { value: UniformParentKey };
   grayscale_weight: { value: THREE.Vector3 };
   grayscale_duotone: { value: UniformParentKey };
   grayscale_duotone_color0: { value: THREE.Color };
   grayscale_duotone_color1: { value: THREE.Color };
   grayscale_threshold: { value: number }; // 0~1 負の値は処理をスキップする
};

// BasicFxValuesの型からfitScaleを排除する
type BasicFxUniformsFitScale = {
   mixSrc_fitScale: { value: THREE.Vector2 };
   mixDst_fitScale: { value: THREE.Vector2 };
};

export type BasicFxUniforms = BasicFxUniformsUnique & DefaultUniforms;

export type BasicFxValues = NestUniformValues<BasicFxUniforms>;

export type FxKey = {
   srcSystem: boolean;
   mixSrc: boolean;
   mixDst: boolean;
   levels: boolean;
   contrast: boolean;
   colorBalance: boolean;
   hsv: boolean;
   posterize: boolean;
   grayscale: boolean;
};

export type SrcSystemKey = "mixSrc" | "mixDst" | "texture";

/*===============================================
constants
===============================================*/
export const BASICFX_VALUES: BasicFxUniformsUnique & BasicFxUniformsFitScale = {
   // mixSrc
   mixSrc: { value: false },
   mixSrc_src: { value: new THREE.Texture() },
   mixSrc_uvFactor: { value: 0 },
   mixSrc_alphaFactor: { value: 0 },
   mixSrc_colorFactor: { value: 0 },
   mixSrc_fit: { value: "fill" },
   mixSrc_fitScale: { value: new THREE.Vector2(1, 1) },
   // mixDst
   mixDst: { value: false },
   mixDst_src: { value: new THREE.Texture() },
   mixDst_fit: { value: "fill" },
   mixDst_fitScale: { value: new THREE.Vector2(1, 1) },
   mixDst_uv: { value: false },
   mixDst_uv_factor: { value: 0 },
   mixDst_uv_offset: { value: new THREE.Vector2(0, 0) },
   mixDst_uv_radius: { value: 0.5 },
   mixDst_uv_position: { value: new THREE.Vector2(0.5, 0.5) },
   mixDst_color: { value: false },
   mixDst_color_factor: { value: 0 },
   mixDst_color_radius: { value: 0.5 },
   mixDst_color_position: { value: new THREE.Vector2(0.5, 0.5) },
   mixDst_alpha: { value: false },
   mixDst_alpha_factor: { value: 0 },
   mixDst_alpha_radius: { value: 0.5 },
   mixDst_alpha_position: { value: new THREE.Vector2(0.5, 0.5) },
   // levels
   levels: { value: false },
   levels_shadows: { value: new THREE.Vector4(0, 0, 0, 0) },
   levels_midtones: { value: new THREE.Vector4(1, 1, 1, 1) },
   levels_highlights: { value: new THREE.Vector4(1, 1, 1, 1) },
   levels_outputMin: { value: new THREE.Vector4(0, 0, 0, 0) },
   levels_outputMax: { value: new THREE.Vector4(1, 1, 1, 1) },
   // contrast
   contrast: { value: false },
   contrast_factor: { value: new THREE.Vector4(1, 1, 1, 1) },
   // colorBalance
   colorBalance: { value: false },
   colorBalance_factor: { value: new THREE.Vector3(1, 1, 1) },
   // hsv
   hsv: { value: false },
   hsv_hueShift: { value: 0 },
   hsv_saturation: { value: 1 },
   hsv_brightness: { value: 1 },
   // posterize
   posterize: { value: false },
   posterize_levels: { value: new THREE.Vector4(0, 0, 0, 0) },
   // grayscale
   grayscale: { value: false },
   grayscale_weight: { value: new THREE.Vector3(0, 0, 0) },
   grayscale_duotone: { value: false },
   grayscale_duotone_color0: { value: new THREE.Color(0x000000) },
   grayscale_duotone_color1: { value: new THREE.Color(0xffffff) },
   grayscale_threshold: { value: -1 },
};

export const BASICFX_SHADER_PREFIX = {
   srcSystem: "#define USF_USE_SRC_SYSTEM",
   mixSrc: "#define USF_USE_MIXSRC",
   mixDst: "#define USF_USE_MIXDST",
   levels: "#define USF_USE_LEVELS",
   contrast: "#define USF_USE_CONTRAST",
   colorBalance: "#define USF_USE_COLORBALANCE",
   hsv: "#define USF_USE_HSV",
   posterize: "#define USF_USE_POSTERIZE",
   grayscale: "#define USF_USE_GRAYSCALE",
};

/*===============================================
functions
===============================================*/
export function handleUpdateFxShaderPrefixes(fxKey: FxKey): {
   vertex: string;
   fragment: string;
} {
   const {
      mixSrc,
      mixDst,
      srcSystem,
      levels,
      contrast,
      colorBalance,
      hsv,
      posterize,
      grayscale,
   } = fxKey;
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
         colorBalance ? BASICFX_SHADER_PREFIX.colorBalance : "",
         hsv ? BASICFX_SHADER_PREFIX.hsv : "",
         posterize ? BASICFX_SHADER_PREFIX.posterize : "",
         grayscale ? BASICFX_SHADER_PREFIX.grayscale : "",
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
      colorBalance: uniforms.colorBalance.value ? true : false,
      hsv: uniforms.hsv.value ? true : false,
      posterize: uniforms.posterize.value ? true : false,
      grayscale: uniforms.grayscale.value ? true : false,
   };
}
