import { useNoise, NoiseProps } from "./useNoise";

export type FxTypes = typeof useNoise;

export type FxProps<T> = T extends typeof useNoise ? NoiseProps : never;

export * from "./useNoise";
export * from "./useRGBShift";
export * from "./useFluid";
