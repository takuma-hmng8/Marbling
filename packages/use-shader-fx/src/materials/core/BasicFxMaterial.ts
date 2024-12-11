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
import { mergeShaderLib, ShaderLibType } from "../../shaders/mergeShaderLib";


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

export type BasicFxUniforms = {
   mixSrc_aspectRatio: { value: number };   
   mixSrc_fitScale: { value: THREE.Vector2 };
   mixDst_aspectRatio: { value: number };   
   mixDst_fitScale: { value: THREE.Vector2 };
} & BasicFxUniformsUnique & DefaultUniforms;

type FxValues = NestUniformValues<BasicFxUniformsUnique>;
export type BasicFxValues = FxValues;

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
      mixSrc_aspectRatio: { value: 0 }, // private      
      mixSrc_fitScale: { value: new THREE.Vector2(1, 1) }, // private

      // mixDst
      mixDst_src: { value: null },
      mixDst_resolution: { value: new THREE.Vector2() },
      mixDst_uvFactor: { value: 0 },
      mixDst_alphaFactor: { value: 0 },
      mixDst_colorFactor: { value: 0 },
      mixDst_aspectRatio: { value: 0 }, // private      
      mixDst_fitScale: { value: new THREE.Vector2(1, 1) }, // private
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

      this.setupFxShaders(vertexShader, fragmentShader);
   }

   updateFx() {
      // shaderのsetup前は実行しない
      if (!this.fxFlag) return;

      const _cache = this.programCache;

      const { validCount, updatedFlag } = this.handleUpdateFx(
         this.uniforms,
         this.fxFlag
      );

      this.programCache += validCount;
      this.fxFlag = updatedFlag;

      if (_cache !== this.programCache) {
         this.updateFxPrefix();
         this.updateShader();
         this.version++; // same as this.needsUpdate = true;
      }
   }

   updateFxPrefix() {
      const { prefixVertex, prefixFragment } =
         this.handleUpdateFxPrefix(this.fxFlag);      
      this.vertexPrefixCache = prefixVertex;
      this.fragmentPrefixCache = prefixFragment;
   }

   updateShader() {
      this.vertexShader = this.vertexPrefixCache + this.vertexShaderCache;
      this.fragmentShader = this.fragmentPrefixCache + this.fragmentShaderCache;
   }

   setupFxShaders(vertexShader?: string, fragmentShader?: string, shaderType: ShaderLibType = "basicFx") {
      if (!vertexShader && !fragmentShader) return;

      this.updateFxPrefix();

      const [vertex, fragment] = mergeShaderLib(
         vertexShader,
         fragmentShader,
         shaderType
      );      

      super.setupDefaultShaders(vertex, fragment);      
            
      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;

      this.updateShader();
   }

   /*===============================================
	override super class method
	===============================================*/
   setUniformValues(values?: { [key: string]: any }) {      
      // THINK : `flattenUniformValues`するのはこのレイヤーの方がいいかも
      super.setUniformValues(values);
      // THINK : flattenUniformValuesしたあとで、isContainsFxValuesに渡せばいい。isContainsFxValuesでflattenUniformValuesを実行してるので、二度手間になっている
      if (this.isContainsFxValues(values)) {         
         this.updateFx();
      }
   }

   calcAspectRatio(src?: TexturePipelineSrc, srcResolution?: THREE.Vector2): {
      srcAspectRatio: number;
      fitScale: THREE.Vector2;
   } {
      const screenAspectRatio = this.uniforms.aspectRatio.value;      
            
      // srcがない場合はnullを返す      
      if(!src) {
         return {
            srcAspectRatio: this.uniforms.aspectRatio.value,
            fitScale: new THREE.Vector2(1, 1),
         };
      };

      // srcがあり、 resolutionがないまたは、0,0の場合は、srcのサイズを返す
      if(!srcResolution || !srcResolution.x || !srcResolution.y) {  
         const _aspectRatio = src.image.width / src.image.height;             
         return {
            srcAspectRatio: _aspectRatio,
            fitScale: new THREE.Vector2(
               Math.min(screenAspectRatio / _aspectRatio, 1),
               Math.min(_aspectRatio / screenAspectRatio, 1)
            ),
         };
      }

      // それ以外の場合は、resolutionのアスペクト比を返す
      if(srcResolution) {
         const _aspectRatio = srcResolution.x / srcResolution.y;         
         return {
            srcAspectRatio: srcResolution.x / srcResolution.y,
            fitScale: new THREE.Vector2(
               Math.min(screenAspectRatio / _aspectRatio, 1),
               Math.min(_aspectRatio / screenAspectRatio, 1)               
            ),
         };
      }

      return {
         srcAspectRatio: this.uniforms.aspectRatio.value,
         fitScale: new THREE.Vector2(1, 1),
      };
   }

   updateResolution(resolution: THREE.Vector2) {
      super.updateResolution(resolution);      

      const mixSrcAspect = this.calcAspectRatio(
         this.uniforms.mixSrc_src?.value,
         this.uniforms.mixSrc_resolution?.value
      );
      this.uniforms.mixSrc_aspectRatio.value = mixSrcAspect.srcAspectRatio;
      this.uniforms.mixSrc_fitScale.value = mixSrcAspect.fitScale;

      const mixDstAspect = this.calcAspectRatio(
         this.uniforms.mixDst_src?.value,
         this.uniforms.mixDst_resolution?.value
      );
      this.uniforms.mixDst_aspectRatio.value = mixDstAspect.srcAspectRatio;
      this.uniforms.mixDst_fitScale.value = mixDstAspect.fitScale;
   }

   defineUniformAccessors(onSet?: () => void) {
      super.defineUniformAccessors(() => {
         this.updateFx();
         onSet?.();
      });
   }

   // 
   /** valuesのkeyにbasicFxが含まれているかどうかの判定 */   
   isContainsFxValues(values?: { [key: string]: any }): boolean {
      if (!values) return false;
      // THINK : ここでflattenUniformValuesを呼び出すべき？
      const _values = flattenUniformValues(values);
      return Object.keys(_values).some((key) =>
         Object.keys(BasicFxMaterial.DEFAULT_VALUES).includes(key as keyof FxValues)      
      );
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

   handleUpdateFx(
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
   
   
   handleUpdateFxPrefix(fxFlag: FxFlag): {
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
