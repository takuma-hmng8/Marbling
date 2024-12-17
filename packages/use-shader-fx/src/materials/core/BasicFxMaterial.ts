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

export type FitType = "fill" | "cover" | "contain";

type BasicFxUniformsUnique = {   
   // mixSrc
   mixSrc_src: { value: TexturePipelineSrc };
   mixSrc_resolution: { value: THREE.Vector2 };
   mixSrc_uvFactor: { value: number };
   mixSrc_alphaFactor: { value: number };
   mixSrc_colorFactor: { value: number };      
   mixSrc_fit: { value: FitType };

   // mixDst
   mixDst_src: { value: TexturePipelineSrc };
   mixDst_resolution: { value: THREE.Vector2 };
   mixDst_uvFactor: { value: number };
   mixDst_alphaFactor: { value: number };
   mixDst_colorFactor: { value: number };
   mixDst_fit: { value: FitType };
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
      mixSrc_fit: { value: "fill" },
      mixSrc_aspectRatio: { value: 0 }, // private      
      mixSrc_fitScale: { value: new THREE.Vector2(1, 1) }, // private

      // mixDst
      mixDst_src: { value: null },
      mixDst_resolution: { value: new THREE.Vector2() },
      mixDst_uvFactor: { value: 0 },
      mixDst_alphaFactor: { value: 0 },
      mixDst_colorFactor: { value: 0 },
      mixDst_fit: { value: "fill" },
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

   calcAspectRatio(type: FitType, src?: TexturePipelineSrc, srcResolution?: THREE.Vector2): {
      srcAspectRatio: number;
      fitScale: THREE.Vector2;
   } {
      const baseAspectRatio = this.uniforms.aspectRatio.value;
      let srcAspectRatio = 1;
      let fitScale = new THREE.Vector2(1, 1);         
            
      // srcがない場合はbaseのアスペクト比を返す      
      if(!src) {         
         srcAspectRatio = baseAspectRatio;
      }
      // それ以外の場合は、resolutionのアスペクト比を返す
      else if(srcResolution?.x && srcResolution?.y) {         
         srcAspectRatio = srcResolution.x / srcResolution.y;         
      }      
      // srcがあり、 resolutionがないまたは、0,0の場合は、srcのサイズを返す
      else if(!srcResolution || !srcResolution.x || !srcResolution.y) {           
         srcAspectRatio = src.image.width / src.image.height;
      }      

      if(type === 'fill') {
         fitScale = new THREE.Vector2(
            1,
            1
         );
      }
      else if(type === 'cover') {
         fitScale = new THREE.Vector2(
            Math.min(baseAspectRatio / srcAspectRatio, 1),
            Math.min(srcAspectRatio / baseAspectRatio, 1)               
         );
      }
      else if(type === 'contain') {
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

   updateResolution(resolution: THREE.Vector2) {
      super.updateResolution(resolution);      

      const mixSrcAspect = this.calcAspectRatio(
         this.uniforms.mixSrc_fit?.value,
         this.uniforms.mixSrc_src?.value,
         this.uniforms.mixSrc_resolution?.value
      );
      this.uniforms.mixSrc_aspectRatio.value = mixSrcAspect.srcAspectRatio;
      this.uniforms.mixSrc_fitScale.value = mixSrcAspect.fitScale;      

      const mixDstAspect = this.calcAspectRatio(
         this.uniforms.mixDst_fit?.value,
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
