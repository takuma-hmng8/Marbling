#ifdef USF_USE_MIXDST
	varying vec2 vMixDstCoverUv;
	uniform sampler2D mixDst_src;
	uniform bool mixDst_uv;
	uniform float mixDst_uv_factor;
	uniform vec2 mixDst_uv_offset;
	uniform float mixDst_uv_radius;
	uniform vec2 mixDst_uv_position;
	uniform bool mixDst_color;
	uniform float mixDst_color_factor;
	uniform float mixDst_color_radius;
	uniform vec2 mixDst_color_position;
	uniform bool mixDst_alpha;
	uniform float mixDst_alpha_factor;
	uniform float mixDst_alpha_radius;
	uniform vec2 mixDst_alpha_position;
#endif