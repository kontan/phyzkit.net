uniform float lineWidth;

[[skinning_pars_vertex]]

void main (void)
{

	[[skinbase_vertex]]
	[[skinning_vertex]]
	[[default_vertex]] 

	float z = gl_Position.z;

	#ifdef USE_SKINNING
		skinVertex = vec4( position, 1.0 );
		skinVertex += lineWidth * z * vec4(normalize(normal), 0.0);
		skinned  = boneMatX * skinVertex * skinWeight.x;
		skinned += boneMatY * skinVertex * skinWeight.y;
		mvPosition = modelViewMatrix * skinned;
		gl_Position = projectionMatrix * mvPosition;
	#else
		vec4 p = vec4(position, 1.0);
		p += lineWidth * z * vec4(normalize(normal), 0.0);
		gl_Position = projectionMatrix * modelViewMatrix * p;
	#endif
}