import * as THREE from "three";
import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import {
   BasicFxUniforms,
   BasicFxValues,
   BasicFxFlag,
   BasicFxLib,
} from "./BasicFxLib";
import { mergeShaderLib } from "../../shaders/mergeShaderLib";

export class BasicFxMaterial extends FxMaterial {
   public static readonly key: string = THREE.MathUtils.generateUUID();

   basicFxFlag: BasicFxFlag;

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
            BasicFxLib.DEFAULT_BASICFX_VALUES,
            uniforms || {},
         ]),
      });

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;
      this.vertexPrefixCache = "";
      this.fragmentPrefixCache = "";
      this.programCache = 0;

      this.basicFxFlag = BasicFxLib.setupDefaultFlag(uniformValues);

      this.setupBasicFxShaders(vertexShader, fragmentShader);
   }

   updateBasicFx() {
      // shaderのsetup前は実行しない
      if (!this.basicFxFlag) return;

      const _cache = this.programCache;

      const { validCount, updatedFlag } = BasicFxLib.handleUpdateBasicFx(
         this.uniforms,
         this.basicFxFlag
      );

      this.programCache += validCount;
      this.basicFxFlag = updatedFlag;

      if (_cache !== this.programCache) {
         this.updateBasicFxPrefix();
         this.updateBasicFxShader();
         this.version++; // same as this.needsUpdate = true;
      }
   }

   updateBasicFxPrefix() {
      const { prefixVertex, prefixFragment } =
         BasicFxLib.handleUpdateBasicFxPrefix(this.basicFxFlag);
      
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
      if (BasicFxLib.containsBasicFxValues(values)) {
         this.updateBasicFx();
      }
   }
   defineUniformAccessors(onSet?: () => void) {
      super.defineUniformAccessors(() => {
         this.updateBasicFx();
         onSet?.();
      });
   }
}
