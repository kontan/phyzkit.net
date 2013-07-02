uniform vec4 pointLight;

[[map_pars_vertex]]
[[lights_lambert_pars_vertex]]
[[color_pars_vertex]]
[[skinning_pars_vertex]]
[[shadowmap_pars_vertex]]

void main (void)
{
	[[map_vertex]],
	[[lightmap_vertex]],
	[[color_vertex]],

	[[skinbase_vertex]]
	[[skinning_vertex]]
	[[default_vertex]]

	[[worldpos_vertex]]
	[[lights_lambert_vertex]]
	[[shadowmap_vertex]]
}