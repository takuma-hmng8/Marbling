import * as THREE from "three";
import { resolveIncludes, mergeShaderLib } from "../../shaders/shaderUtils";
import {
   flattenUniformValues,
   ShaderWithUniforms,
} from "../../shaders/uniformsUtils";
import { warn } from "../../utils";

export type DefaultUniforms = {
   resolution: { value: THREE.Vector2 };
   texelSize: { value: THREE.Vector2 };
   aspectRatio: { value: number };
   maxAspect: { value: THREE.Vector2 };
   renderCount: { value: number };
};

export type FxMaterialProps<T = {}> = {
   uniformValues?: T;
   materialParameters?: THREE.ShaderMaterialParameters;
} & ShaderWithUniforms;

export class FxMaterial extends THREE.ShaderMaterial {
   public static readonly key: string = THREE.MathUtils.generateUUID();

   constructor({
      uniformValues,
      materialParameters = {},
      uniforms,
      vertexShader,
      fragmentShader,
   }: FxMaterialProps = {}) {
      super(materialParameters);

      this.uniforms = THREE.UniformsUtils.merge([
         {
            resolution: { value: new THREE.Vector2() },
            texelSize: { value: new THREE.Vector2() },
            aspectRatio: { value: 0 },
            maxAspect: { value: new THREE.Vector2() },
            // 一部のFXでiterationをカウントする必要があるため
            renderCount: { value: 0 },
         },
         uniforms || {},
      ]) as DefaultUniforms;

      this._setupShaders(vertexShader, fragmentShader);

      this.setUniformValues(uniformValues);

      this._defineUniformAccessors();
   }

   /** This is updated in useFxScene */
   public updateResolution(resolution: THREE.Vector2) {
      const { width, height } = resolution;
      const maxAspect = Math.max(width, height);
      this.uniforms.resolution.value.set(width, height);
      this.uniforms.texelSize.value.set(1 / width, 1 / height);
      this.uniforms.aspectRatio.value = width / height;
      this.uniforms.maxAspect.value.set(maxAspect / width, maxAspect / height);
   }

   protected _setupShaders(vertexShader?: string, fragmentShader?: string) {
      if (!vertexShader && !fragmentShader) return;

      const [vertex, fragment] = mergeShaderLib(
         vertexShader,
         fragmentShader,
         "default"
      );
      this.vertexShader = vertex ? resolveIncludes(vertex) : this.vertexShader;
      this.fragmentShader = fragment
         ? resolveIncludes(fragment)
         : this.fragmentShader;
   }

   public setUniformValues(values?: { [key: string]: any }) {
      if (values === undefined) return;
      const flattenedValues = flattenUniformValues(values);

      for (const [key, value] of Object.entries(flattenedValues)) {
         if (value === undefined) {
            warn(`parameter '${key}' has value of undefined.`);
            continue;
         }

         const curretUniform = this.uniforms[key];

         if (curretUniform === undefined) {
            warn(`'${key}' is not a uniform property of ${this.type}.`);
            continue;
         }

         curretUniform.value = value;
      }

      return flattenedValues;
   }

   /** define getter/setters　*/
   protected _defineUniformAccessors(onSet?: () => void) {
      for (const key of Object.keys(this.uniforms)) {
         if (this.hasOwnProperty(key)) {
            warn(`'${key}' is already defined in ${this.type}.`);
            continue;
         }
         Object.defineProperty(this, key, {
            get: () => this.uniforms[key].value,
            set: (v) => {
               this.uniforms[key].value = v;
               onSet?.();
            },
         });
      }
   }
}
