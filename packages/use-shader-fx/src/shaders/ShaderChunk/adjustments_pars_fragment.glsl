#ifdef USF_USE_LEVELS
	uniform vec4 levels_shadows;
	uniform vec4 levels_midtones;
	uniform vec4 levels_highlights;
	uniform vec4 levels_outputMin;
	uniform vec4 levels_outputMax;
#endif

#ifdef USF_USE_CONTRAST
	uniform vec4 contrast_factor;
#endif

#ifdef USF_USE_COLORBALANCE
	uniform vec3 colorBalance_factor;
#endif

#ifdef USF_USE_HSV
	uniform float hsv_hueShift;
	uniform float hsv_saturation;
	uniform float hsv_brightness;
	vec3 hsv2rgb(vec3 c)
	{
		vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
		vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
		return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
	}
	vec3 rgb2hsv(vec3 c)
	{
		vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
		vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
		vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

		float d = q.x - min(q.w, q.y);
		float e = 1.0e-10;
		return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
	}
#endif

#ifdef USF_USE_POSTERIZE
	uniform vec4 posterize_levels;
	vec4 posterize(vec4 color, vec4 levels) 
	{
		return vec4(
			levels.x > 1. ? floor(color.r * levels.x) / levels.x : color.r,
			levels.y > 1. ? floor(color.g * levels.y) / levels.y : color.g,
			levels.z > 1. ? floor(color.b * levels.z) / levels.z : color.b,
			levels.w > 1. ? floor(color.a * levels.w) / levels.w : color.a
		);
	}
#endif

#ifdef USF_USE_GRAYSCALE
	uniform vec3 grayscale_weight;
	uniform bool grayscale_duotone;
	uniform vec3 grayscale_duotone_color0;
	uniform vec3 grayscale_duotone_color1;
	uniform float grayscale_threshold;
#endif