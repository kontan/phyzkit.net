var GameLib;
(function (GameLib) {
    (function (Keys) {
        Keys._map = [];
        Keys.Enter = 13;
        Keys.Shift = 16;
        Keys.Ctrl = 17;
        Keys.Alt = 18;
        Keys.PageUp = 33;
        Keys.PageDown = 34;
        Keys.Left = 37;
        Keys.Up = 38;
        Keys.Right = 39;
        Keys.Down = 40;
        Keys.A = 65;
        Keys.B = 66;
        Keys.C = 67;
        Keys.D = 68;
        Keys.E = 69;
        Keys.F = 70;
        Keys.G = 71;
        Keys.H = 72;
        Keys.I = 73;
        Keys.J = 74;
        Keys.K = 75;
        Keys.L = 76;
        Keys.M = 77;
        Keys.N = 78;
        Keys.O = 79;
        Keys.P = 80;
        Keys.Q = 81;
        Keys.R = 82;
        Keys.S = 83;
        Keys.T = 84;
        Keys.U = 85;
        Keys.V = 86;
        Keys.W = 87;
        Keys.X = 88;
        Keys.Y = 89;
        Keys.Z = 90;
    })(GameLib.Keys || (GameLib.Keys = {}));
    var Keys = GameLib.Keys;
})(GameLib || (GameLib = {}));
var GameLib;
(function (GameLib) {
    GameLib.ResoureDirectoryPath = "./res/";
    var RequestedResourceCount = 0;
    var ResourceCompletionHandlers = [];
    var ResourceFailedHandlers = [];
    function waitComplete(onComplete, onFailed) {
        if(RequestedResourceCount == 0) {
            onComplete();
        } else {
            ResourceCompletionHandlers.push(onComplete);
            if(onFailed) {
                ResourceFailedHandlers.push(onFailed);
            }
        }
    }
    GameLib.waitComplete = waitComplete;
    function fireResourceEvent() {
        if(RequestedResourceCount == 0) {
            ResourceCompletionHandlers.forEach(function (h) {
                return h();
            });
            ResourceCompletionHandlers = [];
            ResourceFailedHandlers = [];
        }
    }
    function resourceLoadingComplete() {
        RequestedResourceCount--;
        console.log("resourceLoadingComplete: remain=" + RequestedResourceCount);
        fireResourceEvent();
    }
    function resourceLoadingFailed(errMessage) {
        console.log("GameLib.resource.ts resourceLoadingFailed: failed! : " + errMessage);
        RequestedResourceCount = 0;
        ResourceCompletionHandlers = [];
        ResourceFailedHandlers.forEach(function (h) {
            return h();
        });
        ResourceFailedHandlers = [];
    }
    function loadString(name) {
        RequestedResourceCount++;
        console.log("loading \"" + name + "\" from file...");
        var result;
        $.ajax(GameLib.ResoureDirectoryPath + "/" + name, {
            dataType: "text",
            success: function (data) {
                console.log("loading \"" + name + "\" from file: succeed!");
                result = data;
                resourceLoadingComplete();
                return true;
            },
            error: function (req, textStatus, errorThrown) {
                resourceLoadingFailed(name + " status:" + textStatus);
                return true;
            }
        });
        return function () {
            return result;
        };
    }
    GameLib.loadString = loadString;
    function loadJSON(name) {
        var res = loadString(name);
        var json;
        return function () {
            if((!json) && res()) {
                json = JSON.parse(res());
            }
            return json;
        };
    }
    GameLib.loadJSON = loadJSON;
    function loadImage(name) {
        RequestedResourceCount++;
        console.log("loading \"" + name + "\" from file...");
        var result;
        var img = new Image();
        img.addEventListener('load', function () {
            console.log("loading \"" + name + "\" from file: succeed!");
            result = img;
            resourceLoadingComplete();
            return true;
        });
        img.addEventListener('error', function () {
            console.log("loading \"" + name + "\" from file: failed!");
            console.log("loading \"" + name + "\" from resource...");
            var img2 = new Image();
            img2.addEventListener('load', function () {
                console.log("loading \"" + name + "\" from resource: succeed!");
                result = img2;
                resourceLoadingComplete();
                return true;
            });
            img2.addEventListener('error', function () {
                console.log("loading \"" + name + "\" from resource: failed!");
                result = img2;
                resourceLoadingFailed("loading \"" + name + "\" from resource: failed!");
                return true;
            });
            img2.src = resources[name];
            console.log("error: " + RequestedResourceCount);
            return true;
        });
        img.src = GameLib.ResoureDirectoryPath + name;
        return function () {
            return result;
        };
    }
    GameLib.loadImage = loadImage;
    function loadTexture(name) {
        var img = loadImage(name);
        var tex;
        return function () {
            if((!tex) && img()) {
                tex = new THREE.Texture(img());
                tex.image = img();
                tex.needsUpdate = true;
                (tex).sourceFile = name;
            }
            return tex;
        };
    }
    GameLib.loadTexture = loadTexture;
})(GameLib || (GameLib = {}));
var GameLib;
(function (GameLib) {
    function intersectSphereMesh(geometry, p, r) {
        var face;
        intersectSphereMeshGetFace(geometry, p, r, function (f) {
            face = f;
            return false;
        });
        return face ? true : false;
    }
    GameLib.intersectSphereMesh = intersectSphereMesh;
    function intersectSphereMeshGetFace(geometry, p, r, callback) {
        var rr = r * r;
        var intersectTriangle = function (A, B, C) {
            var B_A = new THREE.Vector3().subVectors(B, A);
            var C_A = new THREE.Vector3().subVectors(C, A);
            var V = new THREE.Vector3().crossVectors(B_A, C_A);
            var d = A.dot(V);
            var e = V.dot(V);
            var sep1 = d * d > rr * e;
            if(sep1) {
                return false;
            }
            var aa = A.dot(A);
            var ab = A.dot(B);
            var ac = A.dot(C);
            var bb = B.dot(B);
            var bc = B.dot(C);
            var cc = C.dot(C);
            var sep2 = (aa > rr) && (ab > aa) && (ac > aa);
            if(sep2) {
                return false;
            }
            var sep3 = (bb > rr) && (ab > bb) && (bc > bb);
            if(sep3) {
                return false;
            }
            var sep4 = (cc > rr) && (ac > cc) && (bc > cc);
            if(sep4) {
                return false;
            }
            var AB = new THREE.Vector3().subVectors(B, A);
            var BC = new THREE.Vector3().subVectors(C, B);
            var CA = new THREE.Vector3().subVectors(A, C);
            var d1 = ab - aa;
            var d2 = bc - bb;
            var d3 = ac - cc;
            var e1 = AB.dot(AB);
            var e2 = BC.dot(BC);
            var e3 = CA.dot(CA);
            var Q1 = A.clone().multiplyScalar(e1).sub(AB.clone().multiplyScalar(d1));
            var Q2 = B.clone().multiplyScalar(e2).sub(BC.clone().multiplyScalar(d2));
            var Q3 = C.clone().multiplyScalar(e3).sub(CA.clone().multiplyScalar(d3));
            var QC = C.clone().multiplyScalar(e1).sub(Q1);
            var QA = A.clone().multiplyScalar(e2).sub(Q2);
            var QB = B.clone().multiplyScalar(e3).sub(Q3);
            var sep5 = (Q1.dot(Q1) > rr * e1 * e1) && (Q1.dot(QC) > 0);
            if(sep5) {
                return false;
            }
            var sep6 = (Q2.dot(Q2) > rr * e2 * e2) && (Q2.dot(QA) > 0);
            if(sep6) {
                return false;
            }
            var sep7 = (Q3.dot(Q3) > rr * e3 * e3) && (Q3.dot(QB) > 0);
            if(sep7) {
                return false;
            }
            return true;
        };
        var vertices = geometry.vertices;
        var facePlane = new THREE.Plane();
        var sphere = new THREE.Sphere(p, r);
        for(var f = 0, fl = geometry.faces.length; f < fl; f++) {
            var face = geometry.faces[f];
            facePlane.setFromNormalAndCoplanarPoint(face.normal, face.centroid);
            var distance = facePlane.distanceToSphere(sphere);
            if(distance > 0) {
                continue;
            }
            if(distance < r * -2) {
                continue;
            }
            if(face instanceof THREE.Face3) {
                var face3 = face;
                var a = vertices[face3.a].clone().sub(p);
                var b = vertices[face3.b].clone().sub(p);
                var c = vertices[face3.c].clone().sub(p);
                if(intersectTriangle(a, b, c)) {
                    if(!callback(face)) {
                        return;
                    }
                }
            } else if(face instanceof THREE.Face4) {
                var face4 = face;
                var a = vertices[face4.a].clone().sub(p);
                var b = vertices[face4.b].clone().sub(p);
                var c = vertices[face4.c].clone().sub(p);
                var d = vertices[face4.d].clone().sub(p);
                if(intersectTriangle(a, b, d) || intersectTriangle(b, c, d)) {
                    if(!callback(face)) {
                        return;
                    }
                }
            } else {
                throw Error();
            }
        }
    }
    GameLib.intersectSphereMeshGetFace = intersectSphereMeshGetFace;
})(GameLib || (GameLib = {}));
var GameLib;
(function (GameLib) {
    var AnimationClass = (function () {
        function AnimationClass(name, texture, meshData) {
            this.name = name;
            this.texture = texture;
            this.meshData = meshData;
            var _this = this;
            this.listeners = [];
            GameLib.waitComplete(function () {
                _this.solidMaterial = new THREE.MeshBasicMaterial({
                    map: _this.texture(),
                    skinning: true
                });
                var loader = new THREE.JSONLoader();
                loader.onLoadStart();
                loader.createModel(_this.meshData(), function (geometry) {
                    _this.geometry = geometry;
                    var animations = (geometry).animations;
                    animations.forEach(function (anim) {
                        if(!THREE.AnimationHandler.get(anim.name)) {
                            THREE.AnimationHandler.add(anim);
                        }
                    });
                    _this.listeners.forEach(function (f) {
                        f();
                    });
                    _this.listeners = [];
                });
            });
        }
        AnimationClass.instances = {
        };
        AnimationClass.get = function get(name) {
            if(!name) {
                throw new Error();
            }
            if(!AnimationClass.instances[name]) {
                AnimationClass.instances[name] = new AnimationClass(name, GameLib.loadTexture(name + '_tex.png'), GameLib.loadJSON(name + '.js'));
            }
            return AnimationClass.instances[name];
        };
        AnimationClass.prototype.addLoadEventListener = function (f) {
            if(this.geometry) {
                f();
            } else {
                this.listeners.push(f);
            }
        };
        return AnimationClass;
    })();
    GameLib.AnimationClass = AnimationClass;    
})(GameLib || (GameLib = {}));
var GameLib;
(function (GameLib) {
    function replaceShaderChunkPlaceHolders(source) {
        for(var key in THREE.ShaderChunk) {
            if(THREE.ShaderChunk.hasOwnProperty(key)) {
                source = source.replace("[[" + key + "]]", THREE.ShaderChunk[key]);
            }
        }
        return source;
    }
    GameLib.replaceShaderChunkPlaceHolders = replaceShaderChunkPlaceHolders;
    function getArrowKey(e) {
        var dy = ((e.keyCode == 40 ? 1 : 0) - (e.keyCode == 38 ? 1 : 0));
        var dx = ((e.keyCode == 39 ? 1 : 0) - (e.keyCode == 37 ? 1 : 0));
        var dz = ((e.keyCode == 33 ? 1 : 0) - (e.keyCode == 34 ? 1 : 0));
        return new THREE.Vector3(dx, dy, dz);
    }
    GameLib.getArrowKey = getArrowKey;
    var totalFrames = 0;
    var gamelibMainloop = function () {
        totalFrames++;
        requestAnimationFrame(gamelibMainloop);
    };
    gamelibMainloop();
    function getTotalFrames() {
        return totalFrames;
    }
    GameLib.getTotalFrames = getTotalFrames;
    function validateNumber(n) {
        if(n === undefined || n === null || n === Number.NaN || n === Number.NEGATIVE_INFINITY || n === Number.POSITIVE_INFINITY) {
            throw new Error();
        }
        return n;
    }
    GameLib.validateNumber = validateNumber;
    function validateVector3(v) {
        if(v === null || v === undefined) {
            throw new Error();
        }
        validateNumber(v.x);
        validateNumber(v.y);
        validateNumber(v.z);
        return v;
    }
    GameLib.validateVector3 = validateVector3;
    function saveVector3(v) {
        if(!v) {
            throw new Error();
        }
        return [
            v.x, 
            v.y, 
            v.z
        ];
    }
    GameLib.saveVector3 = saveVector3;
    function loadVector3(json) {
        if(!json) {
            throw new Error();
        }
        return new THREE.Vector3(json[0], json[1], json[2]);
    }
    GameLib.loadVector3 = loadVector3;
})(GameLib || (GameLib = {}));
var GameLib;
(function (GameLib) {
    var table = {
    };
    var releaseTable = {
    };
    window.addEventListener("keydown", function (e) {
        table[e.keyCode] = table[e.keyCode] || GameLib.getTotalFrames();
        delete releaseTable[e.keyCode];
    });
    window.addEventListener("keyup", function (e) {
        releaseTable[e.keyCode] = GameLib.getTotalFrames() - table[e.keyCode];
        delete table[e.keyCode];
    });
    function isKeyDown(key) {
        return table[key] && table[key] >= 0;
    }
    GameLib.isKeyDown = isKeyDown;
    function getKey(key) {
        return table[key] ? GameLib.getTotalFrames() - table[key] : null;
    }
    GameLib.getKey = getKey;
    function getReleasedKey(key) {
        var value = releaseTable[key];
        delete releaseTable[key];
        return value;
    }
    GameLib.getReleasedKey = getReleasedKey;
    function getArrow() {
        var dy = (isKeyDown(GameLib.Keys.Down) ? 1 : 0) - (isKeyDown(GameLib.Keys.Up) ? 1 : 0);
        var dx = (isKeyDown(GameLib.Keys.Right) ? 1 : 0) - (isKeyDown(GameLib.Keys.Left) ? 1 : 0);
        var dz = (isKeyDown(GameLib.Keys.PageDown) ? 1 : 0) - (isKeyDown(GameLib.Keys.PageUp) ? 1 : 0);
        return new THREE.Vector3(dx, dy, dz);
    }
    GameLib.getArrow = getArrow;
})(GameLib || (GameLib = {}));
var GameLib;
(function (GameLib) {
    var TGamepad = (function () {
        function TGamepad(index) {
            this.index = index;
            var _this = this;
            this.buttons = {
            };
            this.release = {
            };
            this.keyBinding = {
            };
            var loop = function () {
                var gamepad = _this.getGamepad();
                if(gamepad) {
                    _this.release = {
                    };
                    for(var i = 0; i < gamepad.buttons.length; i++) {
                        if(_this.buttons[i] && (!gamepad.buttons[i])) {
                            _this.release[i] = GameLib.getTotalFrames() - _this.buttons[i];
                        }
                        _this.buttons[i] = gamepad.buttons[i] ? (_this.buttons[i] || GameLib.getTotalFrames()) : undefined;
                    }
                }
                requestAnimationFrame(loop);
            };
            loop();
        }
        TGamepad.defaultKeyBindings = {
            left: GameLib.Keys.Left,
            right: GameLib.Keys.Right,
            up: GameLib.Keys.Up,
            down: GameLib.Keys.Down,
            buttons: [
                GameLib.Keys.Z, 
                GameLib.Keys.Shift, 
                undefined, 
                undefined, 
                undefined, 
                GameLib.Keys.V
            ]
        };
        TGamepad.prototype.getButton = function (index) {
            return (this.buttons[index] ? GameLib.getTotalFrames() - this.buttons[index] : null) || (GameLib.getKey((this.keyBinding.buttons && this.keyBinding.buttons[index]) || TGamepad.defaultKeyBindings.buttons[index]));
        };
        TGamepad.prototype.getReleasedButton = function (index) {
            return this.release[index];
        };
        TGamepad.prototype.getGamepad = function () {
            var nav = navigator;
            var f = nav.webkitGetGamepads || nav.mozGetGamepads || nav.getGamepads;
            var gamepads = f ? f.call(nav) : [];
            return gamepads[this.index];
        };
        TGamepad.prototype.getLeftStick = function () {
            var gamepad = this.getGamepad();
            var leftKey = this.keyBinding.left || TGamepad.defaultKeyBindings.left;
            var rightKey = this.keyBinding.right || TGamepad.defaultKeyBindings.right;
            var upKey = this.keyBinding.up || TGamepad.defaultKeyBindings.up;
            var downKey = this.keyBinding.down || TGamepad.defaultKeyBindings.down;
            var v = new THREE.Vector2(Math.min(1, (gamepad ? gamepad.axes[0] : 0) - (GameLib.isKeyDown(leftKey) ? 1 : 0) + (GameLib.isKeyDown(rightKey) ? 1 : 0)), Math.min(1, (gamepad ? gamepad.axes[1] : 0) - (GameLib.isKeyDown(upKey) ? 1 : 0) + (GameLib.isKeyDown(downKey) ? 1 : 0)));
            if(v.length() > 0.1) {
                return v;
            } else {
                return new THREE.Vector2(0, 0);
            }
        };
        TGamepad.prototype.getRightStick = function () {
            var gamepad = this.getGamepad();
            var v = new THREE.Vector2(gamepad ? gamepad.axes[2] : 0, gamepad ? gamepad.axes[3] : 0);
            if(v.length() > 0.1) {
                return v;
            } else {
                return new THREE.Vector2(0, 0);
            }
        };
        TGamepad.prototype.getKeyBinding = function () {
            return this.keyBinding;
        };
        return TGamepad;
    })();
    GameLib.TGamepad = TGamepad;    
})(GameLib || (GameLib = {}));
var GameLib;
(function (GameLib) {
    var VERTICAL_LIMIT = 0.8;
    var AVATOR_COLLISION_SIZE = 0.01;
    var Avator = (function () {
        function Avator() {
            this.walking = false;
            this.velocity = new THREE.Vector3();
            this.radius = 0.3;
            this.position = new THREE.Vector3();
            this.direction = 0;
            this.gravity = -0.007;
            this._landing = false;
            this.friction = 0.1;
        }
        Object.defineProperty(Avator.prototype, "landing", {
            get: function () {
                return this._landing;
            },
            enumerable: true,
            configurable: true
        });
        Avator.prototype.getPosition = function () {
            return this.position.clone();
        };
        Avator.prototype.setPosition = function (position) {
            this.position.copy(GameLib.validateVector3(position));
        };
        Avator.prototype.getFootPosition = function () {
            return new THREE.Vector3(this.position.x, this.position.y - this.radius, this.position.z);
        };
        Avator.prototype.setFootPosition = function (position) {
            this.setPosition(new THREE.Vector3(position.x, position.y + this.radius, position.z));
        };
        Avator.prototype.setDirection = function (roty) {
            this.direction = GameLib.validateNumber(roty);
        };
        Avator.prototype.getDirection = function () {
            return this.direction;
        };
        Avator.prototype.getDirectionVector = function () {
            return new THREE.Vector3(Math.sin(this.getDirection()), 0, Math.cos(this.getDirection()));
        };
        Avator.prototype.setDirectionVector = function (v) {
            this.setDirection(Math.atan2(v.x, v.z));
        };
        Avator.prototype.lookAt = function (p) {
            this.setDirectionVector(p.clone().sub(this.getPosition()));
        };
        Avator.prototype.addVelocity = function (v) {
            this.velocity.add(v);
        };
        Avator.prototype.walk = function (v, onStart, onFinish) {
            if(this._landing) {
                if(v && (v.x || v.y || v.z)) {
                    if(!this.walking && onStart) {
                        onStart();
                    }
                    this.walking = true;
                    v = v.multiplyScalar(0.06);
                    var t = 0.2;
                    this.velocity.x += v.x * t;
                    this.velocity.y += v.y * t;
                    this.velocity.z += v.z * t;
                } else {
                    if(this.walking) {
                        if(onFinish) {
                            onFinish();
                        }
                        this.walking = false;
                    }
                }
            } else if(v) {
                var t = 0.002;
                this.velocity.x += v.x * t;
                this.velocity.y += v.y * t;
                this.velocity.z += v.z * t;
            }
            if(v) {
                function regularize(angle) {
                    angle = angle >= -Math.PI ? angle : (angle + Math.PI * 2);
                    angle = angle < Math.PI ? angle : (angle - Math.PI * 2);
                    return angle;
                }
                var delta = Math.atan2(v.x, v.z) - this.getDirection();
                var rot = this.getDirection() + regularize(delta) * 0.2;
                rot = regularize(rot);
                this.setDirection(rot);
            }
        };
        Avator.prototype.jump = function (v, onLanding) {
            GameLib.validateNumber(v);
            if(this._landing) {
                var t = 1.0;
                this.velocity.y += Math.max(0, v);
                this._landing = false;
                this.onLanding = onLanding;
            }
            this.walking = false;
        };
        Avator.prototype.cancelJumping = function () {
            if(this.velocity.y > 0) {
                this.velocity.y -= 4;
            }
        };
        Avator.prototype.update = function (collesion, avators) {
            var _this = this;
            if(this._landing) {
                this.velocity.x *= (1 - this.friction);
                this.velocity.z *= (1 - this.friction);
            }
            this.velocity.y += this.gravity;
            var newPos = this.getPosition().clone().add(this.velocity);
            avators.forEach(function (avator) {
                if(avator !== _this) {
                    var n = avator.getPosition().sub(newPos);
                    var range = n.length();
                    n.normalize();
                    if(range <= (_this.radius + avator.radius)) {
                        var shadow = n.dot(_this.velocity);
                        var u = n.clone().multiplyScalar(shadow);
                        u.setLength(u.length() + AVATOR_COLLISION_SIZE);
                        _this.velocity.sub(u);
                    }
                }
            });
            var count = 0;
            GameLib.intersectSphereMeshGetFace(collesion.geometry, newPos, this.radius, function (face) {
                var n = face.normal.clone();
                n.normalize();
                if(_this.velocity.clone().normalize().dot(n) <= 0) {
                    var shadow = n.dot(_this.velocity);
                    var u = n.clone().multiplyScalar(shadow);
                    _this.velocity.sub(u);
                }
                if(n.dot(new THREE.Vector3(0, 1, 0)) > VERTICAL_LIMIT) {
                    if(!_this._landing) {
                        if(_this.onLanding) {
                            _this.onLanding();
                            _this.onLanding = null;
                        }
                        _this.velocity.y = 0;
                    }
                    _this._landing = true;
                }
                count++;
                return true;
            });
            this.setPosition(this.getPosition().clone().add(this.velocity));
        };
        Avator.prototype.save = function () {
            return {
                position: GameLib.saveVector3(this.getPosition()),
                direction: this.getDirection()
            };
        };
        Avator.load = function load(json) {
            if(!json) {
                throw new Error();
            }
            var avator = new Avator();
            avator.setPosition(GameLib.loadVector3(json.position));
            avator.setDirection(json.direction);
            return avator;
        };
        return Avator;
    })();
    GameLib.Avator = Avator;    
})(GameLib || (GameLib = {}));
var Yoyo;
(function (Yoyo) {
    var ANIMATION_DASH = "Dash";
    var ANIMATION_STAND = "Stand";
    var CONTOUR_LINE_WIDTH = 1.2;
    var vertexShaderContourResource = GameLib.loadString('contour.vert');
    var pixelShaderContourResource = GameLib.loadString('contour.frag');
    var vertexShaderContourSource;
    var pixelShaderContourSource;
    var material_contour;
    function initializePlayerResource() {
        if(!vertexShaderContourSource) {
            vertexShaderContourSource = GameLib.replaceShaderChunkPlaceHolders(vertexShaderContourResource());
            pixelShaderContourSource = GameLib.replaceShaderChunkPlaceHolders(pixelShaderContourResource());
            material_contour = new THREE.ShaderMaterial({
                vertexShader: vertexShaderContourSource,
                fragmentShader: pixelShaderContourSource,
                uniforms: {
                    lineWidth: {
                        type: "f",
                        value: CONTOUR_LINE_WIDTH / Yoyo.DEFAULT_HEIGHT
                    },
                    lineColor: {
                        type: "v3",
                        value: new THREE.Vector3(0.3, 0.3, 0.3)
                    }
                },
                side: THREE.BackSide,
                skinning: true
            });
        }
    }
    Yoyo.initializePlayerResource = initializePlayerResource;
    GameLib.waitComplete(function () {
        initializePlayerResource();
    });
    function updateContourWidth(contentHeight) {
        if(material_contour) {
            material_contour.uniforms["lineWidth"].value = CONTOUR_LINE_WIDTH / contentHeight;
        }
    }
    Yoyo.updateContourWidth = updateContourWidth;
    var MAX_MOTION_COUNT = 3;
    var Player = (function () {
        function Player(playerClass, world) {
            this.playerClass = playerClass;
            this.world = world;
            var _this = this;
            this.animationName = ANIMATION_STAND;
            this.zapping = false;
            this.avator = new GameLib.Avator();
            this.life = 6;
            this.maxLife = 8;
            this.slashing = 0;
            this.playerClass.addLoadEventListener(function () {
                _this.figure_contour = new THREE.SkinnedMesh(_this.playerClass.geometry, material_contour);
                _this.figure_contour.castShadow = true;
                _this.figure_contour.receiveShadow = false;
                _this.world.scene.add(_this.figure_contour);
                _this.figure = new THREE.SkinnedMesh(_this.playerClass.geometry, _this.playerClass.solidMaterial);
                _this.figure.castShadow = false;
                _this.figure.receiveShadow = true;
                _this.world.scene.add(_this.figure);
                _this.playAnimation(ANIMATION_STAND);
            });
            this.setFootPosition(new THREE.Vector3(0, 0.01, 0));
        }
        Player.prototype.getAvator = function () {
            return this.avator;
        };
        Player.prototype.loadAnimations = function (geometry) {
            var animations = (geometry).animations;
            animations.forEach(function (anim) {
                if(!anim.name) {
                    console.log('[[WARNING]] player.ts:loadAnimations, Animation data not found. Confirm exporting options in Blender exporter! ');
                }
                if(!THREE.AnimationHandler.get(anim.name)) {
                    THREE.AnimationHandler.add(anim);
                }
            });
        };
        Player.prototype.playAnimation = function (name, onFinish) {
            this.playingAnimationName = name;
            this.playingAnimationOnFinish = onFinish;
        };
        Player.prototype.getCenterPosition = function () {
            return this.getPosition().add(new THREE.Vector3(0, 0.4, 0));
        };
        Player.prototype.getPosition = function () {
            return this.avator.getPosition();
        };
        Player.prototype.getFootPosition = function () {
            return this.avator.getFootPosition();
        };
        Player.prototype.setFootPosition = function (position) {
            this.avator.setFootPosition(position);
        };
        Player.prototype.setPosition = function (position) {
            this.avator.setPosition(position);
        };
        Player.prototype.setDirection = function (roty) {
            this.avator.setDirection(roty);
        };
        Player.prototype.getDirection = function () {
            return this.avator.getDirection();
        };
        Player.prototype.getDirectionVector = function () {
            return this.avator.getDirectionVector();
        };
        Player.prototype.setDirectionVector = function (v) {
            this.avator.setDirectionVector(v);
        };
        Player.prototype.lookAt = function (p) {
            this.avator.lookAt(p);
        };
        Player.prototype.walk = function (v) {
            var _this = this;
            if(this.slashing === 0) {
                this.avator.walk(v, function () {
                    _this.playAnimation(ANIMATION_DASH);
                }, function () {
                    _this.playAnimation(ANIMATION_STAND);
                });
                this.slashing = 0;
            }
        };
        Player.prototype.zap = function () {
            var _this = this;
            if(this.avator.landing) {
                this.slashCount = GameLib.getTotalFrames();
                if(this.slashing < MAX_MOTION_COUNT) {
                    if(this.target) {
                        this.lookAt(this.target.getPosition());
                    }
                    this.slashing++;
                    this.playAnimation('Slash', function () {
                        _this.zapping = false;
                        _this.playAnimation(ANIMATION_STAND);
                        _this.avator.walk(null);
                        _this.slashing = 0;
                    });
                    this.avator.addVelocity(this.avator.getDirectionVector().setLength(0.02));
                }
            }
        };
        Player.prototype.jump = function (v) {
            var _this = this;
            this.playAnimation('Jump');
            this.avator.jump(v, function () {
                _this.playAnimation(ANIMATION_STAND);
            });
        };
        Player.prototype.update = function () {
            this.avator.update(this.world.ground, this.world.avators);
            if(this.figure && this.figure_contour && this.playingAnimationName) {
                if(!THREE.AnimationHandler.get(this.playingAnimationName)) {
                    console.log("WARNING: player.ts: " + this.playingAnimationName + " not registered.");
                }
                if(this.figure_animation) {
                    this.figure_animation.stop();
                }
                if(this.figure_contour_animation) {
                    this.figure_contour_animation.stop();
                }
                this.figure_animation = new THREE.Animation(this.figure, this.playingAnimationName);
                this.figure_contour_animation = new THREE.Animation(this.figure_contour, this.playingAnimationName);
                this.figure_animation.play(!this.playingAnimationOnFinish);
                this.figure_contour_animation.play(!this.playingAnimationOnFinish);
                this.playingAnimationName = null;
            }
            if(this.figure_animation && this.playingAnimationOnFinish && !this.figure_animation.isPlaying) {
                this.playingAnimationOnFinish();
                this.playingAnimationOnFinish = null;
            }
            if(this.figure) {
                this.figure.position = this.getFootPosition();
                this.figure_contour.position = this.getFootPosition();
                this.figure.rotation.y = this.getDirection();
                this.figure_contour.rotation.y = this.getDirection();
            }
        };
        Player.prototype.dispose = function () {
            if(this.figure) {
                this.world.scene.remove(this.figure);
                this.world.scene.remove(this.figure_contour);
            }
        };
        Player.prototype.save = function () {
            return {
                'clazz': this.playerClass.name,
                'avator': this.avator.save()
            };
        };
        Player.load = function load(json, world) {
            if(!json) {
                throw new Error();
            }
            var clazz = GameLib.AnimationClass.get(json.clazz);
            var player = new Player(clazz, world);
            player.avator = GameLib.Avator.load(json.avator);
            return player;
        };
        return Player;
    })();
    Yoyo.Player = Player;    
})(Yoyo || (Yoyo = {}));
var Yoyo;
(function (Yoyo) {
    var rangedLightShader = {
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib["shadowmap"], 
            {
                "map": {
                    type: "t",
                    value: null
                },
                "offsetRepeat": {
                    type: "v4",
                    value: new THREE.Vector4(0, 0, 1, 1)
                },
                "pointLightColor": {
                    type: "fv",
                    value: []
                },
                "pointLightPosition": {
                    type: "fv",
                    value: []
                },
                "pointLightDistance": {
                    type: "fv1",
                    value: []
                },
                "lightPosition": {
                    type: "v3",
                    value: new THREE.Vector3(0, 0, 0)
                },
                "rangedPointLights": {
                    type: "v3v",
                    value: [
                        new THREE.Vector3(0, 0, 0), 
                        new THREE.Vector3(0, 0, 0), 
                        new THREE.Vector3(0, 0, 0), 
                        new THREE.Vector3(0, 0, 0), 
                        new THREE.Vector3(0, 0, 0), 
                        new THREE.Vector3(0, 0, 0), 
                        new THREE.Vector3(0, 0, 0), 
                        new THREE.Vector3(0, 0, 0)
                    ]
                }
            }
        ]),
        vertexShader: [
            "precision highp float;", 
            "#define USE_MAP", 
            "#define USE_SHADOWMAP", 
            "#define USE_COLOR", 
            THREE.ShaderChunk["map_pars_vertex"], 
            THREE.ShaderChunk["shadowmap_pars_vertex"], 
            THREE.ShaderChunk["color_pars_vertex"], 
            "varying vec3 pixelPosition;", 
            "void main() {", 
            THREE.ShaderChunk["map_vertex"], 
            THREE.ShaderChunk["default_vertex"], 
            THREE.ShaderChunk["worldpos_vertex"], 
            THREE.ShaderChunk["shadowmap_vertex"], 
            "vColor = vec3(1.0, 1.0, 1.0);", 
            "pixelPosition = worldPosition.xyz;", 
            "}"
        ].join("\n"),
        fragmentShader: [
            "precision highp float;", 
            "#define USE_MAP", 
            "#define USE_SHADOWMAP", 
            "#define USE_COLOR", 
            THREE.ShaderChunk["map_pars_fragment"], 
            THREE.ShaderChunk["shadowmap_pars_fragment"], 
            THREE.ShaderChunk["color_pars_fragment"], 
            "varying vec3 pixelPosition;", 
            "const int maxPointLightCount = 8;", 
            "uniform vec3 rangedPointLights[maxPointLightCount];", 
            "void main() {", 
            "gl_FragColor = vec4( vec3 ( 1.0 ), 1.0 );", 
            THREE.ShaderChunk["map_fragment"], 
            THREE.ShaderChunk["shadowmap_fragment"], 
            "gl_FragColor = gl_FragColor * vec4( vColor, 1.0 );", 
            "float attenuationStart = 1.0;", 
            "float attenuationRange = 4.0;", 
            "float maxBrightness = 0.8;", 
            "float brightness = 0.0;", 
            "for(int i = 0; i < maxPointLightCount; i++){", 
            "float range = distance(pixelPosition, rangedPointLights[i]);", 
            "brightness += max(0.0, 1.0 - (range - attenuationStart) / attenuationRange);", 
            "}", 
            "gl_FragColor *= min(maxBrightness, brightness);", 
            "}"
        ].join("\n")
    };
    var World = (function () {
        function World(canvas) {
            var _this = this;
            this.players = [];
            this.avators = [];
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x000000, 1000, 20000);
            this.solid_texture = GameLib.loadTexture('entrance.png');
            this.solid_meshData = GameLib.loadJSON('komakan.js');
            this.ground_meshData = GameLib.loadJSON('ground.js');
            var LIGHT_SHADOWMAP_SIZE = Math.min(2048, canvas.getMaximumTextureSize());
            var lightPos = new THREE.Vector3(0, 16, 0);
            var LIGHT_SIZE = 20;
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position = lightPos.clone();
            directionalLight.castShadow = true;
            directionalLight.shadowDarkness = 0.4;
            directionalLight.shadowMapWidth = LIGHT_SHADOWMAP_SIZE;
            directionalLight.shadowMapHeight = LIGHT_SHADOWMAP_SIZE;
            directionalLight.shadowCameraLeft = -LIGHT_SIZE;
            directionalLight.shadowCameraRight = LIGHT_SIZE;
            directionalLight.shadowCameraTop = LIGHT_SIZE;
            directionalLight.shadowCameraBottom = -LIGHT_SIZE;
            directionalLight.shadowCameraNear = 4;
            directionalLight.shadowCameraFar = 20;
            directionalLight.shadowBias = 0.00003;
            this.scene.add(directionalLight);
            GameLib.waitComplete(function () {
                _this.wallMaterial = new THREE.ShaderMaterial({
                    uniforms: rangedLightShader.uniforms,
                    vertexShader: rangedLightShader.vertexShader,
                    fragmentShader: rangedLightShader.fragmentShader,
                    map: _this.solid_texture()
                });
                _this.groundMaterial = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    visible: false,
                    wireframe: true,
                    polygonOffset: true,
                    polygonOffsetFactor: 100,
                    polygonOffsetUnits: 100
                });
                _this.groundMaterial.polygonOffset = true;
                _this.groundMaterial.polygonOffsetFactor = 10;
                _this.groundMaterial.polygonOffsetUnits = 10;
                var loader = new THREE.JSONLoader();
                loader.onLoadStart();
                loader.createModel(_this.ground_meshData(), function (geometry) {
                    _this.ground = new THREE.Mesh(geometry, _this.groundMaterial);
                    _this.ground.castShadow = false;
                    _this.ground.receiveShadow = false;
                    _this.ground.position.y = 0.01;
                    _this.scene.add(_this.ground);
                });
                loader.createModel(_this.solid_meshData(), function (geometry) {
                    _this.solid = new THREE.Mesh(geometry, _this.wallMaterial);
                    _this.solid.castShadow = true;
                    _this.solid.receiveShadow = true;
                    _this.scene.add(_this.solid);
                });
            });
        }
        World.prototype.addPlayer = function (player) {
            this.players.push(player);
            this.avators.push(player.getAvator());
        };
        World.prototype.update = function () {
            this.players.forEach(function (p) {
                p.update();
            });
            this.wallMaterial.uniforms['map'].value = this.solid_texture();
            this.wallMaterial.uniforms['rangedPointLights'].value = [
                this.players[0].getPosition(), 
                new THREE.Vector3(0, 0, 0), 
                new THREE.Vector3(0, 0, Number.MAX_VALUE), 
                new THREE.Vector3(0, 0, Number.MAX_VALUE), 
                new THREE.Vector3(0, 0, Number.MAX_VALUE), 
                new THREE.Vector3(0, 0, Number.MAX_VALUE), 
                new THREE.Vector3(0, 0, Number.MAX_VALUE), 
                new THREE.Vector3(0, 0, Number.MAX_VALUE)
            ];
        };
        World.prototype.save = function () {
            return {
                'players': this.players.map(function (p) {
                    return p.save();
                })
            };
        };
        World.load = function load(json, canvas) {
            var world = new World(canvas);
            json.players.forEach(function (p) {
                world.players.push(Yoyo.Player.load(p, world));
            });
            return world;
        };
        return World;
    })();
    Yoyo.World = World;    
})(Yoyo || (Yoyo = {}));
var Yoyo;
(function (Yoyo) {
    Yoyo.DEFAULT_WIDTH = 800;
    Yoyo.DEFAULT_HEIGHT = 600;
})(Yoyo || (Yoyo = {}));
var GameLib;
(function (GameLib) {
    var OrbitalCamera = (function () {
        function OrbitalCamera() {
            this.MAX_PITCH = 0.7;
            this.MAX_RANGE = 8;
            this.MIN_RANGE = 3;
            this.vrp = new THREE.Vector3();
            this.yaw = 0;
            this.pitch = -0.2;
            this.range = 7;
            this.vp = null;
            this.yawing = 0;
            this.pitching = 0;
            this.zooming = 0;
            this.cameraEasing = 0.9;
            this.cameraCollisionMargin = Math.max(0, 0.1);
            var VIEW_ANGLE = 45;
            var ASPECT_RATIO = 800 / 600;
            var NEAR_CLIP = 0.01;
            var FAR_CLIP = 100;
            this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT_RATIO, NEAR_CLIP, FAR_CLIP);
        }
        OrbitalCamera.prototype.getCamera = function () {
            return this.camera;
        };
        OrbitalCamera.prototype.setAspectRatio = function (contentWidth, contentHeight) {
            this.camera.aspect = contentWidth / contentHeight;
            this.camera.updateProjectionMatrix();
        };
        OrbitalCamera.prototype.setPosition = function (position) {
            this.camera.position.copy(position);
        };
        OrbitalCamera.prototype.getPosition = function () {
            return this.camera.position.clone();
        };
        OrbitalCamera.prototype.setVRP = function (vrp) {
            this.vrp.copy(vrp);
        };
        OrbitalCamera.prototype.getVRP = function () {
            return this.vrp.clone();
        };
        OrbitalCamera.prototype.getVP = function () {
            return this.vp;
        };
        OrbitalCamera.prototype.setVP = function (vp) {
            if(!vp) {
                var eular = this.getCurrentEular();
                this.yaw = eular.yaw;
                this.pitch = eular.pitch;
                this.range = eular.range;
            }
            this.vp = vp;
        };
        OrbitalCamera.prototype.getCurrentEular = function () {
            var view = this.camera.position.clone().sub(this.vrp);
            var range = view.length();
            var yaw = Math.atan2(view.x, view.z);
            var pitch = (view.y > 0 ? -1 : 1) * Math.asin(Math.abs(view.y) / range);
            return {
                range: range,
                yaw: yaw,
                pitch: pitch
            };
        };
        OrbitalCamera.prototype.project = function (v) {
            var viewVector = this.vrp.clone().sub(this.getPosition());
            var markerVector = v.clone().sub(this.getPosition());
            if(viewVector.dot(markerVector) > 0) {
                var projector = new THREE.Projector();
                var pos = projector.projectVector(v, this.camera);
                return pos.z >= 0 ? new THREE.Vector2((0.5 + pos.x * 0.5) * this.camera.aspect, 0.5 - pos.y * 0.5) : undefined;
            } else {
                return null;
            }
        };
        OrbitalCamera.prototype.toWorldDirection = function (v) {
            var vp = this.getPosition();
            vp.sub(this.vrp);
            vp.y = 0;
            vp.normalize();
            var angle = Math.atan2(vp.x, vp.z);
            angle += Math.atan2(v.x, v.y);
            var wv = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
            wv.multiplyScalar(v.length());
            return wv;
        };
        OrbitalCamera.prototype.setViewPoint = function (yaw, pitch, range, vrp, speed, collesion) {
            if (typeof speed === "undefined") { speed = 1.0; }
            var mat = new THREE.Matrix4();
            mat.setRotationFromEuler(new THREE.Vector3(pitch, yaw, 0), "YXZ");
            var dest = new THREE.Vector3(0, 0, range).applyMatrix4(mat);
            dest.add(vrp);
            this.setViewPointFromPoint(dest, vrp, speed, collesion);
        };
        OrbitalCamera.prototype.setViewPointFromPoint = function (dest, vrp, speed, collesion) {
            if (typeof speed === "undefined") { speed = 1.0; }
            var newPos = new THREE.Vector3(this.camera.position.x + (dest.x - this.camera.position.x) * speed, this.camera.position.y + (dest.y - this.camera.position.y) * speed, this.camera.position.z + (dest.z - this.camera.position.z) * speed);
            this.camera.position = newPos;
            this.vrp.x += (vrp.x - this.vrp.x) * speed;
            this.vrp.y += (vrp.y - this.vrp.y) * speed;
            this.vrp.z += (vrp.z - this.vrp.z) * speed;
            this.camera.lookAt(this.vrp);
        };
        OrbitalCamera.prototype.addMovement = function (yawing, pitching, zooming) {
            var MAX_YAWING_SPEED = 2.6;
            this.yawing = Math.max(-MAX_YAWING_SPEED, Math.min(MAX_YAWING_SPEED, this.yawing + yawing));
            this.pitching += pitching;
            this.zooming += zooming;
            var eular = this.getCurrentEular();
            this.pitch = pitching != 0 ? (eular.pitch + pitching) : this.pitch;
            this.yaw = yawing != 0 ? (eular.yaw + yawing) : this.yaw;
            this.range = zooming != 0 ? (eular.range + zooming) : this.range;
        };
        OrbitalCamera.prototype.update = function (vrp, collesion, speed) {
            if (typeof speed === "undefined") { speed = 0.1; }
            if(!vrp) {
                throw new Error();
            }
            this.range = Math.max(this.MIN_RANGE, Math.min(this.MAX_RANGE, this.range));
            this.pitch = Math.max(-this.MAX_PITCH, Math.min(this.MAX_PITCH, this.pitch));
            if(this.vp) {
                this.setViewPointFromPoint(this.vp, vrp, speed, collesion);
            } else {
                this.setViewPoint(this.yaw, this.pitch, this.range, vrp, speed, collesion);
            }
            if(this.vp) {
            } else {
                var dir = this.camera.position.clone().sub(this.vrp);
                var rayCaster = new THREE.Raycaster(this.vrp, dir, 0, dir.length());
                var intersections = rayCaster.intersectObject(collesion);
                if(intersections.length > 0) {
                    var nearest = 0;
                    for(var i = 1; i < intersections.length; i++) {
                        if(intersections[i].distance < intersections[nearest].distance) {
                            nearest = i;
                        }
                    }
                    this.camera.position = intersections[nearest].point;
                    dir.setLength(-this.cameraCollisionMargin);
                    this.camera.position.add(dir);
                }
            }
            this.yawing *= this.cameraEasing;
            this.pitching *= this.cameraEasing;
            this.zooming *= this.cameraEasing;
        };
        OrbitalCamera.prototype.save = function () {
            return {
                'vpx': this.camera.position.x,
                'vpy': this.camera.position.y,
                'vpz': this.camera.position.z,
                'vrpx': this.vrp.x,
                'vrpy': this.vrp.y,
                'vrpz': this.vrp.z,
                'yaw': this.yaw,
                'pitch': this.pitch,
                'range': this.range,
                'yawing': this.yawing,
                'pitching': this.pitching,
                'zooming': this.zooming
            };
        };
        OrbitalCamera.load = function load(json) {
            if(json) {
                var camera = new OrbitalCamera();
                camera.camera.position.x = json.vpx;
                camera.camera.position.y = json.vpy;
                camera.camera.position.z = json.vpz;
                camera.vrp.x = json.vrpx;
                camera.vrp.y = json.vrpy;
                camera.vrp.z = json.vrpz;
                camera.yaw = json.yaw;
                camera.pitch = json.pitch;
                camera.range = json.range;
                camera.yawing = json.yawing;
                camera.pitching = json.pitching;
                camera.zooming = json.zooming;
                return camera;
            }
        };
        return OrbitalCamera;
    })();
    GameLib.OrbitalCamera = OrbitalCamera;    
})(GameLib || (GameLib = {}));
var Yoyo;
(function (Yoyo) {
    var hoge;
    var ActionGame = (function () {
        function ActionGame(canvas, world) {
            this.canvas = canvas;
            var _this = this;
            this.gamepad = new GameLib.TGamepad(0);
            this.jumpable = true;
            this.heartImage = GameLib.loadImage('heart4.png');
            this.heartZeroImage = GameLib.loadImage('heart0.png');
            this.triangleImage = GameLib.loadImage('triangle.png');
            this.ammoImage = GameLib.loadTexture('ammo.png');
            this.attensionRemain = 0;
            this.ammoCount = 0;
            this.orbitCamera = new GameLib.OrbitalCamera();
            this.world = world || new Yoyo.World(canvas);
            this.orbitCamera.setViewPoint(Math.PI / 2 - 0.4, -0.2, 4, new THREE.Vector3(0, 1, 0));
            GameLib.waitComplete(function () {
                var mat = new THREE.ParticleBasicMaterial({
                    color: 0xFFFFFF,
                    map: _this.ammoImage(),
                    size: 100,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    side: THREE.DoubleSide
                });
                var geom = new THREE.Geometry();
                for(var i = 0; i < 100; i++) {
                    geom.vertices.push(new THREE.Vector3(0, -10000000, 0));
                }
                geom.dynamic = true;
                _this.particleSystem = new THREE.ParticleSystem(geom, mat);
                _this.particleSystem.sortParticles = true;
                _this.world.scene.add(_this.particleSystem);
            });
        }
        ActionGame.prototype.isVisible = function (vrp, near) {
            if (typeof near === "undefined") { near = 0; }
            var dir = vrp.clone().sub(this.orbitCamera.camera.position);
            var rayCaster = new THREE.Raycaster(this.orbitCamera.camera.position, dir, near, dir.length());
            var intersections = rayCaster.intersectObject(this.world.ground);
            return intersections.length == 0;
        };
        ActionGame.prototype.fire = function (position, velocity) {
            var ammo = this.particleSystem.geometry.vertices[this.ammoCount];
            ammo.copy(position);
            ammo.velocity = velocity.clone();
            this.ammoCount = (this.ammoCount + 1) % this.particleSystem.geometry.vertices.length;
        };
        ActionGame.prototype.update = function () {
            this.particleSystem.geometry.dynamic = true;
            this.particleSystem.geometry.verticesNeedUpdate = true;
            this.particleSystem.geometry.elementsNeedUpdate = true;
            this.particleSystem.geometry.normalsNeedUpdate = true;
            this.particleSystem.geometry.buffersNeedUpdate = true;
            this.particleSystem.geometry.tangentsNeedUpdate = true;
            this.particleSystem.geometry.uvsNeedUpdate = true;
            var arrowKey = GameLib.getArrow();
            var leftStick = this.gamepad.getLeftStick();
            var rightStick = this.gamepad.getRightStick();
            if(this.player) {
                var walkVector = new THREE.Vector3(leftStick.x, leftStick.y, 0);
                if(GameLib.isKeyDown(GameLib.Keys.Ctrl)) {
                    this.player.walk(null);
                } else if(walkVector.length() > 0) {
                    this.player.walk(this.orbitCamera.toWorldDirection(walkVector));
                } else {
                    this.player.walk(null);
                }
                if(this.gamepad.getButton(0) == 1) {
                    this.player.zap();
                }
                if(this.jumpable && this.gamepad.getButton(1) == 1) {
                    this.player.jump(0.16);
                }
                if(this.player && GameLib.getKey(GameLib.Keys.F) == 1) {
                    if(this.player.target) {
                        this.player.target = null;
                    } else {
                        var candidate = this.getObservationCandidate();
                        if(candidate) {
                            this.player.target = candidate;
                        }
                    }
                }
                if(GameLib.getKey(GameLib.Keys.S) % 10 == 1) {
                    var veloc = this.player.target ? this.player.target.getPosition().clone().sub(this.player.getPosition()) : this.player.getDirectionVector();
                    veloc.setLength(0.4);
                    this.fire(this.player.getCenterPosition(), veloc);
                }
                if(this.gamepad.getButton(5) >= 1) {
                    this.orbitCamera.yaw = this.player.getDirection() + Math.PI;
                }
                if(this.player.target) {
                    var vrp = this.player.target.getPosition();
                    if(this.isVisible(vrp, 5)) {
                        this.attensionRemain = 30;
                    } else {
                        this.attensionRemain--;
                    }
                    if(this.attensionRemain >= 0) {
                        var vp = new THREE.Vector3(this.player.getPosition().x, this.player.getPosition().y + 0.5, this.player.getPosition().z);
                        var dir = vrp.clone().sub(vp).normalize();
                        vp.sub(dir.clone().setLength(3));
                        vp.add(dir.clone().cross(new THREE.Vector3(0, 1, 0)).setLength(1));
                        this.orbitCamera.update(vrp, this.world.ground, 0.4);
                        this.orbitCamera.setVP(vp);
                    } else {
                        this.player.target = null;
                        this.orbitCamera.setVP(null);
                    }
                } else {
                    var vrp = new THREE.Vector3(this.player.getPosition().x, this.player.getPosition().y + 1.0, this.player.getPosition().z);
                    this.orbitCamera.addMovement((rightStick.x + (GameLib.isKeyDown(GameLib.Keys.Ctrl) ? arrowKey.x : 0)) * -0.4, (rightStick.y + (GameLib.isKeyDown(GameLib.Keys.Ctrl) ? arrowKey.y : 0)) * -0.2, (GameLib.isKeyDown(GameLib.Keys.Ctrl) ? arrowKey.z : 0) * 1.0);
                    this.orbitCamera.update(vrp, this.world.ground);
                }
            }
            if(this.player) {
                if(GameLib.getKey(GameLib.Keys.W) == 1) {
                    this.player.setPosition(new THREE.Vector3(0, 1, 0));
                }
            }
            if(GameLib.getKey(GameLib.Keys.E) == 1) {
                this.player.walk(new THREE.Vector3(0, 0, 0));
                this.player = this.world.players[(this.world.players.indexOf(this.player) + 1) % this.world.players.length];
            }
            if(window.localStorage && GameLib.getKey(GameLib.Keys.Q) == 1) {
                window.localStorage.clear();
            }
            if(GameLib.getKey(GameLib.Keys.C) == 1) {
                this.world.groundMaterial.visible = !this.world.groundMaterial.visible;
                this.world.groundMaterial.needsUpdate = true;
            }
            this.particleSystem.geometry.vertices.forEach(function (v) {
                if(v.velocity) {
                    v.add(v.velocity);
                }
            });
            this.world.update();
        };
        ActionGame.prototype.getObservationCandidate = function () {
            var result;
            var range = Number.MAX_VALUE;
            for(var i = 0; i < this.world.players.length; i++) {
                var target = this.world.players[i];
                if(target !== this.player && this.isVisible(target.getCenterPosition())) {
                    var screenPos = this.orbitCamera.project(target.getCenterPosition());
                    if(screenPos && screenPos.x > 0 && screenPos.x < this.canvas.getAspectRatio() && screenPos.y > 0 && screenPos.y < 1) {
                        var r = Math.pow(screenPos.x - this.canvas.getAspectRatio() * 0.5, 2) + Math.pow(screenPos.y - 0.5, 2);
                        if(r < range) {
                            result = target;
                            range = r;
                        }
                    }
                }
            }
            return result;
        };
        ActionGame.prototype.updateWindowSize = function () {
            this.orbitCamera.setAspectRatio(this.canvas.contentWidth, this.canvas.contentHeight);
        };
        ActionGame.prototype.render = function () {
            var _this = this;
            this.canvas.renderer.render(this.world.scene, this.orbitCamera.getCamera());
            if(this.player) {
                var drawHart = function (i) {
                    var HEART_SIZE = 0.04;
                    var FREQ = 60;
                    var s = (i !== _this.player.life - 1 ? 1 : 1.2 + 0.2 * Math.sin(Math.PI * 2 * (GameLib.getTotalFrames() % FREQ) / FREQ));
                    var w = HEART_SIZE * s;
                    _this.canvas.drawImage(i < _this.player.life ? _this.heartImage() : _this.heartZeroImage(), 0.04 + (HEART_SIZE * i) - w * 0.5, 0.04 - w * 0.5, w, w);
                };
                for(var i = this.player.maxLife - 1; i >= 0; i--) {
                    drawHart(i);
                }
                drawHart(this.player.life - 1);
            }
            if(this.player) {
                var composite_save = this.canvas.graphics.globalCompositeOperation;
                this.canvas.graphics.globalCompositeOperation = "lighter";
                if(this.player.target) {
                    var p = this.orbitCamera.project(this.player.target.getCenterPosition());
                    if(p) {
                        var markerRadius = 0.1;
                        var markerSize = 0.03;
                        var markerCount = 4;
                        var markerCycle = 200;
                        this.canvas.translate(p.x, p.y, function () {
                            for(var i = 0; i < markerCount; i++) {
                                _this.canvas.rotate(Math.PI * 2 * i / markerCount + (GameLib.getTotalFrames() % markerCycle / markerCycle) * Math.PI * 2, function () {
                                    _this.canvas.translate(-markerSize * 0.5, -markerRadius, function () {
                                        _this.canvas.drawImage(_this.triangleImage(), 0, 0, markerSize, markerSize);
                                    });
                                });
                            }
                        });
                    }
                } else {
                    var candidate = this.getObservationCandidate();
                    if(candidate) {
                        var markerSize = 0.04;
                        var screenPos = this.orbitCamera.project(candidate.getCenterPosition());
                        if(screenPos) {
                            this.canvas.drawImage(this.triangleImage(), screenPos.x - markerSize * 0.5, screenPos.y - markerSize + 0.02 * Math.sin(GameLib.getTotalFrames() * 0.3), markerSize, markerSize);
                        }
                    }
                }
                this.canvas.graphics.globalCompositeOperation = composite_save;
            }
        };
        ActionGame.prototype.save = function () {
            return {
                'world': this.world.save(),
                'index': this.world.players.indexOf(this.player),
                'camera': this.orbitCamera.save()
            };
        };
        ActionGame.load = function load(json, canvas) {
            var world = Yoyo.World.load(json.world, canvas);
            var game = new ActionGame(canvas, world);
            game.player = world.players[json.index];
            game.orbitCamera = GameLib.OrbitalCamera.load(json.camera);
            return game;
        };
        return ActionGame;
    })();
    Yoyo.ActionGame = ActionGame;    
})(Yoyo || (Yoyo = {}));
var GameLib;
(function (GameLib) {
    var DEFAULT_WIDTH = 800;
    var DEFAULT_HEIGHT = 600;
    var GameCanvas = (function () {
        function GameCanvas() {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            this.canvas = $('<canvas />');
            this.canvas.attr('width', DEFAULT_WIDTH);
            this.canvas.attr('height', DEFAULT_HEIGHT);
            this.canvas.css('width', DEFAULT_WIDTH);
            this.canvas.css('height', DEFAULT_HEIGHT);
            this.canvas.css('position', 'absolute');
            this.canvas.css('top', '0px');
            this.canvas.css('left', '0px');
            this.canvas.css('background-color', 'transparent');
            this.graphics = (this.canvas[0]).getContext('2d');
            this.graphics.textBaseline = 'top';
            this.renderer.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
            $('body').append(this.renderer.domElement);
            $('body').append(this.canvas);
            $('body').css('overflow', 'hidden');
            $('body').css('background-color', 'black');
            $('body').css('width', '100%');
            $('body').css('height', '100%');
        }
        GameCanvas.prototype.getMaximumTextureSize = function () {
            var gl = this.renderer.context;
            return gl.getParameter(gl.MAX_TEXTURE_SIZE);
        };
        GameCanvas.prototype.getAspectRatio = function () {
            return this.contentWidth / this.contentHeight;
        };
        GameCanvas.prototype.updateWindowSize = function () {
            var MAX_ASPECT_RATIO = 16 / 9;
            var MIN_ASPECT_RATIO = 4 / 3;
            var windowAspectRatio = window.innerWidth / window.innerHeight;
            if(windowAspectRatio < MIN_ASPECT_RATIO) {
                this.contentWidth = window.innerWidth;
                this.contentHeight = window.innerWidth / MIN_ASPECT_RATIO;
            } else if(windowAspectRatio > MAX_ASPECT_RATIO) {
                this.contentWidth = window.innerHeight * MAX_ASPECT_RATIO;
                this.contentHeight = window.innerHeight;
            } else {
                this.contentWidth = window.innerWidth;
                this.contentHeight = window.innerHeight;
            }
            var contentX = (window.innerWidth - this.contentWidth) * 0.5 + "px";
            var contentY = (window.innerHeight - this.contentHeight) * 0.5 + "px";
            this.renderer.setSize(this.contentWidth, this.contentHeight);
            $(this.renderer.domElement).css("position", "absolute");
            $(this.renderer.domElement).css("left", contentX);
            $(this.renderer.domElement).css("top", contentY);
            this.canvas.attr('width', this.contentWidth);
            this.canvas.attr('height', this.contentHeight);
            this.canvas.css("left", contentX);
            this.canvas.css("top", contentY);
            this.canvas.css("width", this.contentWidth + 'px');
            this.canvas.css("height", this.contentHeight + 'px');
            this.graphics.font = 'normal normal ' + Math.floor(32 * this.contentHeight / DEFAULT_HEIGHT) + 'px/2 "MS Gothic", "Meiryo", monospace';
        };
        GameCanvas.prototype.clearHUD = function () {
            this.graphics.clearRect(0, 0, window.innerWidth, window.innerHeight);
        };
        GameCanvas.prototype.fillText = function (text, x, y, color, shadow) {
            if (typeof color === "undefined") { color = "white"; }
            if (typeof shadow === "undefined") { shadow = "rgba(0, 0, 0, 0.5)"; }
            var scale = this.contentHeight;
            this.graphics.textBaseline = 'top';
            if(shadow) {
                this.graphics.fillStyle = shadow;
                this.graphics.fillText(text, x * scale + 1, y * scale + 1);
            }
            this.graphics.fillStyle = color;
            this.graphics.fillText(text, x * scale, y * scale);
        };
        GameCanvas.prototype.fill = function (color) {
            this.graphics.fillStyle = color;
            this.graphics.fillRect(0, 0, window.innerWidth + 2, window.innerHeight + 2);
        };
        GameCanvas.prototype.drawImage = function (img, dx, dy, dw, dh, sx, sy, sw, sh) {
            if (typeof sx === "undefined") { sx = 0; }
            if (typeof sy === "undefined") { sy = 0; }
            if(sw === undefined) {
                sw = img.width;
            }
            if(sh === undefined) {
                sh = img.height;
            }
            var s = this.contentHeight;
            this.graphics.drawImage(img, sx, sy, sw, sh, dx * s, dy * s, dw * s, dh * s);
        };
        GameCanvas.prototype.rotate = function (r, action) {
            this.graphics.save();
            this.graphics.rotate(r);
            action();
            this.graphics.restore();
        };
        GameCanvas.prototype.translate = function (x, y, action) {
            var s = this.contentHeight;
            this.graphics.save();
            this.graphics.translate(x * s, y * s);
            action();
            this.graphics.restore();
        };
        GameCanvas.prototype.measureText = function (text) {
            return this.graphics.measureText(text).width / this.contentHeight;
        };
        GameCanvas.prototype.run = function (update) {
            var _this = this;
            update();
            requestAnimationFrame(function () {
                _this.run(update);
            });
        };
        return GameCanvas;
    })();
    GameLib.GameCanvas = GameCanvas;    
})(GameLib || (GameLib = {}));
var GameLib;
(function (GameLib) {
    var XORShift = (function () {
        function XORShift(x, y, z, w) {
            if (typeof x === "undefined") { x = 123456789; }
            if (typeof y === "undefined") { y = 362436069; }
            if (typeof z === "undefined") { z = 521288629; }
            if (typeof w === "undefined") { w = 88675123; }
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            this.x = 123456789;
            this.y = 362436069;
            this.z = 521288629;
            this.w = 88675123;
        }
        XORShift.prototype.next = function () {
            var t = this.x ^ (this.x << 11);
            this.x = this.y;
            this.y = this.z;
            this.z = this.w;
            return this.w = (this.w ^ (this.w >> 19)) ^ (t ^ (t >> 8));
        };
        return XORShift;
    })();
    GameLib.XORShift = XORShift;    
    var SEED_SIZE = 4;
    function twist(text) {
        var seeds = [];
        var seedStr = [];
        for(var k = 0; k < 4; k++) {
            seeds[k] = 0;
            for(var i = 0; i < SEED_SIZE; i++) {
                var n = Math.floor(94 * Math.random());
                seeds[k] += n << (i * 6);
                seedStr.push(String.fromCharCode(32 + n));
            }
        }
        var ran = new XORShift(seeds[0], seeds[1], seeds[2], seeds[3]);
        text = encodeURIComponent(text + "[[CORRECT]]");
        var out = [];
        var v = 0;
        for(var i = 0; i < text.length; i++) {
            var n = text.charCodeAt(i) - 32;
            var r = ran.next() % 94;
            var c = ((n + r + v) % 94);
            var v = n;
            out.push(String.fromCharCode(32 + c));
        }
        return seedStr.join('') + out.join('');
    }
    GameLib.twist = twist;
    function untwist(text) {
        var seeds = [];
        for(var k = 0; k < 4; k++) {
            seeds[k] = 0;
            for(var i = 0; i < SEED_SIZE; i++) {
                seeds[k] += (text.charCodeAt(SEED_SIZE * k + i) - 32) << (i * 6);
            }
        }
        var ran = new XORShift(seeds[0], seeds[1], seeds[2], seeds[3]);
        text = text.slice(4 * SEED_SIZE);
        var out = [];
        var v = 0;
        for(var i = 0; i < text.length; i++) {
            var n = text.charCodeAt(i) - 32;
            var r = ran.next() % 94;
            v = ((n - r + 94 + 94 - v) % 94);
            out.push(String.fromCharCode(32 + v));
        }
        var result = decodeURIComponent(out.join(''));
        if(result.indexOf("[[CORRECT]]") == (result.length - "[[CORRECT]]".length)) {
            return result.slice(0, result.length - ("[[CORRECT]]".length));
        } else {
            throw new Error();
        }
    }
    GameLib.untwist = untwist;
})(GameLib || (GameLib = {}));
var Yoyo;
(function (Yoyo) {
    $(function () {
        var canvas = new GameLib.GameCanvas();
        var renderer = canvas.renderer;
        renderer.shadowMapCullFace = THREE.CullFaceFront;
        renderer.setFaceCulling("back");
        renderer.setClearColor(new THREE.Color(0x101020), 1.0);
        renderer.shadowMapEnabled = true;
        var game;
        function save() {
            if(window.localStorage) {
                window.localStorage["dat"] = GameLib.twist(JSON.stringify({
                    'game': game.save(),
                    'window_width': window.outerWidth,
                    'window_height': window.outerHeight
                }));
            }
        }
        function load() {
            if(window.localStorage && window.localStorage['dat']) {
                try  {
                    var json = JSON.parse(GameLib.untwist(window.localStorage['dat']));
                    var newGame = Yoyo.ActionGame.load(json.game, canvas);
                    GameLib.waitComplete(function () {
                        game = newGame;
                        window.resizeTo(json.window_width ? parseFloat(json.window_width) : 800, json.window_height ? parseFloat(json.window_height) : 600);
                        updateWindowSize();
                    });
                    return true;
                } catch (ex) {
                    console.log("データのロード中にエラーが発生しました。");
                    return false;
                }
            }
        }
        function updateWindowSize() {
            canvas.updateWindowSize();
            game.updateWindowSize();
            Yoyo.updateContourWidth(canvas.contentHeight);
        }
        window.addEventListener('resize', updateWindowSize, false);
        window.addEventListener('contextmenu', function (e) {
        }, false);
        window.addEventListener("keydown", function (e) {
        }, false);
        window.addEventListener('unload', function () {
            delete window.localStorage["dat"];
        }, false);
        if(window.localStorage && window.localStorage['dat'] && load()) {
        } else {
            game = new Yoyo.ActionGame(canvas);
            var youmu = GameLib.AnimationClass.get('youmu');
            game.player = new Yoyo.Player(youmu, game.world);
            game.world.addPlayer(game.player);
            var enemy = new Yoyo.Player(youmu, game.world);
            enemy.setFootPosition(new THREE.Vector3(3, 1, 0));
            game.world.addPlayer(enemy);
            var enemy2 = new Yoyo.Player(youmu, game.world);
            enemy2.setFootPosition(new THREE.Vector3(-3, 1, 0));
            game.world.addPlayer(enemy2);
        }
        GameLib.waitComplete(function () {
            $('title').text('東方紅月戯画　Touhou Kougetsu Giga');
            window.resizeTo(Yoyo.DEFAULT_WIDTH, Yoyo.DEFAULT_HEIGHT);
            updateWindowSize();
            canvas.run(function () {
                canvas.clearHUD();
                if((!document.hasFocus) || document.hasFocus()) {
                    THREE.AnimationHandler.update(1 / 60);
                    game.update();
                    game.render();
                } else {
                    var fontSize = 24;
                    var font = "normal normal normal " + fontSize + "px Segoe UI, Verdana, Arial";
                    var text = "Pause";
                    canvas.fill('rgba(0, 0, 0, 0.6)');
                    canvas.fillText(text, (canvas.getAspectRatio() - canvas.measureText(text)) * 0.5, (1 - fontSize / canvas.contentHeight) * 0.5);
                }
            });
        });
    });
})(Yoyo || (Yoyo = {}));
