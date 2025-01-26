import * as THREE from "three";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import { mergeShaderLib } from "../../shaders/shaderUtils";
import * as BasicFxLib from "./BasicFxLib";

export class BasicFxMaterial extends FxMaterial {
   fxKey: BasicFxLib.FxKey;

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

      this.fxKey = this.setUpFxKey(this.uniforms);

      this.setupFxShaders(vertexShader, fragmentShader);
   }

   private setupFxShaders(vertexShader?: string, fragmentShader?: string) {
      if (!vertexShader && !fragmentShader) return;

      this.updateFxShaderPrefixes();

      const [vertex, fragment] = this.handleMergeShaderLib(
         vertexShader,
         fragmentShader
      );

      super.setupShaders(vertex, fragment);

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
      if (!this.fxKey) return;

      const _cache = this.programCache;

      const { diffCount, newFxKey } = this.handleUpdateFxShaders();

      this.programCache += diffCount;
      this.fxKey = newFxKey;

      if (_cache !== this.programCache) {
         this.updateFxShaderPrefixes();
         this.compileFxShaders();
         this.version++; // same as this.needsUpdate = true;
      }
   }

   /** SamplingFxMaterialで継承するため、handlerとして独立させる */
   handleUpdateFxShaders(): {
      diffCount: number;
      newFxKey: BasicFxLib.FxKey;
   } {
      const newFxKey = BasicFxLib.getFxKeyFromUniforms(this.uniforms);
      const diffCount = (
         Object.keys(newFxKey) as (keyof BasicFxLib.FxKey)[]
      ).filter((key) => this.fxKey[key] !== newFxKey[key]).length;
      return {
         diffCount,
         newFxKey,
      };
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
      return BasicFxLib.handleUpdateFxShaderPrefixes(this.fxKey);
   }

   isContainsBasicFxValues(
      target?: { [key: string]: any },
      source?: { [key: string]: any }
   ): boolean {
      if (!target) return false;
      return Object.keys(target).some((key) =>
         Object.keys(source ?? BasicFxLib.BASICFX_VALUES).includes(key)
      );
   }

   setUpFxKey(uniforms: BasicFxLib.BasicFxUniforms): BasicFxLib.FxKey {
      return BasicFxLib.getFxKeyFromUniforms(uniforms);
   }

   /*===============================================
	Fit Scale
	===============================================*/
   private calcFitScale(
      src: THREE.Texture,
      fitType: BasicFxLib.FitType
   ): THREE.Vector2 {
      let srcAspectRatio = 1;
      const fitScale = new THREE.Vector2(1, 1);
      const baseAspectRatio = this.uniforms.aspectRatio.value;

      const sourceData = src?.source?.data;

      if (sourceData?.width && sourceData?.height) {
         // TODO * VideoTextureも許容する
         srcAspectRatio = sourceData.width / sourceData.height;
      } else {
         srcAspectRatio = baseAspectRatio;
      }

      if (fitType === "cover") {
         fitScale.set(
            Math.min(baseAspectRatio / srcAspectRatio, 1),
            Math.min(srcAspectRatio / baseAspectRatio, 1)
         );
      } else if (fitType === "contain") {
         fitScale.set(
            Math.max(baseAspectRatio / srcAspectRatio, 1),
            Math.max(srcAspectRatio / baseAspectRatio, 1)
         );
      }

      return fitScale;
   }

   setFitScale(key: BasicFxLib.SrcSystemKey) {
      const uniforms = this.uniforms as any;
      uniforms[`${key}_fitScale`].value = this.calcFitScale(
         uniforms[`${key}_src`].value,
         uniforms[`${key}_fit`].value
      );
   }

   updateFitScale() {
      if (this.fxKey?.mixSrc) this.setFitScale("mixSrc");
      if (this.fxKey?.mixDst) this.setFitScale("mixDst");
   }

   /*===============================================
	super FxMaterial
	===============================================*/
   /**
    * @param needsUpdate default : `true`
    */
   setUniformValues(
      values?: { [key: string]: any },
      needsUpdate: boolean = true
   ) {
      const flattenedValues = super.setUniformValues(values);
      if (needsUpdate && this.isContainsBasicFxValues(flattenedValues)) {
         this.updateFxShaders();
         this.updateFitScale();
      }
      return flattenedValues;
   }

   defineUniformAccessors(onSet?: () => void) {
      super.defineUniformAccessors(() => {
         this.updateFxShaders();
         onSet?.();
      });
   }

   updateResolution(resolution: THREE.Vector2): void {
      super.updateResolution(resolution);
      this.updateFitScale();
   }
}
