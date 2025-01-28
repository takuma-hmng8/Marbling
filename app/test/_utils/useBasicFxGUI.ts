import GUI from "lil-gui";
import { useGUI } from "@/utils/useGUI";
import {
   BASICFX_VALUES,
   BasicFxUniformsUnique,
   BasicFxValues,
   FitType,
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";
import { useCallback } from "react";

const BASICFX_CONFIG: BasicFxUniformsUnique = BASICFX_VALUES;
const FIT_TYPE: FitType[] = ["fill", "cover", "contain"];

export const useBasicFxGUI = (setValues: (v: BasicFxValues) => void) => {
   const [funkun] = useTexture(["/funkun.jpg"]);
   const setupGUI = useCallback(
      (gui: GUI) => {
         /*===============================================
			mixDst
			===============================================*/
         const mixDst = gui.addFolder("mixDst");
         mixDst
            .add(BASICFX_CONFIG.mixDst, "value")
            .name("enabled")
            .onChange((v: boolean) =>
               setValues({ mixDst: v ? { src: funkun } : v })
            );
         mixDst
            .add(BASICFX_CONFIG.mixDst_fit, "value", FIT_TYPE)
            .name("fit")
            .onChange((v: FitType) => setValues({ mixDst: { fit: v } }));

         // uv
         const mixDstUV = mixDst.addFolder("uv");
         mixDstUV.add(BASICFX_CONFIG.mixDst_uv, "value").name("enabled");
         mixDstUV
            .add(BASICFX_CONFIG.mixDst_uv_factor, "value", 0, 1, 0.01)
            .name("factor");
         const mixDstUVOffset = mixDstUV.addFolder("offset");
         mixDstUVOffset
            .add(BASICFX_CONFIG.mixDst_uv_offset.value, "x", -1, 1, 0.01)
            .name("x");
         mixDstUVOffset
            .add(BASICFX_CONFIG.mixDst_uv_offset.value, "y", -1, 1, 0.01)
            .name("y");
         mixDstUV
            .add(BASICFX_CONFIG.mixDst_uv_radius, "value", 0, 1, 0.01)
            .name("radius");
         const mixDstUVPosition = mixDstUV.addFolder("position");
         mixDstUVPosition
            .add(BASICFX_CONFIG.mixDst_uv_position.value, "x", -1, 1, 0.01)
            .name("x");
         mixDstUVPosition
            .add(BASICFX_CONFIG.mixDst_uv_position.value, "y", -1, 1, 0.01)
            .name("y");

         // color
         const mixDstColor = mixDst.addFolder("color");
         mixDstColor.add(BASICFX_CONFIG.mixDst_color, "value").name("enabled");
         mixDstColor
            .add(BASICFX_CONFIG.mixDst_color_factor, "value", 0, 1, 0.01)
            .name("factor");
         mixDstColor
            .add(BASICFX_CONFIG.mixDst_color_radius, "value", 0, 1, 0.01)
            .name("radius");
         const mixDstColorPosition = mixDstColor.addFolder("position");
         mixDstColorPosition
            .add(BASICFX_CONFIG.mixDst_color_position.value, "x", -1, 1, 0.01)
            .name("x");
         mixDstColorPosition
            .add(BASICFX_CONFIG.mixDst_color_position.value, "y", -1, 1, 0.01)
            .name("y");

         // alpha
         const mixDstAlpha = mixDst.addFolder("alpha");
         mixDstAlpha.add(BASICFX_CONFIG.mixDst_alpha, "value").name("enabled");
         mixDstAlpha
            .add(BASICFX_CONFIG.mixDst_alpha_factor, "value", 0, 1, 0.01)
            .name("factor");
         mixDstAlpha
            .add(BASICFX_CONFIG.mixDst_alpha_radius, "value", 0, 1, 0.01)
            .name("radius");
         const mixDstAlphaPosition = mixDstAlpha.addFolder("position");
         mixDstAlphaPosition
            .add(BASICFX_CONFIG.mixDst_alpha_position.value, "x", -1, 1, 0.01)
            .name("x");
         mixDstAlphaPosition
            .add(BASICFX_CONFIG.mixDst_alpha_position.value, "y", -1, 1, 0.01)
            .name("y");

         /*===============================================
			levels
			===============================================*/
         const levels = gui.addFolder("levels");
         levels
            .add(BASICFX_CONFIG.levels, "value")
            .name("enabled")
            .onChange((v: boolean) => setValues({ levels: v }));
         const shadows = levels.addFolder("shadows");
         shadows
            .add(BASICFX_CONFIG.levels_shadows.value, "x", -1, 1, 0.01)
            .name("shadows r");
         shadows
            .add(BASICFX_CONFIG.levels_shadows.value, "y", -1, 1, 0.01)
            .name("shadows g");
         shadows
            .add(BASICFX_CONFIG.levels_shadows.value, "z", -1, 1, 0.01)
            .name("shadows b");
         shadows
            .add(BASICFX_CONFIG.levels_shadows.value, "w", -1, 1, 0.01)
            .name("shadows a");
         const midtones = levels.addFolder("midtones");
         midtones
            .add(BASICFX_CONFIG.levels_midtones.value, "x", -2, 2, 0.01)
            .name("midtones r");
         midtones
            .add(BASICFX_CONFIG.levels_midtones.value, "y", -2, 2, 0.01)
            .name("midtones g");
         midtones
            .add(BASICFX_CONFIG.levels_midtones.value, "z", -2, 2, 0.01)
            .name("midtones b");
         midtones
            .add(BASICFX_CONFIG.levels_midtones.value, "w", -2, 2, 0.01)
            .name("midtones a");
         const highlights = levels.addFolder("highlights");
         highlights
            .add(BASICFX_CONFIG.levels_highlights.value, "x", -2, 2, 0.01)
            .name("highlights r");
         highlights
            .add(BASICFX_CONFIG.levels_highlights.value, "y", -2, 2, 0.01)
            .name("highlights g");
         highlights
            .add(BASICFX_CONFIG.levels_highlights.value, "z", -2, 2, 0.01)
            .name("highlights b");
         highlights
            .add(BASICFX_CONFIG.levels_highlights.value, "w", -2, 2, 0.01)
            .name("highlights a");
         const outputMin = levels.addFolder("outputMin");
         outputMin
            .add(BASICFX_CONFIG.levels_outputMin.value, "x", 0, 1, 0.01)
            .name("outputMin r");
         outputMin
            .add(BASICFX_CONFIG.levels_outputMin.value, "y", 0, 1, 0.01)
            .name("outputMin g");
         outputMin
            .add(BASICFX_CONFIG.levels_outputMin.value, "z", 0, 1, 0.01)
            .name("outputMin b");
         outputMin
            .add(BASICFX_CONFIG.levels_outputMin.value, "w", 0, 1, 0.01)
            .name("outputMin a");
         const outputMax = levels.addFolder("outputMax");
         outputMax
            .add(BASICFX_CONFIG.levels_outputMax.value, "x", 0, 1, 0.01)
            .name("outputMax r");
         outputMax
            .add(BASICFX_CONFIG.levels_outputMax.value, "y", 0, 1, 0.01)
            .name("outputMax g");
         outputMax
            .add(BASICFX_CONFIG.levels_outputMax.value, "z", 0, 1, 0.01)
            .name("outputMax b");
         outputMax
            .add(BASICFX_CONFIG.levels_outputMax.value, "w", 0, 1, 0.01)
            .name("outputMax a");

         /*===============================================
			contrast
			===============================================*/
         const contrast = gui.addFolder("contrast");
         contrast
            .add(BASICFX_CONFIG.contrast, "value")
            .name("enabled")
            .onChange((v: boolean) => setValues({ contrast: v }));
         contrast
            .add(BASICFX_CONFIG.contrast_factor.value, "x", 0, 2, 0.01)
            .name("r");
         contrast
            .add(BASICFX_CONFIG.contrast_factor.value, "y", 0, 2, 0.01)
            .name("g");
         contrast
            .add(BASICFX_CONFIG.contrast_factor.value, "z", 0, 2, 0.01)
            .name("b");

         /*===============================================
			color balance
			===============================================*/
         const colorBalance = gui.addFolder("colorBalance");
         colorBalance
            .add(BASICFX_CONFIG.colorBalance, "value")
            .name("enabled")
            .onChange((v: boolean) => setValues({ colorBalance: v }));
         colorBalance
            .add(BASICFX_CONFIG.colorBalance_factor.value, "x", 0, 2, 0.01)
            .name("r");
         colorBalance
            .add(BASICFX_CONFIG.colorBalance_factor.value, "y", 0, 2, 0.01)
            .name("g");
         colorBalance
            .add(BASICFX_CONFIG.colorBalance_factor.value, "z", 0, 2, 0.01)
            .name("b");

         /*===============================================
			hsv
			===============================================*/
         const hsv = gui.addFolder("hsv");
         hsv.add(BASICFX_CONFIG.hsv, "value")
            .name("enabled")
            .onChange((v: boolean) => setValues({ hsv: v }));
         hsv.add(BASICFX_CONFIG.hsv_hueShift, "value", 0, 1, 0.01).name("hue");
         hsv.add(BASICFX_CONFIG.hsv_saturation, "value", 0, 5, 0.01).name(
            "saturation"
         );
         hsv.add(BASICFX_CONFIG.hsv_brightness, "value", 0, 5, 0.01).name(
            "brightness"
         );

         /*===============================================
			posterize
			===============================================*/
         const posterize = gui.addFolder("posterize");
         posterize
            .add(BASICFX_CONFIG.posterize, "value")
            .name("enabled")
            .onChange((v: boolean) => setValues({ posterize: v }));
         posterize
            .add(BASICFX_CONFIG.posterize_levels.value, "x", 0, 10, 1)
            .name("r");
         posterize
            .add(BASICFX_CONFIG.posterize_levels.value, "y", 0, 10, 1)
            .name("g");
         posterize
            .add(BASICFX_CONFIG.posterize_levels.value, "z", 0, 10, 1)
            .name("b");

         /*===============================================
			grayscale
			===============================================*/
         const grayscale = gui.addFolder("grayscale");
         grayscale
            .add(BASICFX_CONFIG.grayscale, "value")
            .name("enabled")
            .onChange((v: boolean) => setValues({ grayscale: v }));
         const weight = grayscale.addFolder("weight");
         weight
            .add(BASICFX_CONFIG.grayscale_weight.value, "x", 0, 5, 0.01)
            .name("r");
         weight
            .add(BASICFX_CONFIG.grayscale_weight.value, "y", 0, 5, 0.01)
            .name("g");
         weight
            .add(BASICFX_CONFIG.grayscale_weight.value, "z", 0, 5, 0.01)
            .name("b");
         const duotone = grayscale.addFolder("duotone");
         duotone.add(BASICFX_CONFIG.grayscale_duotone, "value").name("enabled");
         duotone
            .addColor(BASICFX_CONFIG.grayscale_duotone_color0, "value")
            .name("color0");
         duotone
            .addColor(BASICFX_CONFIG.grayscale_duotone_color1, "value")
            .name("color1");
         grayscale
            .add(BASICFX_CONFIG.grayscale_threshold, "value", -0.01, 1, 0.01)
            .name("threshold");
      },
      [setValues, funkun]
   );

   const updateBasicFxGUI = useGUI(setupGUI, "BasicFx");

   return {
      updateBasicFxGUI,
      setBasicFxGUIValues: (): BasicFxValues => {
         return {
            ...{
               ...(BASICFX_CONFIG.mixDst.value && {
                  mixDst: {
                     uv: BASICFX_CONFIG.mixDst_uv.value && {
                        factor: BASICFX_CONFIG.mixDst_uv_factor.value,
                        offset: BASICFX_CONFIG.mixDst_uv_offset.value,
                        radius: BASICFX_CONFIG.mixDst_uv_radius.value,
                        position: BASICFX_CONFIG.mixDst_uv_position.value,
                     },
                     color: BASICFX_CONFIG.mixDst_color.value && {
                        factor: BASICFX_CONFIG.mixDst_color_factor.value,
                        radius: BASICFX_CONFIG.mixDst_color_radius.value,
                        position: BASICFX_CONFIG.mixDst_color_position.value,
                     },
                     alpha: BASICFX_CONFIG.mixDst_alpha.value && {
                        factor: BASICFX_CONFIG.mixDst_alpha_factor.value,
                        radius: BASICFX_CONFIG.mixDst_alpha_radius.value,
                        position: BASICFX_CONFIG.mixDst_alpha_position.value,
                     },
                  },
               }),
            },
            ...{
               ...(BASICFX_CONFIG.levels.value && {
                  levels: {
                     shadows: BASICFX_CONFIG.levels_shadows.value,
                     midtones: BASICFX_CONFIG.levels_midtones.value,
                     highlights: BASICFX_CONFIG.levels_highlights.value,
                     outputMin: BASICFX_CONFIG.levels_outputMin.value,
                     outputMax: BASICFX_CONFIG.levels_outputMax.value,
                  },
               }),
            },
            ...{
               ...(BASICFX_CONFIG.contrast.value && {
                  contrast: {
                     factor: BASICFX_CONFIG.contrast_factor.value,
                  },
               }),
            },
            ...{
               ...(BASICFX_CONFIG.colorBalance.value && {
                  colorBalance: {
                     factor: BASICFX_CONFIG.colorBalance_factor.value,
                  },
               }),
            },
            ...{
               ...(BASICFX_CONFIG.hsv.value && {
                  hsv: {
                     hueShift: BASICFX_CONFIG.hsv_hueShift.value,
                     saturation: BASICFX_CONFIG.hsv_saturation.value,
                     brightness: BASICFX_CONFIG.hsv_brightness.value,
                  },
               }),
            },
            ...{
               ...(BASICFX_CONFIG.posterize.value && {
                  posterize: {
                     levels: BASICFX_CONFIG.posterize_levels.value,
                  },
               }),
            },
            ...{
               ...(BASICFX_CONFIG.grayscale.value && {
                  grayscale: {
                     weight: BASICFX_CONFIG.grayscale_weight.value,
                     duotone: BASICFX_CONFIG.grayscale_duotone.value && {
                        color0: BASICFX_CONFIG.grayscale_duotone_color0.value,
                        color1: BASICFX_CONFIG.grayscale_duotone_color1.value,
                     },
                     threshold: BASICFX_CONFIG.grayscale_threshold.value,
                  },
               }),
            },
         };
      },
   };
};
