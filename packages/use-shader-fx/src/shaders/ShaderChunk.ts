import plane_vertex from "./ShaderChunk/plane_vertex.glsl";
import src_libs_vertex from './ShaderChunk/src_libs_vertex.glsl';
import default_vertex from "./ShaderChunk/default_vertex.glsl";
import default_pars_vertex from "./ShaderChunk/default_pars_vertex.glsl";
import default_pars_fragment from "./ShaderChunk/default_pars_fragment.glsl";
import mixSrc_pars_vertex from "./ShaderChunk/mixSrc_pars_vertex.glsl";
import mixSrc_vertex from "./ShaderChunk/mixSrc_vertex.glsl";
import mixSrc_pars_fragment from "./ShaderChunk/mixSrc_pars_fragment.glsl";
import mixSrc_fragment_begin from "./ShaderChunk/mixSrc_fragment_begin.glsl";
import mixSrc_fragment_end from "./ShaderChunk/mixSrc_fragment_end.glsl";
import mixDst_pars_vertex from "./ShaderChunk/mixDst_pars_vertex.glsl";
import mixDst_vertex from "./ShaderChunk/mixDst_vertex.glsl";
import mixDst_pars_fragment from "./ShaderChunk/mixDst_pars_fragment.glsl";
import mixDst_fragment from "./ShaderChunk/mixDst_fragment.glsl";
import texture_vertex from "./ShaderChunk/texture_vertex.glsl";
import texture_pars_vertex from "./ShaderChunk/texture_pars_vertex.glsl";
import texture_pars_fragment from "./ShaderChunk/texture_pars_fragment.glsl";
import texture_fragment_begin from './ShaderChunk/texture_fragment_begin.glsl';
import texture_fragment_end from './ShaderChunk/texture_fragment_end.glsl';

export type ShaderChunkTypes =
   | "default_pars_fragment"
   | "src_libs_vertex"
   | "default_pars_vertex"
   | "default_vertex"
   | "plane_vertex"
   | "mixSrc_fragment_begin"
   | "mixSrc_fragment_end"
   | "mixSrc_pars_fragment"
   | "mixSrc_pars_vertex"
   | "mixSrc_vertex"
   | "mixDst_fragment"
   | "mixDst_pars_fragment"
   | "mixDst_pars_vertex"
   | "mixDst_vertex"
   | "texture_pars_fragment"
   | "texture_pars_vertex"
   | "texture_vertex"
   | "texture_fragment_begin"   
   ;

export const ShaderChunk: { [K in ShaderChunkTypes]: string } = Object.freeze({
   plane_vertex,
   src_libs_vertex,
   default_vertex,   
   default_pars_vertex,
   default_pars_fragment,
   mixSrc_vertex,
   mixSrc_pars_vertex,
   mixSrc_pars_fragment,
   mixSrc_fragment_begin,
   mixSrc_fragment_end,
   mixDst_pars_vertex,
   mixDst_vertex,
   mixDst_pars_fragment,
   mixDst_fragment,
   texture_vertex,   
   texture_pars_vertex,
   texture_pars_fragment,
   texture_fragment_begin,
});
