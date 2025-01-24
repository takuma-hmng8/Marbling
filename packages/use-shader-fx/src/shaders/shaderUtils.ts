import { ShaderLib } from "./ShaderLib";
import { ShaderChunk, ShaderChunkTypes } from "./ShaderChunk";

/** merge shader codes */
export function mergeShaderCode(prefix: string[]): string {
   return prefix.filter((string) => string !== "").join("\n");
}

export type ShaderLibType = "default" | "basicFx" | "samplingFx";
/**
 * merge ShaderLib to shader
 * basicFx_fragment_begin, basicFx_fragment_endは含まない。これらは各FXでカスタマイズする必要があるため。
 */
export function mergeShaderLib(
   vertexShader: string | undefined,
   fragmentShader: string | undefined,
   type: ShaderLibType
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
         vertexPars: mergeShaderCode([
            ShaderLib.basicFx_pars_vertex,
            ShaderLib.samplingFx_pars_vertex,
         ]),
         vertexMain: mergeShaderCode([
            ShaderLib.basicFx_vertex,
            ShaderLib.samplingFx_vertex,
         ]),
         fragmentPars: mergeShaderCode([
            ShaderLib.basicFx_pars_fragment,
            ShaderLib.samplingFx_pars_fragment,
         ]),
      },
   };

   const vertexPars = ShaderLibs[type].vertexPars;
   const vertexMain = ShaderLibs[type].vertexMain;
   const fragmentPars = ShaderLibs[type].fragmentPars;

   if (vertexShader) {
      vertex = mergeShaderCode([vertexPars, vertexShader]);
      vertex = vertex.replace(
         /void\s+main\s*\(\)\s*\{/,
         `void main() {\n${vertexMain}`
      );
   }

   if (fragmentShader) {
      fragment = mergeShaderCode([fragmentPars, fragmentShader]);
   }

   return [vertex, fragment];
}

const includePattern = /^[ \t]*#usf +<([\w\d./]+)>/gm;
function includeReplacer(match: string, include: ShaderChunkTypes): string {
   return resolveIncludes(ShaderChunk[include] || "");
}
/** Resolve Includes */
export function resolveIncludes(string: string): string {
   return string.replace(includePattern, includeReplacer);
}
