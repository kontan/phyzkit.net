/// <reference path="../libs/jquery.d.ts" />
/// <reference path="../../three.d.ts" />

function replaceShaderChunkPlaceHolders(source:string):string{
	for(var key in THREE.ShaderChunk){
		if(THREE.ShaderChunk.hasOwnProperty(key)){
			source = source.replace("[[" + key + "]]",   THREE.ShaderChunk[key]);
		}
	}
	return source;
}


function initialize(
	vertexShaderContourSource:string,
	pixelShaderContourSource:string
){
	vertexShaderContourSource = replaceShaderChunkPlaceHolders(vertexShaderContourSource);
	pixelShaderContourSource  = replaceShaderChunkPlaceHolders(pixelShaderContourSource);

	function makeToon(viewportHeight:number, lightPos:THREE.Vector3, mesh:THREE.Mesh, map:THREE.Texture):THREE.Mesh{
		mesh.material = new THREE.MeshBasicMaterial({ map: map });

		var CONTOUR_LINE_WIDTH = 1.2; // pixel

		var material_contour = new THREE.ShaderMaterial({
			vertexShader: vertexShaderContourSource,
			fragmentShader: pixelShaderContourSource,
			uniforms: {
				lineWidth: { type:"f", value:CONTOUR_LINE_WIDTH / HEIGHT },
				lineColor: { type:"v3", value:new THREE.Vector3(0.4, 0.4, 0.4) }
			},
	        side: THREE.BackSide
		});

		var mesh_contour = new THREE.Mesh(
			mesh.geometry.clone(),
			material_contour
		);
		mesh_contour.position = mesh.position.clone();
		return mesh_contour;
	}


	var WIDTH:number = 800;
	var HEIGHT:number = 600;	
	var lightPos = new THREE.Vector3(200, 400, 10);

	var figure:THREE.Mesh, figure_contour:THREE.Mesh; 

	// renderer
	var renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer({
		clearColor: 0x00ffffff,
		clearAlpha: 1.0,
		antialias: true
	});

	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapCullFrontFaces = false;
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setFaceCulling("back");

	// scene
	var scene:THREE.Scene = new THREE.Scene();

	// camera
	var viewReferencePoint = new THREE.Vector3(0, 60, 0);
	var VIEW_ANGLE:number   = 45;
	var ASPECT_RATIO:number = WIDTH / HEIGHT;
	var NEAR_CLIP:number    = 0.1;
	var FAR_CLIP:number     = 10000;
	var camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT_RATIO, NEAR_CLIP, FAR_CLIP);
	camera.position.z = 350;
	camera.position.y = 200;
	camera.lookAt(viewReferencePoint);
	scene.add(camera);

	// sphere
	var SHERE_RADIUS   = 50;
	var SHERE_SEGMENTS = 16;
	var SHERE_RINGS    = 16;
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(SHERE_RADIUS, SHERE_SEGMENTS, SHERE_RINGS));
	sphere.position.x    = 100;
	sphere.position.y    = 200;
	sphere.castShadow    = true;
	sphere.receiveShadow = true;
	scene.add(sphere);

	// sphere contour
	var shereTexture = THREE.ImageUtils.loadTexture("m_world.jpg");
	

	var sphere_contour = makeToon(HEIGHT, lightPos, sphere, shereTexture);
	sphere_contour.castShadow = true;
	sphere_contour.receiveShadow  = true;	
	scene.add(sphere_contour);

	// plane
	var groundSize = 1000;
	var ground:THREE.Mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(groundSize, groundSize),
		new THREE.MeshPhongMaterial({
			color: 0xccffcc
		})
	);
	ground.position.y = 0;
	ground.rotation.x = -Math.PI/2;
	ground.castShadow = true;
	ground.receiveShadow  = true;
	scene.add(ground);

	// Light
	var LIGHT_SIZE = 200;
	var LIGHT_SHADOWMAP_SIZE = 1024;
	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position            = lightPos.clone();
	directionalLight.castShadow          = true;
	directionalLight.shadowDarkness      = 0.3;
	directionalLight.shadowMapWidth      = LIGHT_SHADOWMAP_SIZE; 
	directionalLight.shadowMapHeight     = LIGHT_SHADOWMAP_SIZE;
	directionalLight.shadowCameraVisible = true;	
	directionalLight.shadowCameraLeft    = -LIGHT_SIZE;
    directionalLight.shadowCameraRight   =  LIGHT_SIZE;
    directionalLight.shadowCameraTop     =  LIGHT_SIZE;
    directionalLight.shadowCameraBottom  = -LIGHT_SIZE;
	directionalLight.shadowCameraNear    = 5;
	directionalLight.shadowCameraFar     = 600;
	directionalLight.shadowBias          = -0.005;
	scene.add(directionalLight);

	$('#container').append(renderer.domElement);

	// Main Loop
	var theta = 0;
	function mainloop(){
		// Update
		sphere.position.z = 100 * Math.sin(theta);
		sphere_contour.position.z = sphere.position.z;
		theta += 0.02;
		
		// Render
		renderer.render(scene, camera);

		// Request Animation
		requestAnimationFrame(mainloop);
	}
	mainloop();

	var modelDataURL = "youmu.js";
	var youmuTexture = THREE.ImageUtils.loadTexture("youmu_tex.png");

	var loader = new THREE.JSONLoader();
	loader.load(modelDataURL, (geometry:THREE.Geometry, materials:THREE.Material[])=>{
		figure = new THREE.Mesh(geometry);
		figure.castShadow = true;
		figure.receiveShadow  = true;
		scene.add(figure);
		figure_contour = makeToon(HEIGHT, lightPos, figure, youmuTexture);
		scene.add(figure_contour);
		figure_contour.castShadow = true;
		figure_contour.receiveShadow  = true;

		window.addEventListener("keydown", (e:KeyboardEvent)=>{
			var dy = ((e.keyCode == 40 ? 1 : 0) - (e.keyCode == 38 ? 1 : 0));
			var dx = ((e.keyCode == 39 ? 1 : 0) - (e.keyCode == 37 ? 1 : 0));
			var dz = ((e.keyCode == 33 ? 1 : 0) - (e.keyCode == 34 ? 1 : 0));
			if(dx != 0 || dy != 0 || dz != 0){
				if(e.ctrlKey){
					figure.rotation.y += dx * 0.1;
				}else{
					camera.position = new THREE.Matrix4().makeRotationY(dx * 0.1).multiplyVector3(camera.position);
					camera.position.setLength(Math.max(100, camera.position.length() + dy * 10));
					camera.lookAt(viewReferencePoint);
				}

				figure_contour.rotation = figure.rotation.clone();
				figure_contour.position = figure.position.clone();
				e.preventDefault();
			}
		});
	});
}

$(()=>{
	var shaderFiles:string[] = [
		"vertexshader_contour.glsl", 
		"pixelshader_contour.glsl"
	];
    var sources:string[] = [];
    var loadedFileCount:number = 0;
    shaderFiles.forEach((file, i)=>{
    	$.ajax(file, {
    		contentType: "text/plain",
			success: (data:string)=>{
				sources[i] = data;
				loadedFileCount++;
				if(loadedFileCount == shaderFiles.length){
					initialize(sources[0], sources[1]);
				}
			}
		});
    });
});