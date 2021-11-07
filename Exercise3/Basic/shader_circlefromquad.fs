precision mediump float;

// TODO 3.3)	Define a constant variable (uniform) to 
//              "send" the canvas size to all fragments.
uniform vec2 canvasSize;

void main(void)
{ 
	float smoothMargin = 0.01;  
	float r = 0.8;         
	 
	// TODO 3.3)	Map the fragment's coordinate (gl_FragCoord.xy) into 
	//				the range of [-1,1]. Discard all fragments outside the circle 
	//				with the radius r. Smooth the circle's edge within 
	//				[r-smoothMargin, r] by computing an appropriate alpha value.

	gl_FragColor = vec4(1.0, 85.0 / 255.0, 0.0, 1.0);

	vec2 fragCoord = vec2(2.0 * (gl_FragCoord.x / canvasSize.x) - 1.0, 2.0 * (gl_FragCoord.y / canvasSize.y) - 1.0);
	float distanceFromCenter = sqrt(((fragCoord.x) * (fragCoord.x)) + ((fragCoord.y) * (fragCoord.y)));
	float t = ((1.0 / smoothMargin) * r);
	if (distanceFromCenter > r) {
		discard;
	} else if (distanceFromCenter >= (r - smoothMargin)) {
		gl_FragColor.a = -(1.0 /smoothMargin) * distanceFromCenter + t;
	}
}