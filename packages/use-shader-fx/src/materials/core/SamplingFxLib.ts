import * as THREE from "three";
import { DefaultUniforms } from "./FxMaterial";
import { TexturePipelineSrc } from "../../misc";

import {
    NestUniformValues,    
    flattenUniformValues,
 } from "../../shaders/uniformsUtils";
import { joinShaderPrefix } from "../../shaders/mergeShaderLib";



type SamplingFxUniformsUnique = {
    // texture
    texture_src: { value: TexturePipelineSrc };
    texture_resolution: { value: THREE.Vector2 };
};

const DEFAULT_SAMPLINGFX_VALUES:SamplingFxUniformsUnique = {
    texture_src: { value: null },
    texture_resolution: { value: new THREE.Vector2() },
}


export type SamplingFxUniforms = SamplingFxUniformsUnique & DefaultUniforms;

export type SamplingFxValues = NestUniformValues<SamplingFxUniformsUnique>;

export type SamplingFxFlag = {
    texture: boolean;
}

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
    return {
        texture: uniformValues?.texture ? true : false        
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

    const { texture } = samplingFxFlag;

    const updatedFlag = samplingFxFlag;

    let validCount = 0;

    if (isTexture !== texture) {
        updatedFlag.texture = isTexture;
        validCount++;
    }

    return {
        validCount,
        updatedFlag
    }
}

const SAMPLINGFX_SHADER_PREFIX = {
    texture: '#define USF_USE_TEXTURE',
}


function handleUpdateSamplingFxPrefix(samplingFxFlag: SamplingFxFlag): {
    prefixVertex: string;
    prefixFragment: string;
} {
    const { texture } = samplingFxFlag;

    const prefixVertex = joinShaderPrefix([
        texture ? SAMPLINGFX_SHADER_PREFIX.texture : "",
        "\m",
    ]);    

    const prefixFragment = joinShaderPrefix([
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