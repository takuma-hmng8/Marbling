#ifdef USF_USE_MIXDST

	vec4 mixDstColor = texture2D(mixDst_src, mix(vMixDstCoverUv,usf_FragColor.rg,mixDst_uvFactor));

	usf_FragColor = mix(usf_FragColor, mixDstColor, mixDst_colorFactor);

	usf_FragColor = mix(usf_FragColor, mixDstColor, mixDstColor.a * mixDst_alphaFactor);

#endif