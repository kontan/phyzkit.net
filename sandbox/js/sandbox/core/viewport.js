"use strict";

// class Viewer
//
//      Box2D world renderer. It provides simple rendering framework.
//      You can do your custom rendering for Box2D world.      
//      
SANDBOX.createViewport = function(canvas, viewport){          
    var MAX_SCALE = 10000;
    var MIN_SCALE = 1;
      
    // void forEachBody(Function<b2Body, object> callback)
    //      Iterate bodies of b2World
    function forEachBody(world, callback){
        var body, userData;
        for(body = world.GetBodyList(); body; body = body.GetNext()){
            userData = body.GetUserData();
            callback(body, userData);
        }
    }
    
    var dom = canvas.get(0),
        vrpOnDragStart,
        dragStartPosition,
        self,
        mouseDownPosition,
        mousePosition,
        graphics = canvas.get(0).getContext("2d");
    
    self = Object.seal(Object.create(null, {
        canvas: { value: canvas},
        
        background: { writable: true, value: SANDBOX.createGridBackground() },
        
        foreground: { writable: true, value: undefined },
                
        mouseDraggable: { writable: true, value: true },
        
        // Camera camera
        //      Current cameta state.
        camera: { writable: true, value: SANDBOX.Camera.create() },
        
        // Camera cameraEasing
        //      Destination of Camera moving.
        cameraEasing: { writable: true, value: SANDBOX.Camera.create() },
        
        // void point(b2Vec2 p)
        //      Set view reference point without easing.
        point: { value: function(p){
            self.camera = self.camera.setPoint(p);
            self.cameraEasing = self.camera;
        }},
        
        // void pointEasing(b2Vec2 p)
        //      Set view reference point with easing.
        pointEasing: { value: function(p){
            self.cameraEasing = self.cameraEasing.setPoint(p);
        }},
        
        // void scale(number s)
        //      Set scale without easing.
        scale: { value: function(delta){
            self.camera       = self.camera.setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, self.camera.scale * Math.pow(2, delta))));
            self.cameraEasing = self.camera;
        }},
        
        // void scaleEasing(number s)
        //      Set scale with easing.
        scaleEasing: { value: function(delta){
            self.cameraEasing = self.cameraEasing.setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, self.cameraEasing.scale * Math.pow(2, delta))));
        }},
        
        // b2Vec2 toWorldCoords(b2Vec2 point)
        //      Convert the point in screen coordinates to a point in physical world coordinates. 
        toWorldCoords: { value: function(pointInScreenCoords){
            return new b2Vec2(
                (pointInScreenCoords.x - dom.width  / 2) / self.camera.scale + self.camera.point.x,
                (pointInScreenCoords.y - dom.height / 2) / (-self.camera.scale) + self.camera.point.y                            
            );
        }},
        
        toScreenCoords: { value: function(pointInWorld){
            return new b2Vec2(
                (pointInWorld.x - self.camera.point.x) * self.camera.scale + dom.width   / 2,
                (pointInWorld.y - self.camera.point.y) * (-self.camera.scale) + dom.height  / 2                            
            );
        }},
        
  
        
        // void update()
        //      update this viewport.
        //      mouseDownPosition will be cleared. Get mouseDownPosition before updating viewport on the frame. 
        update: {value: function(){
        
            // Process scale easing
            self.camera = self.camera.interpolate(0.2, self.cameraEasing);
            
            mouseDownPosition = undefined;
        }},
        

        
        // void paint()
        //      paint all physical bodies in the world.
        //      In default, all bodies are not painted. To override this behavior, set a object has property "paint" to userData of a body.
        //      paint must be function take one argument of Graphics2D context of Canvas.
        //      The graphics context is translated as the body's coodinate.
        paint: { value: function(world){
            var canvas = self.canvas.get(0), pos;
            
            if(self.background){
                graphics.save();
                self.background(graphics, self);
                graphics.restore();
            }
            
            var canvas = self.canvas.get(0);
            graphics.save();
            graphics.translate(canvas.width / 2, canvas.height / 2);
            graphics.scale(self.camera.scale, -self.camera.scale);
            graphics.translate(-self.camera.point.x, -self.camera.point.y);
            forEachBody(world, function(body, userData){
                var pos = body.GetPosition();
                graphics.save();
                graphics.translate(pos.x, pos.y);
                graphics.rotate(body.GetAngle());
                
                var paintTargetList = [];
                
                if(userData && userData.paint){
                    // body の UserData に paint があればそれを優先。 
                    paintTargetList.push({ func: userData.paint, order: userData.zOrder, args: [graphics, body]}); 
                }else{
                    // そうでなければ各 fixture の userdata の paint を探す 
                    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
                        var fixtureUserData = fixture.GetUserData();
                        if(fixtureUserData && fixtureUserData.paint){
                            paintTargetList.push({ func: fixtureUserData.paint, order: fixtureUserData.zOrder, args: [graphics, fixture]});
                        }
                    }
                }
                
                paintTargetList.sort(function(a, b){
                    return (a.zOrder && b.zOrder) ? a.zOrder - b.zOrder : (a.zOrder ? 1 : b.zOrder); 
                });
                
                paintTargetList.forEach(function(target){
                    graphics.save();
                    target.func.apply(window, target.args);
                    graphics.restore();
                });
                
                graphics.restore();
            });
            
            graphics.restore();
            
            for(var joint = world.GetJointList(); joint; joint = joint.GetNext()){
                var userData = joint.GetUserData();
                if(userData && userData.paintScreen){
                    graphics.save();
                    userData.paintScreen(graphics, self);
                    graphics.restore();
                }
            }            
            
            if(self.foreground){
                graphics.save();
                self.foreground(graphics, self);
                graphics.restore();
            }
            
        }},
        
        paintBodyState: { value: function(body, fixtures, aabbcolor){
            if( ! body){
                throw new TypeError();
            }
            
            if( ! aabbcolor){
                aabbcolor = "rgba(0, 127, 127, 0.6)";
            }
            
            var bl = +Number.MAX_VALUE;
            var br = -Number.MAX_VALUE;
            var bt = +Number.MAX_VALUE;
            var bb = -Number.MAX_VALUE;
    

            
            // Body AABB ////////////////////////////////////////////////////////////////
            // TODO: static な body は変形しないことが前提なのか、頂点を移動しても AABB が更新されない。
            for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext()){
                var aabb = fixtureList.GetAABB();
                var lb = self.toScreenCoords(aabb.lowerBound);
                var ub = self.toScreenCoords(aabb.upperBound);
                bl = Math.min(bl, aabb.lowerBound.x);
                br = Math.max(br, aabb.upperBound.x);
                bt = Math.min(bt, aabb.lowerBound.y);
                bb = Math.max(bb, aabb.upperBound.y);
            }
            if(
                bl !== +Number.MAX_VALUE && 
                br !== -Number.MAX_VALUE && 
                bt !== +Number.MAX_VALUE &&
                bb !== -Number.MAX_VALUE
            ){
                var body_lb = self.toScreenCoords(new b2Vec2(bl, bt));
                var body_ub = self.toScreenCoords(new b2Vec2(br, bb));
                graphics.lineWidth = 4;
                graphics.strokeStyle = aabbcolor;
                graphics.strokeRect(body_lb.x - 2, body_lb.y - 2, body_ub.x - body_lb.x + 4, body_ub.y - body_lb.y + 4);   
            }
            
            // Fixture AABB //////////////////////////////////////////////////////
            if(fixtures){
                //for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext()){
                fixtures.forEach(function(fixture){
                    //var aabb = fixtureList.GetAABB();
                    var aabb = fixture.GetAABB();
                    var lb = self.toScreenCoords(aabb.lowerBound);
                    var ub = self.toScreenCoords(aabb.upperBound);
                    graphics.beginPath();
                    graphics.moveTo(lb.x, lb.y);
                    graphics.lineTo(ub.x, lb.y);
                    graphics.lineTo(ub.x, ub.y);
                    graphics.lineTo(lb.x, ub.y);
                    graphics.closePath();
                    graphics.lineWidth = 4;
                    graphics.strokeStyle = "rgba(255, 0, 0, 0.6)";
                    graphics.stroke();   
                });
            }
            
            // Linear Velocity ////////////////////////////////////////////
            var position = self.toScreenCoords(body.GetPosition());
            var velocity = body.GetLinearVelocity().Copy();
            velocity.Multiply(self.camera.scale * 0.1);
            graphics.beginPath();
            graphics.moveTo(position.x, position.y);
            graphics.lineTo(position.x + velocity.x, position.y - velocity.y);
            graphics.strokeStyle = "rgba(0, 255, 0, 0.6)";
            graphics.stroke();
            
            // Angular Velocity //////////////////////////////////////////
            var angularVelocity = body.GetAngularVelocity();
            graphics.beginPath();
            graphics.moveTo(position.x, position.y);
            for(var i = 0; i < Math.abs(angularVelocity) * 10; i++){
                var a = angularVelocity > 0 ? i : -i;
                var r = 0.2;
                var s = 0.2;
                var x = position.x + r * i * Math.cos(a * s);
                var y = position.y + r * i * Math.sin(a * s);
                graphics.lineTo(x, y);
            }
            graphics.strokeStyle = "rgba(0, 0, 255, 0.6)";
            graphics.stroke();
            
            // Center of Mass ///////////////////////////
            var com = self.toScreenCoords(body.GetWorldPoint(body.GetLocalCenter()));
            graphics.beginPath();
            graphics.moveTo(com.x - 6, com.y - 6);
            graphics.lineTo(com.x + 6, com.y + 6);
            graphics.moveTo(com.x + 6, com.y - 6);
            graphics.lineTo(com.x - 6, com.y + 6);
            graphics.lineWidth = 4;
            graphics.strokeStyle = "rgba(64, 120, 0, 0.8)";
            graphics.stroke();
        }}
    }));
    
    // initialize event listeners
    canvas.mousemove(function(e){
        if(self.mouseDraggable){
            mousePosition = SANDBOX.pointFromEvent(e);
            if(dragStartPosition && vrpOnDragStart){
                self.point(new b2Vec2(
                    (vrpOnDragStart.x - (mousePosition.x - dragStartPosition.x) / self.camera.scale),
                    (vrpOnDragStart.y - (mousePosition.y - dragStartPosition.y) / -self.camera.scale)
                ));
                e.preventDefault();
            }
        }
    });
    canvas.mouseout(function(e){
        mousePosition     = undefined;
        mouseDownPosition = undefined;
    });
    canvas.mousedown(function(e){
        if(self.mouseDraggable && (e.button == 2)){
            dragStartPosition = mouseDownPosition = SANDBOX.pointFromEvent(e);
            vrpOnDragStart = self.camera.point.Copy();
        }
    });
    canvas.mouseup(function(e){
        dragStartPosition = mouseDownPosition = undefined;
        vrpOnDragStart = undefined;
    });
    
    // set up scaling by mouse wheel. 
    function processWheel(e){
        if(self.mouseDraggable){
            var p = SANDBOX.pointFromEvent(e);
            self.scaleEasing(e.detail ? e.detail * -0.1 : e.wheelDelta ? e.wheelDelta * 0.001 : 0);
            e.preventDefault();
        }
    }
    canvas.get(0).addEventListener("DOMMouseScroll", processWheel);
    canvas.get(0).addEventListener("mousewheel", processWheel);
        

    return self;
};