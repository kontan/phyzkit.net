var CONTOUR_LINE_WIDTH = 1.2;
var material_contour;
function replaceShaderChunkPlaceHolders(source) {
    for(var key in THREE.ShaderChunk) {
        if(THREE.ShaderChunk.hasOwnProperty(key)) {
            source = source.replace("[[" + key + "]]", THREE.ShaderChunk[key]);
        }
    }
    return source;
}
function initialize(vertexShaderContourSource, pixelShaderContourSource) {
    vertexShaderContourSource = replaceShaderChunkPlaceHolders(vertexShaderContourSource);
    pixelShaderContourSource = replaceShaderChunkPlaceHolders(pixelShaderContourSource);
    var WIDTH = 800;
    var HEIGHT = 600;
    var lightPos = new THREE.Vector3(200, 400, 10);
    var figure, figure_contour;
    var figure_animation;
    var figure_contour_animation;
    var renderer = new THREE.WebGLRenderer({
        clearColor: 16777215,
        clearAlpha: 1.0,
        antialias: true
    });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMapCullFrontFaces = true;
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setFaceCulling("back");
    var scene = new THREE.Scene();
    var viewReferencePoint = new THREE.Vector3(0, 60, 0);
    var VIEW_ANGLE = 45;
    var ASPECT_RATIO = WIDTH / HEIGHT;
    var NEAR_CLIP = 0.1;
    var FAR_CLIP = 10000;
    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT_RATIO, NEAR_CLIP, FAR_CLIP);
    camera.position.z = 350;
    camera.position.y = 200;
    camera.lookAt(viewReferencePoint);
    scene.add(camera);
    var SHERE_RADIUS = 50;
    var SHERE_SEGMENTS = 16;
    var SHERE_RINGS = 16;
    var shereTexture = THREE.ImageUtils.loadTexture("m_world.jpg");
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(SHERE_RADIUS, SHERE_SEGMENTS, SHERE_RINGS), new THREE.MeshBasicMaterial({
        map: shereTexture
    }));
    sphere.position.x = 100;
    sphere.position.y = 200;
    sphere.castShadow = true;
    sphere.receiveShadow = false;
    scene.add(sphere);
    var groundSize = 1000;
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(groundSize, groundSize), new THREE.MeshPhongMaterial({
        color: 13434828
    }));
    ground.position.y = 0;
    ground.rotation.x = -Math.PI / 2;
    ground.castShadow = false;
    ground.receiveShadow = true;
    scene.add(ground);
    var gl = renderer.context;
    var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var LIGHT_SIZE = 200;
    var LIGHT_SHADOWMAP_SIZE = Math.min(2048, maxTextureSize);
    var directionalLight = new THREE.DirectionalLight(16777215);
    directionalLight.position = lightPos.clone();
    directionalLight.castShadow = true;
    directionalLight.shadowDarkness = 0.3;
    directionalLight.shadowMapWidth = LIGHT_SHADOWMAP_SIZE;
    directionalLight.shadowMapHeight = LIGHT_SHADOWMAP_SIZE;
    directionalLight.shadowCameraVisible = true;
    directionalLight.shadowCameraLeft = -LIGHT_SIZE;
    directionalLight.shadowCameraRight = LIGHT_SIZE;
    directionalLight.shadowCameraTop = LIGHT_SIZE;
    directionalLight.shadowCameraBottom = -LIGHT_SIZE;
    directionalLight.shadowCameraNear = 5;
    directionalLight.shadowCameraFar = 800;
    directionalLight.shadowBias = 0.003;
    scene.add(directionalLight);
    $('#container').append(renderer.domElement);
    var theta = 0;
    var clock = new THREE.Clock();
    function mainloop() {
        sphere.position.z = 100 * Math.sin(theta);
        theta += 0.02;
        var delta = clock.getDelta();
        THREE.AnimationHandler.update(delta);
        renderer.render(scene, camera);
        requestAnimationFrame(mainloop);
    }
    mainloop();
    var modelDataURL = "youmu.js";
    var youmuTexture = THREE.ImageUtils.loadTexture("youmu_tex.png");
    var loader = new THREE.JSONLoader();
    loader.load(modelDataURL, function (geometry, materials) {
        figure = new THREE.SkinnedMesh(geometry);
        figure.castShadow = false;
        figure.receiveShadow = true;
        scene.add(figure);
        figure.material = new THREE.MeshBasicMaterial({
            map: youmuTexture,
            skinning: true
        });
        if(!THREE.AnimationHandler.get("attack")) {
            THREE.AnimationHandler.add(geometry.animation);
        }
        figure_animation = new THREE.Animation(figure, "attack");
        if(figure_animation && figure_contour_animation) {
            figure_animation.play();
            figure_contour_animation.play();
        }
    });
    loader.load(modelDataURL, function (geometry, materials) {
        material_contour = new THREE.ShaderMaterial({
            vertexShader: vertexShaderContourSource,
            fragmentShader: pixelShaderContourSource,
            uniforms: {
                lineWidth: {
                    type: "f",
                    value: CONTOUR_LINE_WIDTH / HEIGHT
                },
                lineColor: {
                    type: "v3",
                    value: new THREE.Vector3(0.4, 0.4, 0.4)
                }
            },
            side: THREE.BackSide,
            skinning: true
        });
        figure_contour = new THREE.SkinnedMesh(geometry, material_contour);
        figure_contour.castShadow = true;
        figure_contour.receiveShadow = false;
        scene.add(figure_contour);
        if(!THREE.AnimationHandler.get("attack")) {
            THREE.AnimationHandler.add(geometry.animation);
        }
        figure_contour_animation = new THREE.Animation(figure_contour, "attack");
        if(figure_animation && figure_contour_animation) {
            figure_animation.play();
            figure_contour_animation.play();
        }
    });
    window.addEventListener("keydown", function (e) {
        var dy = ((e.keyCode == 40 ? 1 : 0) - (e.keyCode == 38 ? 1 : 0));
        var dx = ((e.keyCode == 39 ? 1 : 0) - (e.keyCode == 37 ? 1 : 0));
        var dz = ((e.keyCode == 33 ? 1 : 0) - (e.keyCode == 34 ? 1 : 0));
        if(dx != 0 || dy != 0 || dz != 0) {
            if(e.ctrlKey) {
                figure.rotation.y += dx * 0.1;
            } else {
                camera.position = new THREE.Matrix4().makeRotationY(dx * 0.1).multiplyVector3(camera.position);
                camera.position.setLength(Math.max(100, camera.position.length() + dy * 10));
                camera.lookAt(viewReferencePoint);
            }
            if(figure && figure_contour) {
                figure_contour.rotation = figure.rotation.clone();
                figure_contour.position = figure.position.clone();
            }
            e.preventDefault();
        }
    });
    $("#bias_mant").change(function () {
        directionalLight.shadowBias = 0.003 + ($("#bias_mant").val() - 50) * 0.001;
        $("#bias").text(directionalLight.shadowBias.toString());
    });
    $("#contour_slider").change(function () {
        if(material_contour) {
            material_contour.uniforms["lineWidth"].value = CONTOUR_LINE_WIDTH / HEIGHT + ($("#contour_slider").val() - 50) * 0.0002;
            $("#contour_label").text(material_contour.uniforms["lineWidth"].value.toString());
        }
    });
}
$(function () {
    var shaderFiles = [
        "contour.vert", 
        "contour.frag"
    ];
    var sources = [];
    var loadedFileCount = 0;
    shaderFiles.forEach(function (file, i) {
        $.ajax(file, {
            success: function (data) {
                sources[i] = data;
                loadedFileCount++;
                if(loadedFileCount == shaderFiles.length) {
                    initialize(sources[0], sources[1]);
                }
            }
        });
    });
});
//@ sourceMappingURL=app.js.map
