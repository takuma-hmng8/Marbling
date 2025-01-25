#ifdef USF_USE_SRC_SYSTEM

	// TODO rename to calcSrcUV
	vec2 calcCoverUv(vec2 uv, vec2 fitScale) {
		return uv * fitScale + (1.0 - fitScale) * .5;
	}

#endif