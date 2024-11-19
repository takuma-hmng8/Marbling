import { useBoxBlur, BoxBlurProps } from "./blur/useBoxBlur";
import { useGaussianBlur, GaussianBlurProps } from "./blur/useGaussianBlur";
import { useMotionBlur, MotionBlurProps } from "./blur/useMotionBlur";
import { useCoverTexture, CoverTextureProps } from "./useCoverTexture";
import { useFluid, FluidProps } from "./useFluid";
import { useNoise, NoiseProps } from "./useNoise";
import { useRawBlank, RawBlankProps } from "./useRawBlank";
import { useRGBShift, RGBShiftProps } from "./useRGBShift";

export type FxTypes =   
   | typeof useBoxBlur
   | typeof useCoverTexture
   | typeof useFluid
   | typeof useNoise
   | typeof useRawBlank
   | typeof useRGBShift
   | typeof useMotionBlur
   | typeof useGaussianBlur;

export type FxProps<T> = 
   T extends typeof useBoxBlur
   ? BoxBlurProps
   : T extends typeof useCoverTexture
   ? CoverTextureProps
   : T extends typeof useNoise
   ? NoiseProps
   : T extends typeof useFluid
   ? FluidProps
   : T extends typeof useRawBlank
   ? RGBShiftProps
   : T extends typeof useRGBShift   
   ? RawBlankProps
   : T extends typeof useMotionBlur
   ? MotionBlurProps
   : T extends typeof useGaussianBlur
   ? MotionBlurProps
   : never;

export * from "./blur/useBoxBlur";
export * from "./useCoverTexture";
export * from "./useFluid";
export * from "./useNoise";
export * from "./useRawBlank";
export * from "./useRGBShift";
export * from "./blur/useMotionBlur";
export * from "./blur/useGaussianBlur";
