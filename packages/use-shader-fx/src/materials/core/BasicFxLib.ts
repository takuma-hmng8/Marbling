import * as THREE from "three";
import { TexturePipelineSrc } from "../../misc";
import { joinShaderPrefix } from "../../shaders/mergeShaderLib";
import { DefaultUniforms } from "./FxMaterial";
import { NestUniformValues } from "../../shaders/uniformsUtils";

/*===============================================
types
===============================================*/
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

/*===============================================
constants
===============================================*/
export const BASICFX_VALUES: BasicFxUniformsUnique = {
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

export const BASICFX_SHADER_PREFIX = {
   srcSystem: "#define USF_USE_SRC_SYSTEM",
   mixSrc: "#define USF_USE_MIXSRC",
   mixDst: "#define USF_USE_MIXDST",
};

/*===============================================
functions
===============================================*/
export function handleUpdateFxShaders(
   uniforms: BasicFxUniformsUnique,
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

export function handleUpdateFxShaderPrefixes(fxFlag: FxFlag): {
   vertex: string;
   fragment: string;
} {
   const { mixSrc, mixDst, srcSystem } = fxFlag;

   return {
      vertex: joinShaderPrefix([
         srcSystem ? BASICFX_SHADER_PREFIX.srcSystem : "",
         mixSrc ? BASICFX_SHADER_PREFIX.mixSrc : "",
         mixDst ? BASICFX_SHADER_PREFIX.mixDst : "",
         "\n",
      ]),
      fragment: joinShaderPrefix([
         srcSystem ? BASICFX_SHADER_PREFIX.srcSystem : "",
         mixSrc ? BASICFX_SHADER_PREFIX.mixSrc : "",
         mixDst ? BASICFX_SHADER_PREFIX.mixDst : "",
         "\n",
      ]),
   };
}

export function handleSetupDefaultFlag(uniformValues?: BasicFxValues): FxFlag {
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

export function calcAspectRatio({
   type,
   src,
   srcResolution,
   baseAspectRatio,
}: {
   type: FitType;
   src: TexturePipelineSrc;
   srcResolution: TextureResolution;
   baseAspectRatio: number;
}): {
   srcAspectRatio: number;
   fitScale: THREE.Vector2;
} {
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

export function hasMatchingKeys(
   target: { [key: string]: any } | null,
   source: { [key: string]: { value: any } }
) {
   if (!target) return false;
   return Object.keys(target).some((key) => Object.keys(source).includes(key));
}
