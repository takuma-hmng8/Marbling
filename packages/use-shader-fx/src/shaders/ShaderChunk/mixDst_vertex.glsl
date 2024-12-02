#ifdef USF_USE_MIXDST
	float mixDstAspect = mixDst_resolution.x / mixDst_resolution.y;
	vec2 mixDstAspectAspectRatio = calcSrcAspectRatio(aspectRatio, mixDstAspect);
	vMixDstCoverUv = calcCoverUv(vUv, mixDstAspectAspectRatio);	
#endif