import * as THREE from 'three';
import { FxMaterial, FxMaterialProps } from './FxMaterial';

import {
    SamplingFxUniforms,
    SamplingFxValues,
    SamplingFxLib,
    SamplingFxFlag
} from './SamplingFxLib';
import { mergeShaderLib } from '../../shaders/mergeShaderLib';


// SamplingFxMaterial
// mixSrc, mixDst, textureはsrcとなるtexutreを受け取る


export class SamplingFxMaterial extends FxMaterial {
    public static readonly key: string = THREE.MathUtils.generateUUID();

    samplingFxFlag: SamplingFxFlag;

    uniforms!: SamplingFxUniforms;

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
        fragmentShader
    }: FxMaterialProps<SamplingFxValues>) {
        super({
            uniformValues,
            materialParameters,
            uniforms: THREE.UniformsUtils.merge([
                SamplingFxLib.DEFAULT_SAMPLINGFX_VALUES,
                uniforms || {}
            ])
        })

        this.vertexShaderCache = this.vertexShader;
        this.fragmentShaderCache = this.fragmentShader;
        this.vertexPrefixCache = "";
        this.fragmentPrefixCache = "";
        this.programCache = 0;

        this.samplingFxFlag = SamplingFxLib.setupDefaultFlag(uniformValues);

        this.setupSamplingFxShaders(vertexShader, fragmentShader);    
    }

    updateSamplingFx() {

        if(!this.samplingFxFlag) return;

        const __cache = this.programCache;

        const { validCount, updatedFlag} = SamplingFxLib.handleUpdateSamplingFx(
            this.uniforms,
            this.samplingFxFlag
        );

        this.programCache += validCount;
        this.samplingFxFlag = updatedFlag;

        if(__cache !== this.programCache) {
            this.updateSamplingFxPrefix();
            this.updateSamplingFxShader();
            this.version++;
        }
    }

    updateSamplingFxPrefix() {
        const { prefixVertex, prefixFragment} =
            SamplingFxLib.handleUpdateSamplingFxPrefix(this.samplingFxFlag);            
        this.vertexPrefixCache = prefixVertex;
        this.fragmentPrefixCache = prefixFragment;
    }

    updateSamplingFxShader() {
        this.vertexShader = this.vertexPrefixCache + this.vertexShaderCache;
        this.fragmentShader = this.fragmentPrefixCache + this.fragmentShaderCache;
    }

    setupSamplingFxShaders(vertexShader?: string, fragmentShader?: string) {
        if (!vertexShader && !fragmentShader) return;

        this.updateSamplingFxPrefix();

        const [vertex, fragment] = mergeShaderLib(
            vertexShader,
            fragmentShader,
            'samplingFx'
        );

        super.setupDefaultShaders(vertex, fragment);

        this.vertexShaderCache = this.vertexShader;
        this.fragmentShaderCache = this.fragmentShader;

        this.updateSamplingFxShader();                
    }

    setUniformValues(values?: { [key: string]: any }) {
        
        super.setUniformValues(values)

        if(SamplingFxLib.containsSamplingFxValues(values)) {
            this.updateSamplingFx();
        }
    }

    defineUniformAccessors(onSet?: () => void) {
        super.defineUniformAccessors(() => {
           this.updateSamplingFx();
           onSet?.();
        });
     }    

};