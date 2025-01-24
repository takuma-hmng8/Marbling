#ifdef USF_USE_LEVELS

	usf_FragColor = (usf_FragColor - vec4(levels_shadows)) / (vec4(levels_highlights) - vec4(levels_shadows));

	usf_FragColor = pow(usf_FragColor, vec4(1.0 / levels_midtones));

	usf_FragColor = usf_FragColor * (vec4(levels_outputMax) - vec4(levels_outputMin)) + vec4(levels_outputMin);

#endif

#ifdef USF_USE_CONTRAST

	usf_FragColor = clamp(((usf_FragColor-.5)*contrast_factor)+.5, 0., 1.);

#endif