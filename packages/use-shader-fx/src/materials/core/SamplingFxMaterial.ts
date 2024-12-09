import * as THREE from 'three';
import { FxMaterialProps } from './FxMaterial';
import { TexturePipelineSrc } from "../../misc";
import {
    NestUniformValues,
    flattenUniformValues,
} from "../../shaders/uniformsUtils";
import { 
    mergeShaderLib,
    joinShaderPrefix
} from '../../shaders/mergeShaderLib';
import { 
    BasicFxMaterial,    
    BasicFxValues,
    BasicFxUniforms,
    FxFlag as BasicFxFlag,
} from './BasicFxMaterial';


type SamplingFxUniformsUnique = {
    // texture
    texture_src: { value: TexturePipelineSrc };
    texture_resolution: { value: THREE.Vector2 };
} & typeof BasicFxMaterial.DEFAULT_VALUES;

export type SamplingFxUniforms = SamplingFxUniformsUnique & BasicFxUniforms;

export type SamplingFxValues = NestUniformValues<SamplingFxUniformsUnique> & BasicFxValues;

export type FxFlag = {
    texture: boolean;
} & BasicFxFlag;


export class SamplingFxMaterial extends BasicFxMaterial {    

    static readonly DEFAULT_VALUES:SamplingFxUniformsUnique = {
        ...BasicFxMaterial.DEFAULT_VALUES,
        // texture
        texture_src: { value: null },
        texture_resolution: { value: new THREE.Vector2() },        
    }

    static readonly SHADER_PREFIX = {
        ...BasicFxMaterial.SHADER_PREFIX,
        texture: '#define USF_USE_TEXTURE',
    }

    fxFlag: FxFlag;

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
                SamplingFxMaterial.DEFAULT_VALUES,
                uniforms || {}
            ])
        })

        this.vertexShaderCache = this.vertexShader;
        this.fragmentShaderCache = this.fragmentShader;
        this.vertexPrefixCache = "";
        this.fragmentPrefixCache = "";
        this.programCache = 0;

        this.fxFlag = this.setupDefaultFlag(uniformValues);

        this.setupSamplingFxShaders(vertexShader, fragmentShader);    
    }

    updateSamplingFx() {

        if(!this.fxFlag) return;

        const __cache = this.programCache;

        const { validCount, updatedFlag} = this.handleUpdateSamplingFx(
            this.uniforms,
            this.fxFlag
        );

        this.programCache += validCount;
        this.fxFlag = updatedFlag;

        if(__cache !== this.programCache) {
            this.updateSamplingFxPrefix();
            this.updateSamplingFxShader();
            this.version++;
        }
    }

    updateSamplingFxPrefix() {
        const { prefixVertex, prefixFragment} =
            this.handleUpdateSamplingFxPrefix(this.fxFlag);            
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

        if(this.containsSamplingFxValues(values)) {
            this.updateSamplingFx();
        }
    }

    defineUniformAccessors(onSet?: () => void) {
        super.defineUniformAccessors(() => {
           this.updateSamplingFx();
           onSet?.();
        });
    }

    // 
    containsSamplingFxValues(values?: { [key: string]: any }): boolean {
        if (!values) return false;
        // THINK : ここでflattenUniformValuesを呼び出すべき？
        const _values = flattenUniformValues(values);
        return Object.keys(_values).some((key) =>
           Object.keys(SamplingFxMaterial.DEFAULT_VALUES).includes(key as keyof SamplingFxValues)
        );
    }    

    setupDefaultFlag(uniformValues?: SamplingFxValues): FxFlag {
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

    handleUpdateSamplingFx(
        uniforms: SamplingFxUniforms,
        fxFlag: FxFlag
    ): {
        validCount: number;
        updatedFlag: FxFlag;
    } {
    
        const isTexture = uniforms.texture_src.value ? true : false;
        const isMixSrc = uniforms.mixSrc_src.value ? true : false;
        const isMixDst = uniforms.mixDst_src.value ? true : false; 
        const isSrcSystem = isMixSrc || isMixDst || isTexture;   
    
        const { texture, mixSrc, mixDst, srcSystem} = fxFlag;
    
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

    handleUpdateSamplingFxPrefix(fxFlag: FxFlag): {
        prefixVertex: string;
        prefixFragment: string;
    } {
        const { mixSrc, mixDst, texture, srcSystem} = fxFlag;

        const SHADER_PREFIX = SamplingFxMaterial.SHADER_PREFIX;        
    
        const prefixVertex = joinShaderPrefix([
            srcSystem ? SHADER_PREFIX.srcSystem : "",
            mixSrc ? SHADER_PREFIX.mixSrc : "",            
            mixDst ? SHADER_PREFIX.mixDst : "",              
            texture ? SHADER_PREFIX.texture : "",          
            "\n",
        ]);    
    
        const prefixFragment = joinShaderPrefix([
            srcSystem ? SHADER_PREFIX.srcSystem : "",
            mixSrc ? SHADER_PREFIX.mixSrc : "",
            mixDst ? SHADER_PREFIX.mixDst : "",              
            texture ? SHADER_PREFIX.texture : "",  
            "\n",
        ]);
    
        return {
            prefixVertex,
            prefixFragment
        }
    }

};