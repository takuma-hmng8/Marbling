import * as THREE from "three";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { mergeShaderLib } from "../../shaders/mergeShaderLib";
import * as BasicFxLib from "./BasicFxLib";

export class BasicFxMaterial extends FxMaterial {
   fxFlag: BasicFxLib.FxFlag;
   uniforms!: BasicFxLib.BasicFxUniforms;
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
   }: FxMaterialProps<BasicFxLib.BasicFxValues> = {}) {
      super({
         uniformValues,
         materialParameters,
         uniforms: THREE.UniformsUtils.merge([
            BasicFxLib.BASICFX_VALUES,
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

   private setupFxShaders(vertexShader?: string, fragmentShader?: string) {
      if (!vertexShader && !fragmentShader) return;

      this.updateFxShaderPrefixes();

      const [vertex, fragment] = this.handleMergeShaderLib(
         vertexShader,
         fragmentShader
      );

      super.setupDefaultShaders(vertex, fragment);

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;

      this.compileFxShaders();
   }

   /** SamplingFxMaterialで継承するため、handlerとして独立させる */
   handleMergeShaderLib(vertexShader?: string, fragmentShader?: string) {
      return mergeShaderLib(vertexShader, fragmentShader, "basicFx");
   }

   private updateFxShaders() {
      // FxMaterialの初期化時にsetUniformValuesが呼ばれるが、isContainsBasicFxValuesがtrueを返すと、このメソッドが実行されてしまう。BasicFxMaterialの初期化前にはこの処理をスキップする。
      if (!this.fxFlag) return;

      const _cache = this.programCache;

      const { validCount, updatedFlag } = this.handleUpdateFxShaders();

      this.programCache += validCount;
      this.fxFlag = updatedFlag;

      if (_cache !== this.programCache) {
         this.updateFxShaderPrefixes();
         this.compileFxShaders();
         this.version++; // same as this.needsUpdate = true;
      }
   }

   /** SamplingFxMaterialで継承するため、handlerとして独立させる */
   handleUpdateFxShaders(): {
      validCount: number;
      updatedFlag: BasicFxLib.FxFlag;
   } {
      return BasicFxLib.handleUpdateFxShaders(this.uniforms, this.fxFlag);
   }

   private compileFxShaders() {
      this.vertexShader = this.vertexPrefixCache + this.vertexShaderCache;
      this.fragmentShader = this.fragmentPrefixCache + this.fragmentShaderCache;
   }

   private updateFxShaderPrefixes() {
      const prefix = this.handleUpdateFxShaderPrefixes();
      this.vertexPrefixCache = prefix.vertex;
      this.fragmentPrefixCache = prefix.fragment;
   }

   /** SamplingFxMaterialで継承するため、handlerとして独立させる */
   handleUpdateFxShaderPrefixes(): {
      vertex: string;
      fragment: string;
   } {
      return BasicFxLib.handleUpdateFxShaderPrefixes(this.fxFlag);
   }

   isContainsBasicFxValues(
      target?: { [key: string]: any },
      source?: { [key: string]: any }
   ): boolean {
      return BasicFxLib.hasMatchingKeys(
         target ?? null,
         source ?? BasicFxLib.BASICFX_VALUES
      );
   }

   setupDefaultFlag(
      uniformValues?: BasicFxLib.BasicFxValues
   ): BasicFxLib.FxFlag {
      return BasicFxLib.handleSetupDefaultFlag(uniformValues);
   }

   /*===============================================
	super FxMaterial
	===============================================*/
   setUniformValues(values?: { [key: string]: any }) {
      const flattenedValues = super.setUniformValues(values);
      if (this.isContainsBasicFxValues(flattenedValues)) {
         this.updateFxShaders();
         // calcAspectRatioの実行が必要な可能性があるので同時に実行する
         this.updateResolution(this.uniforms.resolution.value);
      }
      return flattenedValues;
   }

   updateResolution(resolution: THREE.Vector2) {
      super.updateResolution(resolution);

      const mixSrcAspect = BasicFxLib.calcAspectRatio({
         type: this.uniforms.mixSrc_fit.value,
         src: this.uniforms.mixSrc_src.value,
         srcResolution: this.uniforms.mixSrc_resolution.value,
         baseAspectRatio: this.uniforms.aspectRatio.value,
      });
      this.uniforms.mixSrc_aspectRatio.value = mixSrcAspect.srcAspectRatio;
      this.uniforms.mixSrc_fitScale.value = mixSrcAspect.fitScale;

      const mixDstAspect = BasicFxLib.calcAspectRatio({
         type: this.uniforms.mixSrc_fit.value,
         src: this.uniforms.mixSrc_src.value,
         srcResolution: this.uniforms.mixSrc_resolution.value,
         baseAspectRatio: this.uniforms.aspectRatio.value,
      });
      this.uniforms.mixDst_aspectRatio.value = mixDstAspect.srcAspectRatio;
      this.uniforms.mixDst_fitScale.value = mixDstAspect.fitScale;
   }

   defineUniformAccessors(onSet?: () => void) {
      super.defineUniformAccessors(() => {
         this.updateFxShaders();
         onSet?.();
      });
   }
}
