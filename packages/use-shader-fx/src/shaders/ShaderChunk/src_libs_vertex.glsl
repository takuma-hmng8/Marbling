#ifdef USF_USE_SRC_SYSTEM

	vec2 calcCoverUv(vec2 uv, vec2 srcAspectRatio) {
		return uv * srcAspectRatio + (1.0 - srcAspectRatio) * .5;
	}

#endif