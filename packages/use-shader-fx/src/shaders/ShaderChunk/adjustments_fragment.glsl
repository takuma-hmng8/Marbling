#ifdef USF_USE_LEVELS
	usf_FragColor = (usf_FragColor - vec4(levels_shadows)) / (vec4(levels_highlights) - vec4(levels_shadows));
	usf_FragColor = pow(usf_FragColor, vec4(1.0 / levels_midtones));
	usf_FragColor = usf_FragColor * (vec4(levels_outputMax) - vec4(levels_outputMin)) + vec4(levels_outputMin);
#endif

#ifdef USF_USE_CONTRAST
	usf_FragColor = clamp(((usf_FragColor-.5)*contrast_factor)+.5, 0., 1.);
#endif

#ifdef USF_USE_COLORBALANCE
	usf_FragColor.rgb = clamp(usf_FragColor.rgb * colorBalance_factor, 0., 1.);
#endif

#ifdef USF_USE_HSV
	vec3 hsv = rgb2hsv(usf_FragColor.rgb);
	hsv.x = fract(hsv.x + hsv_hueShift);
	hsv.y = clamp(hsv.y * hsv_saturation, 0.0, 1.0);
	hsv.z = clamp(hsv.z * hsv_brightness, 0.0, 1.0);
	usf_FragColor.rgb = hsv2rgb(hsv);
#endif

#ifdef USF_USE_POSTERIZE
	usf_FragColor = posterize(usf_FragColor, posterize_levels);
#endif

#ifdef USF_USE_GRAYSCALE
	float grayscale = dot(usf_FragColor.rgb, vec3(0.299 + grayscale_weight.r, 0.587 + grayscale_weight.g, 0.114 + grayscale_weight.b));
	grayscale = grayscale_threshold > 0.0 ? step(grayscale_threshold, grayscale) : grayscale;
	vec3 duotoneColor = mix(grayscale_duotone_color0, grayscale_duotone_color1, grayscale);
	// TODO grayscale_duotoneのとこ普通に三項演算子にする
	usf_FragColor.rgb = mix(vec3(grayscale), duotoneColor, float(grayscale_duotone));
#endif
