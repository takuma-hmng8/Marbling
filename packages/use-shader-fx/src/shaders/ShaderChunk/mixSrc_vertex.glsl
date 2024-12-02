#ifdef USF_USE_MIXSRC	
	float mixSrcAspect = mixSrc_resolution.x / mixSrc_resolution.y;
	vec2 mixSrcAspectAspectRatio = calcSrcAspectRatio(aspectRatio, mixSrcAspect);		
	vMixSrcCoverUv = calcCoverUv(vUv, mixSrcAspectAspectRatio);	
#endif