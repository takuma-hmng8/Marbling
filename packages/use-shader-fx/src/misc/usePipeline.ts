import * as THREE from "three";
import { useCallback, useState } from "react";
import { RootState } from "../hooks/types";
import { FxTypes, FxProps } from "../hooks";
import { warn } from "../utils";

export type FxConfig<T extends FxTypes = FxTypes> = {
   fx: T;
} & FxProps<T>;

export type TexturePipelineSrc = THREE.Texture | null;

export type PipelineConfig = {
   src?: number | TexturePipelineSrc;
   mixSrc?: number | TexturePipelineSrc;
   mixDst?: number | TexturePipelineSrc;
};
export type PipelineValues = {
   src?: TexturePipelineSrc;
   mixSrc?: {
      src?: TexturePipelineSrc;
   };
   mixDst?: {
      src?: TexturePipelineSrc;
   };
};

const WARN_TEXT = {
   args: `fx and args length mismatch. fx is non-reactive; update by changing the key to reset state.`,
   pipeline: `fx and pipeline length mismatch. fx is non-reactive; update by changing the key to reset state.`,
   pipelineValue: (val: number, pipelineIndex: number, key: string) =>
      `texture(index:${val}) is missing, at "${key}" of pipeline(index:${pipelineIndex}).`,
};

export const usePipeline = <T extends FxTypes[]>(
   ...args: { [K in keyof T]: FxConfig<T[K]> }
) => {
   // hooks are non-reactive
   const [hooks] = useState(() => args.map(({ fx }) => fx));

   // to update the resolution, make the args reactive.
   let _args = args.map(({ fx, ...rest }) => rest);

   const argsDiff = hooks.length - _args.length;

   if (argsDiff !== 0) {
      warn(WARN_TEXT.args);
      // adjust length of args
      if (argsDiff < 0) {
         _args = _args.slice(0, hooks.length);
      } else {
         _args = _args.concat(Array(argsDiff).fill(_args.at(-1)));
      }
   }

   const pipeline = hooks.map((hook, i) => hook(_args[i]));

   const render = useCallback(
      (state: RootState) => pipeline.forEach((fx) => fx.render(state)),
      [pipeline]
   );

   const setValues = useCallback(
      (...values: {}[]) => pipeline.forEach((fx, i) => fx.setValues(values[i])),
      [pipeline]
   );

   const textures = pipeline.map((fx) => fx.texture);

   const setPipeline = useCallback(
      (...args: PipelineConfig[]) => {
         if (args.length !== pipeline.length) {
            warn(WARN_TEXT.pipeline);
            return;
         }
         args.forEach((arg, i) =>
            pipeline[i].setValues(getPipelineValues(arg, textures, i))
         );
      },
      [pipeline, textures]
   );

   return {
      render,
      setValues,
      setPipeline,
      texture: pipeline.at(-1)?.texture,
      textures,
      pipeline,
   };
};

function getPipelineValues(
   config: PipelineConfig,
   textures: THREE.Texture[],
   pipelineIndex: number
) {
   const value: PipelineValues = {};

   const setValue = (key: keyof PipelineConfig, val: TexturePipelineSrc) => {
      if (key === "src") {
         value[key] = val;
         return;
      }
      value[key] = { src: val };
   };

   for (const [key, val] of Object.entries(config)) {
      const _key = key as keyof PipelineConfig;

      if (val == null) {
         setValue(_key, null);
         continue;
      }

      if (typeof val === "number") {
         const _tex = textures[val];
         if (!_tex) {
            warn(WARN_TEXT.pipelineValue(val, pipelineIndex, key));
            setValue(_key, null);
            continue;
         }
         setValue(_key, _tex);
         continue;
      }

      setValue(_key, val);
   }

   return value;
}
