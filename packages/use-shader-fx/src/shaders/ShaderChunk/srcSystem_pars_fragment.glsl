#ifdef USF_USE_SRC_SYSTEM

	float calcMixCirclePower(vec2 center, float radius)
	{
		vec2 adjustedUV = (vUv - 0.5) * vec2(aspectRatio, 1.0) + 0.5;
		float dist = length(adjustedUV - center);
		float power = radius > 0.0 ? 1.0 - dist / radius : 1.0;
		return clamp(power, 0.0, 1.0);
	}

#endif