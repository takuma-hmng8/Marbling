#ifdef USF_USE_MIXDST

	// uv
	vec2 mixedUv = vMixDstCoverUv;
	mixedUv += mixDst_uv 
		? (mixDst_uv_offset + (usf_FragColor.rg * 2. - 1.)) * calcMixCirclePower(mixDst_uv_position,mixDst_uv_radius) * mixDst_uv_factor
		: vec2(0.);
	vec4 mixDstColor = texture2D(mixDst_src, mixedUv);

	// color
	usf_FragColor = mixDst_color 
		? mix(usf_FragColor, mixDstColor, calcMixCirclePower(mixDst_color_position,mixDst_color_radius) * mixDst_color_factor) 
		: usf_FragColor;

	// alpha
	usf_FragColor = mixDst_alpha 
		? mix(usf_FragColor, mixDstColor, mixDstColor.a * calcMixCirclePower(mixDst_alpha_position,mixDst_alpha_radius) * mixDst_alpha_factor)
		: usf_FragColor;
	
#endif

