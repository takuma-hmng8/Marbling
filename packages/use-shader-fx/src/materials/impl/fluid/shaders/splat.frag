uniform vec2 force;
uniform vec2 center;

void main(){
	vec2 circle = (vUv - 0.5) * 2.0;
	float d = 1.0-min(length(circle), 1.0);
	d *= d;
	gl_FragColor = vec4(force * d, 0., 1.);
}