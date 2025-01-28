#ifdef USF_USE_MIXDST

	// mix uv
	vec2 mixedUv = vMixDstCoverUv;
	
	if(mixDst_uv){

		float circlePower = calcMixCirclePower(mixDst_uv_position,mixDst_uv_radius) * mixDst_uv_factor;
		mixedUv += (mixDst_uv_offset + (usf_FragColor.rg * 2.0 - 1.0)) * circlePower;

	}

	vec4 mixDstColor = texture2D(mixDst_src, mixedUv);

	// color
	if(mixDst_color){

		float circlePower = calcMixCirclePower(mixDst_color_position,mixDst_color_radius) * mixDst_color_factor;
		usf_FragColor = mix(usf_FragColor, mixDstColor, circlePower);

	}

	// alpha
	if(mixDst_alpha){

		float circlePower = calcMixCirclePower(mixDst_alpha_position,mixDst_alpha_radius) * mixDst_alpha_factor;
		usf_FragColor = mix(usf_FragColor, mixDstColor, mixDstColor.a * circlePower);

	}
	
#endif





