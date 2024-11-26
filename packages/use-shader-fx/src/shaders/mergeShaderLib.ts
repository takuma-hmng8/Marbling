import { ShaderLib } from "./ShaderLib";

/**
 * 共通でパースするShaderの共有部分を解決する
 * basicFx_fragment_begin, basicFx_fragment_endは含まない。これらは各FXでカスタマイズする必要があるため。
 */
export function mergeShaderLib(
   vertexShader: string | undefined,
   fragmentShader: string | undefined,
   type: "default" | "basicFx"
): [string | undefined, string | undefined] {
   let vertex,
      fragment = undefined;

   const isDefault = type === "default";

   const vertexPars = isDefault
      ? ShaderLib.default_pars_vertex
      : ShaderLib.basicFx_pars_vertex;
   const vertexMain = isDefault
      ? ShaderLib.default_vertex
      : ShaderLib.basicFx_vertex;
   const fragmentPars = isDefault
      ? ShaderLib.default_pars_fragment
      : ShaderLib.basicFx_pars_fragment;

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
         string !== "";
      })
      .join("\n");
}
