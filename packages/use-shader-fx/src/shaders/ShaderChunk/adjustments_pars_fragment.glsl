#ifdef USF_USE_LEVELS
	uniform vec4 levels_shadows;
	uniform vec4 levels_midtones;
	uniform vec4 levels_highlights;
	uniform vec4 levels_outputMin;
	uniform vec4 levels_outputMax;
#endif

#ifdef USF_USE_CONTRAST
	uniform vec4 contrast_factor;
#endif

#ifdef USF_USE_COLORBALANCE
	uniform vec3 colorBalance_factor;
#endif
