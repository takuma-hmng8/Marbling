#ifdef USF_USE_TEXTURE
	float textureSrcAspect = texture_resolution.x / texture_resolution.y;
	vec2 textureSrcAspectAspectRatio = vec2(
		min(aspectRatio / textureSrcAspect, 1.0),
		min(textureSrcAspect / aspectRatio, 1.0)
	);
	vMixSrcCoverUv = vUv * textureSrcAspectAspectRatio + (1.0 - textureSrcAspectAspectRatio) * .5;
#endif