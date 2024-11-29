import basicFx_vertex from "./ShaderLib/basicFx_vertex.glsl";
import basicFx_fragment_begin from "./ShaderLib/basicFx_fragment_begin.glsl";
import basicFx_fragment_end from "./ShaderLib/basicFx_fragment_end.glsl";
import basicFx_pars_fragment from "./ShaderLib/basicFx_pars_fragment.glsl";
import basicFx_pars_vertex from "./ShaderLib/basicFx_pars_vertex.glsl";
import default_pars_fragment from "./ShaderLib/default_pars_fragment.glsl";
import default_pars_vertex from "./ShaderLib/default_pars_vertex.glsl";
import default_vertex from "./ShaderLib/default_vertex.glsl";

import samplingFx_pars_fragment from "./ShaderLib/samplingFx_pars_fragment.glsl"
import samplingFx_pars_vertex from "./ShaderLib/samplingFx_pars_vertex.glsl"
import samplingFx_vertex from "./ShaderLib/samplingFx_vertex.glsl"

import plane_vertex from "./ShaderLib/plane_vertex.glsl";

export type ShaderLibTypes =
   | "basicFx_vertex"
   | "basicFx_fragment_begin"
   | "basicFx_fragment_end"
   | "basicFx_pars_fragment"
   | "basicFx_pars_vertex"
   | "default_pars_fragment"
   | "default_pars_vertex"
   | "default_vertex"
   | "samplingFx_pars_fragment"
   | "samplingFx_pars_vertex"
   | "samplingFx_vertex"
   | "plane_vertex";

export const ShaderLib: { [K in ShaderLibTypes]: string } = Object.freeze({
   basicFx_vertex,
   basicFx_fragment_begin,
   basicFx_fragment_end,
   basicFx_pars_fragment,
   basicFx_pars_vertex,
   default_pars_fragment,
   default_pars_vertex,
   default_vertex,
   plane_vertex,
   samplingFx_pars_fragment,   
   samplingFx_pars_vertex,
   samplingFx_vertex
});
