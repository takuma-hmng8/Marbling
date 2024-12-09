import * as THREE from "three";
import { FxMaterial, FxMaterialProps, DefaultUniforms } from "./FxMaterial";
import { TexturePipelineSrc } from "../../misc";
import {
   NestUniformValues,
   flattenUniformValues,
} from "../../shaders/uniformsUtils";
import {
   joinShaderPrefix
} from '../../shaders/mergeShaderLib';
import { mergeShaderLib } from "../../shaders/mergeShaderLib";


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

export type BasicFxUniforms = BasicFxUniformsUnique & DefaultUniforms;

export type BasicFxValues = NestUniformValues<BasicFxUniformsUnique>;

export type FxFlag = {   
   srcSystem: boolean; // is active srcSystem
   mixSrc: boolean;
   mixDst: boolean;
};

export class BasicFxMaterial extends FxMaterial {   

   static readonly DEFAULT_VALUES = {
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
   }   

   static readonly SHADER_PREFIX = {
      srcSystem: "#define USF_USE_SRC_SYSTEM",
      mixSrc: "#define USF_USE_MIXSRC",
      mixDst: "#define USF_USE_MIXDST",
   }

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
            BasicFxMaterial.DEFAULT_VALUES,            
            uniforms || {},
         ]),
      });

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;
      this.vertexPrefixCache = "";
      this.fragmentPrefixCache = "";
      this.programCache = 0;

      this.fxFlag = this.setupDefaultFlag(uniformValues);

      this.setupBasicFxShaders(vertexShader, fragmentShader);
   }

   updateBasicFx() {
      // shaderのsetup前は実行しない
      if (!this.fxFlag) return;

      const _cache = this.programCache;

      const { validCount, updatedFlag } = this.handleUpdateBasicFx(
         this.uniforms,
         this.fxFlag
      );

      this.programCache += validCount;
      this.fxFlag = updatedFlag;

      if (_cache !== this.programCache) {
         this.updateBasicFxPrefix();
         this.updateBasicFxShader();
         this.version++; // same as this.needsUpdate = true;
      }
   }

   updateBasicFxPrefix() {
      const { prefixVertex, prefixFragment } =
         this.handleUpdateBasicFxPrefix(this.fxFlag);
      
      this.vertexPrefixCache = prefixVertex;
      this.fragmentPrefixCache = prefixFragment;
   }

   updateBasicFxShader() {
      this.vertexShader = this.vertexPrefixCache + this.vertexShaderCache;
      this.fragmentShader = this.fragmentPrefixCache + this.fragmentShaderCache;
   }

   setupBasicFxShaders(vertexShader?: string, fragmentShader?: string) {
      if (!vertexShader && !fragmentShader) return;

      this.updateBasicFxPrefix();

      const [vertex, fragment] = mergeShaderLib(
         vertexShader,
         fragmentShader,
         "basicFx"
      );      

      super.setupDefaultShaders(vertex, fragment);      
            
      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;

      this.updateBasicFxShader();
   }

   /*===============================================
	override super class method
	===============================================*/
   setUniformValues(values?: { [key: string]: any }) {
      // THINK : `flattenUniformValues`するのはこのレイヤーの方がいいかも
      super.setUniformValues(values);
      // THINK : flattenUniformValuesしたあとで、containsBasicFxValuesに渡せばいい。containsBasicFxValuesでflattenUniformValuesを実行してるので、二度手間になっている
      if (this.containsBasicFxValues(values)) {
         this.updateBasicFx();
      }
   }

   defineUniformAccessors(onSet?: () => void) {
      super.defineUniformAccessors(() => {
         this.updateBasicFx();
         onSet?.();
      });
   }

   // 
   /** valuesのkeyにbasicFxが含まれているかどうかの判定 */
   // TODO : rename to isContainsBasicFxValues
   containsBasicFxValues(values?: { [key: string]: any }): boolean {
      if (!values) return false;
      // THINK : ここでflattenUniformValuesを呼び出すべき？
      const _values = flattenUniformValues(values);
      return Object.keys(_values).some((key) =>
         Object.keys(BasicFxMaterial.DEFAULT_VALUES).includes(key as keyof BasicFxValues)      
      );
   }   

   setupDefaultFlag(uniformValues?: BasicFxValues): FxFlag {   
      const isMixSrc = uniformValues?.mixSrc ? true : false;
      const isMixDst = uniformValues?.mixDst ? true : false;   
      const isSrcSystem = isMixSrc || isMixDst;   
      return {
         // THINK : `handleUpdateBasicFx`での判定は、uniformの値で行っている.例えばsaturation・brightnessとかはどう判定する？
         // THINK : `isMixSrc` みたいなuniform値をつくる？ uniformValues?.mixSrcを判定するイメージ      
         mixSrc: isMixSrc,
         mixDst: isMixDst,
         srcSystem: isSrcSystem,
      };
   }    

   handleUpdateBasicFx(
      uniforms: BasicFxUniforms,
      fxFlag: FxFlag
   ): {
      validCount: number;
      updatedFlag: FxFlag;
   } {
      // THINK : `handleUpdateBasicFx`での判定は、uniformの値で行っている.例えばsaturation・brightnessとかはどう判定する？
      // THINK : `isMixSrc` みたいなuniform値をつくる？ uniformValues?.mixSrcを判定するイメージ
      const isMixSrc = uniforms.mixSrc_src.value ? true : false;
      const isMixDst = uniforms.mixDst_src.value ? true : false;
      const isSrcSystem = (isMixSrc || isMixDst);
   
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
   
      if(srcSystem !== isSrcSystem){
         updatedFlag.srcSystem = isSrcSystem;      
         validCount++;
      }
   
      return {
         validCount,
         updatedFlag,
      };
   }    
   
   
   handleUpdateBasicFxPrefix(fxFlag: FxFlag): {
      prefixVertex: string;
      prefixFragment: string;
   } {
      const { mixSrc, mixDst, srcSystem} = fxFlag;
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
}
