#ifdef USF_USE_SRC_SYSTEM

	vec2 calcSrcAspectRatio(float aspectRatio1, float aspectRatio2) {
		return vec2(
			min(aspectRatio1 / aspectRatio2, 1.0),
			min(aspectRatio2 / aspectRatio1, 1.0)
		);
	}

	vec2 calcCoverUv(vec2 uv, vec2 srcAspectRatio) {
		return uv * srcAspectRatio + (1.0 - srcAspectRatio) * .5;
	}

#endif