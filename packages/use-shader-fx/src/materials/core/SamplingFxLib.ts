import * as THREE from "three";
import { TexturePipelineSrc } from "../../misc";

import {
    NestUniformValues,    
    flattenUniformValues,
 } from "../../shaders/uniformsUtils";
import { joinShaderPrefix } from "../../shaders/mergeShaderLib";
import { 
    BasicFxFlag,
    BasicFxUniforms,
    BasicFxUniformsUnique,
    BasicFxValues,
    BasicFxLib,
    BASICFX_SHADER_PREFIX
} from "./BasicFxLib";



type SamplingFxUniformsUnique = {
    // texture
    texture_src: { value: TexturePipelineSrc };
    texture_resolution: { value: THREE.Vector2 };
} & BasicFxUniformsUnique;

const DEFAULT_SAMPLINGFX_VALUES:SamplingFxUniformsUnique = {
    // texture
    texture_src: { value: null },
    texture_resolution: { value: new THREE.Vector2() },
    ...BasicFxLib.DEFAULT_BASICFX_VALUES
}


export type SamplingFxUniforms = SamplingFxUniformsUnique & BasicFxUniforms;

export type SamplingFxValues = NestUniformValues<SamplingFxUniformsUnique> & BasicFxValues;

export type SamplingFxFlag = {
    texture: boolean;
} & BasicFxFlag;

/** valuesのkeyにbasicFxが含まれているかどうかの判定 */
// TODO : rename to isContainsBasicFxValues
function containsSamplingFxValues(values?: { [key: string]: any }): boolean {
    if (!values) return false;
    // THINK : ここでflattenUniformValuesを呼び出すべき？
    const _values = flattenUniformValues(values);
    return Object.keys(_values).some((key) =>
       Object.keys(DEFAULT_SAMPLINGFX_VALUES).includes(key as keyof SamplingFxValues)
    );
 }


function setupDefaultFlag(uniformValues?: SamplingFxValues): SamplingFxFlag {
    const isMixSrc = uniformValues?.mixSrc ? true : false;
    const isMixDst = uniformValues?.mixDst ? true : false;
    const isTexture = uniformValues?.texture ? true : false;
    const isSrcSystem = isMixSrc || isMixDst || isTexture
    return {        
        mixSrc: isMixSrc,
        mixDst: isMixDst,
        texture: isTexture,
        srcSystem: isSrcSystem,
    }
}

function handleUpdateSamplingFx(
    uniforms: SamplingFxUniforms,
    samplingFxFlag: SamplingFxFlag
): {
    validCount: number;
    updatedFlag: SamplingFxFlag;
} {

    const isTexture = uniforms.texture_src.value ? true : false;
    const isMixSrc = uniforms.mixSrc_src.value ? true : false;
    const isMixDst = uniforms.mixDst_src.value ? true : false; 
    const isSrcSystem = isMixSrc || isMixDst || isTexture;   

    const { texture, mixSrc, mixDst, srcSystem} = samplingFxFlag;

    const updatedFlag = samplingFxFlag;

    let validCount = 0;

    if (mixSrc !== isMixSrc) {
        updatedFlag.mixSrc = isMixSrc;
        validCount++;
     }
  
     if (mixDst !== isMixDst) {
        updatedFlag.mixDst = isMixDst;
        validCount++;
     }    

    if (isTexture !== texture) {
        updatedFlag.texture = isTexture;
        validCount++;
    }

    if(srcSystem !== isSrcSystem){
        updatedFlag.srcSystem = isSrcSystem;      
        validCount++;
    }

    return {
        validCount,
        updatedFlag
    }
}

const SAMPLINGFX_SHADER_PREFIX = {    
    ...BASICFX_SHADER_PREFIX,
    texture: '#define USF_USE_TEXTURE',
}


function handleUpdateSamplingFxPrefix(samplingFxFlag: SamplingFxFlag): {
    prefixVertex: string;
    prefixFragment: string;
} {
    const { mixSrc, mixDst, texture, srcSystem} = samplingFxFlag;

    const prefixVertex = joinShaderPrefix([
        srcSystem ? BASICFX_SHADER_PREFIX.srcSystem : "",
        mixSrc ? SAMPLINGFX_SHADER_PREFIX.mixSrc : "",
        mixDst ? SAMPLINGFX_SHADER_PREFIX.mixDst : "",              
        texture ? SAMPLINGFX_SHADER_PREFIX.texture : "",          
        "\n",
    ]);    

    const prefixFragment = joinShaderPrefix([
        srcSystem ? BASICFX_SHADER_PREFIX.srcSystem : "",
        mixSrc ? SAMPLINGFX_SHADER_PREFIX.mixSrc : "",
        mixDst ? SAMPLINGFX_SHADER_PREFIX.mixDst : "",              
        texture ? SAMPLINGFX_SHADER_PREFIX.texture : "",  
        "\n",
    ]);

    return {
        prefixVertex,
        prefixFragment
    }
}


export const SamplingFxLib = {
    DEFAULT_SAMPLINGFX_VALUES,
    setupDefaultFlag,
    handleUpdateSamplingFxPrefix,
    handleUpdateSamplingFx,
    containsSamplingFxValues
};