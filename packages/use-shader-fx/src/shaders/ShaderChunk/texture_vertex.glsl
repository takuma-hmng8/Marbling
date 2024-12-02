#ifdef USF_USE_TEXTURE
	float textureSrcAspect = texture_resolution.x / texture_resolution.y;	
	vec2 textureSrcAspectAspectRatio = calcSrcAspectRatio(aspectRatio, textureSrcAspect);		
	vTextureCoverUv = calcCoverUv(vUv, textureSrcAspectAspectRatio);
#endif