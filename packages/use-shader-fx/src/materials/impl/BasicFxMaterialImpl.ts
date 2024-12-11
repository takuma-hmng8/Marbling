import * as THREE from "three";
import { FxMaterialProps } from "../core/FxMaterial";
import { ShaderLib } from "../../shaders/ShaderLib";
import { BasicFxMaterial } from "../core/BasicFxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../core/BasicFxMaterial";
import {
   NestUniformValues,
   ShaderWithUniforms,
} from "../../shaders/uniformsUtils";

type BasicFxMaterialImplUniforms = {
   src: { value: THREE.Texture };
} & BasicFxUniforms;

export type BasicFxMaterialImplValues =
   NestUniformValues<BasicFxMaterialImplUniforms> & BasicFxValues;

const DEFAULT_VERTEX = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

const DEFAULT_FRAGMENT = `
	uniform sampler2D src;
	void main() {

		vec2 usf_Uv = vUv;

		${ShaderLib.basicFx_fragment_begin}

		vec4 usf_FragColor = texture2D(src, usf_Uv);

		${ShaderLib.basicFx_fragment_end}

		gl_FragColor = usf_FragColor;

	}
`;

export const createBasicFxMaterialImpl = ({
   uniforms,
   vertexShader = DEFAULT_VERTEX,
   fragmentShader = DEFAULT_FRAGMENT,
}: ShaderWithUniforms = {}) => {
   class BasicFxMaterialImpl extends BasicFxMaterial {
      public static readonly key: string = THREE.MathUtils.generateUUID();

      static get type() {
         return "BasicFxMaterialImpl";
      }

      uniforms!: BasicFxMaterialImplUniforms;

      constructor(props: FxMaterialProps<BasicFxMaterialImplValues>) {
         super({
            vertexShader: props?.vertexShader || vertexShader,
            fragmentShader: props?.fragmentShader || fragmentShader,
            uniformValues: props?.uniformValues,
            materialParameters: props?.materialParameters,
            uniforms: THREE.UniformsUtils.merge([
               {
                  src: { value: null },
               },
               uniforms || {},
               props?.uniforms || {},
            ]),
         });

         this.type = BasicFxMaterialImpl.type;
      }
   }

   return BasicFxMaterialImpl as typeof BasicFxMaterialImpl & {
      key: string;
   };
};
