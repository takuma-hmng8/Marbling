import * as THREE from "three";
import { DefaultUniforms } from "./FxMaterial";
import { TexturePipelineSrc } from "../../misc";
import {
   NestUniformValues,
   flattenUniformValues,
} from "../../shaders/uniformsUtils";

/*===============================================
basic fxを追加するときはこことShaderChunk,Libを編集する
===============================================*/
type BasicFxUniformsUnique = {
   // mixSrc
   mixSrc_src: { value: TexturePipelineSrc };
   mixSrc_resolution: { value: THREE.Vector2 };
   mixSrc_uvFactor: { value: number };
   mixSrc_alphaFactor: { value: number };
   mixSrc_colorFactor: { value: number };
   // mixDst
   mixDst_src: { value: TexturePipelineSrc };
   mixDst_resolution: { value: THREE.Vector2 };
   mixDst_uvFactor: { value: number };
   mixDst_alphaFactor: { value: number };
   mixDst_colorFactor: { value: number };
};
const DEFAULT_BASICFX_VALUES: BasicFxUniformsUnique = {
   // mixSrc
   mixSrc_src: { value: null },
   mixSrc_resolution: { value: new THREE.Vector2() },
   mixSrc_uvFactor: { value: 0 },
   mixSrc_alphaFactor: { value: 0 },
   mixSrc_colorFactor: { value: 0 },
   // mixDst
   mixDst_src: { value: null },
   mixDst_resolution: { value: new THREE.Vector2() },
   mixDst_uvFactor: { value: 0 },
   mixDst_alphaFactor: { value: 0 },
   mixDst_colorFactor: { value: 0 },
};

export type BasicFxUniforms = BasicFxUniformsUnique & DefaultUniforms;

export type BasicFxValues = NestUniformValues<BasicFxUniformsUnique>;

export type BasicFxFlag = {
   mixSrc: boolean;
   mixDst: boolean;
};

/** valuesのkeyにbasicFxが含まれているかどうかの判定 */
// TODO : rename to isContainsBasicFxValues
function containsBasicFxValues(values?: { [key: string]: any }): boolean {
   if (!values) return false;
   // THINK : ここでflattenUniformValuesを呼び出すべき？
   const _values = flattenUniformValues(values);
   return Object.keys(_values).some((key) =>
      Object.keys(DEFAULT_BASICFX_VALUES).includes(key as keyof BasicFxValues)
   );
}

function setupDefaultFlag(uniformValues?: BasicFxValues): BasicFxFlag {
   return {
      // THINK : `handleUpdateBasicFx`での判定は、uniformの値で行っている.例えばsaturation・brightnessとかはどう判定する？
      // THINK : `isMixSrc` みたいなuniform値をつくる？ uniformValues?.mixSrcを判定するイメージ
      mixSrc: uniformValues?.mixSrc ? true : false,
      mixDst: uniformValues?.mixDst ? true : false,
   };
}

function handleUpdateBasicFx(
   uniforms: BasicFxUniforms,
   basicFxFlag: BasicFxFlag
): {
   validCount: number;
   updatedFlag: BasicFxFlag;
} {
   // THINK : `handleUpdateBasicFx`での判定は、uniformの値で行っている.例えばsaturation・brightnessとかはどう判定する？
   // THINK : `isMixSrc` みたいなuniform値をつくる？ uniformValues?.mixSrcを判定するイメージ
   const isMixSrc = uniforms.mixSrc_src.value ? true : false;
   const isMixDst = uniforms.mixDst_src.value ? true : false;

   const { mixSrc, mixDst } = basicFxFlag;

   const updatedFlag = basicFxFlag;

   let validCount = 0;

   if (mixSrc !== isMixSrc) {
      updatedFlag.mixSrc = isMixSrc;
      validCount++;
   }

   if (mixDst !== isMixDst) {
      updatedFlag.mixDst = isMixDst;
      validCount++;
   }

   return {
      validCount,
      updatedFlag,
   };
}

function filterEmptyLine(string: string) {
   return string !== "";
}

const BASICFX_SHADER_PREFIX = {
   mixSrc: "#define USF_USE_MIXSRC",
   mixDst: "#define USF_USE_MIXDST",
};

function handleUpdateBasicFxPrefix(basicFxFlag: BasicFxFlag): {
   prefixVertex: string;
   prefixFragment: string;
} {
   const { mixSrc, mixDst } = basicFxFlag;
   const prefixVertex = [
      mixSrc ? BASICFX_SHADER_PREFIX.mixSrc : "",
      mixDst ? BASICFX_SHADER_PREFIX.mixDst : "",
      "\n",
   ]
      .filter(filterEmptyLine)
      .join("\n");
   const prefixFragment = [
      mixSrc ? BASICFX_SHADER_PREFIX.mixSrc : "",
      mixDst ? BASICFX_SHADER_PREFIX.mixDst : "",
      "\n",
   ]
      .filter(filterEmptyLine)
      .join("\n");

   return {
      prefixVertex,
      prefixFragment,
   };
}

export const BasicFxLib = {
   DEFAULT_BASICFX_VALUES,
   setupDefaultFlag,
   handleUpdateBasicFx,
   handleUpdateBasicFxPrefix,
   containsBasicFxValues,
};
