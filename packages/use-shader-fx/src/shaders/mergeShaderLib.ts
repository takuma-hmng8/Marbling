import { ShaderLib } from "./ShaderLib";

/**
 * 共通でパースするShaderの共有部分を解決する
 * basicFx_fragment_begin, basicFx_fragment_endは含まない。これらは各FXでカスタマイズする必要があるため。
 */
export function mergeShaderLib(
   vertexShader: string | undefined,
   fragmentShader: string | undefined,
   type: "default" | "basicFx" | 'samplingFx'
): [string | undefined, string | undefined] {
   let vertex,
      fragment = undefined;

   const ShaderLibs = {
      default: {         
         vertexPars: ShaderLib.default_pars_vertex,
         vertexMain: ShaderLib.default_vertex,
         fragmentPars: ShaderLib.default_pars_fragment,
      },
      basicFx: {
         vertexPars: ShaderLib.basicFx_pars_vertex,
         vertexMain: ShaderLib.basicFx_vertex,
         fragmentPars: ShaderLib.basicFx_pars_fragment,
      },
      samplingFx: {
         vertexPars: ShaderLib.samplingFx_pars_vertex,
         vertexMain: ShaderLib.samplingFx_vertex,
         fragmentPars: ShaderLib.samplingFx_pars_fragment,
      }
   };

   const vertexPars = ShaderLibs[type].vertexPars;
   const vertexMain = ShaderLibs[type].vertexMain;
   const fragmentPars = ShaderLibs[type].fragmentPars;

   if (vertexShader) {
      vertex = vertexPars + `\n` + vertexShader;
      vertex = vertex.replace(
         /void\s+main\s*\(\)\s*\{/,
         `void main() {\n${vertexMain}`
      );
   }

   if (fragmentShader) {
      fragment = fragmentPars + `\n` + fragmentShader;
   }

   return [vertex, fragment];
}


/**
 * Shaderのprefixを結合する
 */
export function joinShaderPrefix(prefix: string[]):string {   
   return prefix
      .filter((string) => {
         return string !== "";
      })
      .join("\n");
}
