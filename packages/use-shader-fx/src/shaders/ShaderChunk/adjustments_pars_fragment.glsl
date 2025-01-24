#ifdef USF_USE_LEVELS
	uniform vec4 levels_shadows;
	uniform float levels_midtones;
	uniform float levels_highlights;
	uniform float levels_outputMin;
	uniform float levels_outputMax;
#endif

#ifdef USF_USE_CONTRAST
	uniform vec4 contrast_factor;
#endif