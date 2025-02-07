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

      this.fxKey = this._setupFxKey(this.uniforms);

      this._setupFxShaders(vertexShader, fragmentShader);
   }

   private _setupFxShaders(vertexShader?: string, fragmentShader?: string) {
      if (!vertexShader && !fragmentShader) return;

      this._updateFxShaderPrefixes();

      const [vertex, fragment] = this._handleMergeShaderLib(
         vertexShader,
         fragmentShader
      );

      super._setupShaders(vertex, fragment);

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;

      this._compileFxShaders();
   }

   /** SamplingFxMaterialで継承するため、handlerとして独立させる */
   _handleMergeShaderLib(vertexShader?: string, fragmentShader?: string) {
      return mergeShaderLib(vertexShader, fragmentShader, "basicFx");
   }

   private _updateFxShaders() {
      // FxMaterialの初期化時にsetUniformValuesが呼ばれるが、isContainsBasicFxValuesがtrueを返すと、このメソッドが実行されてしまう。BasicFxMaterialの初期化前にはこの処理をスキップする。
      if (!this.fxKey) return;

      const _cache = this.programCache;

      const { diffCount, newFxKey } = this._handleUpdateFxShaders();

      this.programCache += diffCount;
      this.fxKey = newFxKey;

      if (_cache !== this.programCache) {
         this._updateFxShaderPrefixes();
         this._compileFxShaders();
         this.version++; // same as this.needsUpdate = true;
      }
   }

   /** SamplingFxMaterialで継承するため、handlerとして独立させる */
   protected _handleUpdateFxShaders(): {
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

   private _compileFxShaders() {
      this.vertexShader = this.vertexPrefixCache + this.vertexShaderCache;
      this.fragmentShader = this.fragmentPrefixCache + this.fragmentShaderCache;
   }

   private _updateFxShaderPrefixes() {
      const prefix = this._handleUpdateFxShaderPrefixes();
      this.vertexPrefixCache = prefix.vertex;
      this.fragmentPrefixCache = prefix.fragment;
   }

   /** SamplingFxMaterialで継承するため、handlerとして独立させる */
   protected _handleUpdateFxShaderPrefixes(): {
      vertex: string;
      fragment: string;
   } {
      return BasicFxLib.handleUpdateFxShaderPrefixes(this.fxKey);
   }

   protected _isContainsBasicFxValues(
      target?: { [key: string]: any },
      source?: { [key: string]: any }
   ): boolean {
      if (!target) return false;
      return Object.keys(target).some((key) =>
         Object.keys(source ?? BasicFxLib.BASICFX_VALUES).includes(key)
      );
   }

   protected _setupFxKey(
      uniforms: BasicFxLib.BasicFxUniforms
   ): BasicFxLib.FxKey {
      return BasicFxLib.getFxKeyFromUniforms(uniforms);
   }

   /*===============================================
	Fit Scale
	===============================================*/
   private _calcFitScale(
      src: THREE.Texture,
      fitType: BasicFxLib.FitType
   ): THREE.Vector2 {
      let srcAspectRatio = 1;
      const fitScale = new THREE.Vector2(1, 1);
      const baseAspectRatio = this.uniforms.aspectRatio.value;

      const sourceData = src?.source?.data;

      if (sourceData?.width && sourceData?.height) {
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

   protected _setFitScale(key: BasicFxLib.SrcSystemKey) {
      const uniforms = this.uniforms as any;
      uniforms[`${key}_fitScale`].value = this._calcFitScale(
         uniforms[`${key}_src`].value,
         uniforms[`${key}_fit`].value
      );
   }

   protected _updateFitScale() {
      if (this.fxKey?.mixSrc) this._setFitScale("mixSrc");
      if (this.fxKey?.mixDst) this._setFitScale("mixDst");
   }

   /*===============================================
	super FxMaterial
	===============================================*/
   /**
    * @param needsUpdate default : `true`
    */
   public setUniformValues(
      values?: { [key: string]: any },
      needsUpdate: boolean = true
   ) {
      const flattenedValues = super.setUniformValues(values);
      if (needsUpdate && this._isContainsBasicFxValues(flattenedValues)) {
         this._updateFxShaders();
         this._updateFitScale();
      }
      return flattenedValues;
   }

   protected _defineUniformAccessors(onSet?: () => void) {
      super._defineUniformAccessors(() => {
         this._updateFxShaders();
         onSet?.();
      });
   }

   public updateResolution(resolution: THREE.Vector2): void {
      super.updateResolution(resolution);
      this._updateFitScale();
   }
}
