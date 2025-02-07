uniform vec2 force;

void main(){
	gl_FragColor = vec4(force * pow(1.0 - clamp(2.0 * distance(vUv, vec2(0.5)), 0.0, 1.0), 2.0), 0.0, 1.0);
}