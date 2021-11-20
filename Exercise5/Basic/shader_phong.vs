precision mediump float;

attribute vec3 vVertex;
attribute vec3 vNormal;

uniform mat4 modelMatrix; // model matrix
uniform mat4 cameraMatrix; // camera matrix
uniform mat4 projectionMatrix; // projection matrix

uniform mat4 normalMatrix;


// TODO 5.2a)	Define a varying variable to
//				pass the normal to the fragment
//				shader.
varying vec3 n;

// TODO 5.2a)	Define a varying variable to
//				pass the world position to the
//				fragment shader.
varying vec3 worldPos;



void main(void)
{
	mat4 MVP = projectionMatrix * cameraMatrix * modelMatrix;
	gl_Position = MVP * vec4(vVertex, 1);

	// TODO 5.2a)	Assign the normal to the varying variable. 
	//				Before you do so, transform it from model
	//				space to world space. Use the appropriate
	//				matrix. Do not forget to normalize the normal
	//				afterwards.
	vec4 n_temp = normalMatrix * vec4(vNormal, 1);
	n = normalize(vec3(n_temp.x, n_temp.y, n_temp.z));

	// TODO 5.2a)	Assign the position to the varying variable. 
	//				Before you do so, transform it from model
	//				space to world space. Use the appropriate
	//				matrix. Do not forget to dehomogenize it 
	//				afterwards.
	vec4 world_temp = modelMatrix * vec4(vVertex, 1);
	worldPos = vec3(world_temp);
	
}