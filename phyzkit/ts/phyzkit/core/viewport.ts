/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    // void forEachBody(Function<b2Body, object> callback)
    //      Iterate bodies of b2World
    function forEachBody(world:D.b2World, callback:(body:Box2D.Dynamics.b2Body, userData:any)=>void):void{
        var body, userData;
        for(body = world.GetBodyList(); body; body = body.GetNext()){
            userData = body.GetUserData();
            callback(body, userData);
        }
    }

    // class Viewer
    //
    //      Box2D world renderer. It provides simple rendering framework.
    //      You can do your custom rendering for Box2D world.      
    //     
    export class Viewport{
        static MAX_SCALE = 10000;
        static MIN_SCALE = 1;

        background:any = createGridBackground();
        
        foreground:any = undefined;
                
        mouseDraggable:bool = true;
        
        // Camera camera
        //      Current cameta state.
        camera:Camera = new Camera(100);
        
        // Camera cameraEasing
        //      Destination of Camera moving.
        cameraEasing:Camera = new Camera(100);

        graphics:CanvasRenderingContext2D;

        private mouseDownPosition:M.b2Vec2;
        private dragStartPosition:M.b2Vec2;
        private mousePosition:M.b2Vec2;
        private vrpOnDragStart:M.b2Vec2;
        private dom:HTMLCanvasElement;

        constructor(private _canvas:JQuery, viewport?:Viewport){          
            
              
            this.dom = <HTMLCanvasElement>this.canvas.get(0);  
            this.graphics = this.dom.getContext("2d");

            // initialize event listeners
            this.canvas.mousemove((e)=>{
                if(this.mouseDraggable){
                    this.mousePosition = pointFromEvent(e);
                    if(this.dragStartPosition && this.vrpOnDragStart){
                        this.point(new M.b2Vec2(
                            (this.vrpOnDragStart.x - (this.mousePosition.x - this.dragStartPosition.x) /  this.camera.scale),
                            (this.vrpOnDragStart.y - (this.mousePosition.y - this.dragStartPosition.y) / -this.camera.scale)
                        ));
                        e.preventDefault();
                    }
                }
            });
            this.canvas.mouseout((e)=>{
                this.mousePosition     = undefined;
                this.mouseDownPosition = undefined;
            });
            this.canvas.mousedown((e)=>{
                var button = (<any>e).button;
                if(this.mouseDraggable && (button == 2)){
                    this.dragStartPosition = this.mouseDownPosition = pointFromEvent(e);
                    this.vrpOnDragStart = this.camera.point.Copy();
                }
            });
            this.canvas.mouseup((e)=>{
                this.dragStartPosition = this.mouseDownPosition = undefined;
                this.vrpOnDragStart = undefined;
            });
            
            // set up scaling by mouse wheel. 
            var processWheel = (e)=>{
                if(this.mouseDraggable){
                    var p = pointFromEvent(e);
                    this.scaleEasing(e.detail ? e.detail * -0.1 : e.wheelDelta ? e.wheelDelta * 0.001 : 0);
                    e.preventDefault();
                }
            };
            this.canvas.get(0).addEventListener("DOMMouseScroll", processWheel);
            this.canvas.get(0).addEventListener("mousewheel", processWheel);
        }


        
        
        get canvas():JQuery{
            return this._canvas;
        }
        

        
        // void point(b2Vec2 p)
        //      Set view reference point without easing.
        point(p:Box2D.Common.Math.b2Vec2):void{
            this.camera = this.camera.setPoint(p);
            this.cameraEasing = this.camera;
        }
        
        // void pointEasing(b2Vec2 p)
        //      Set view reference point with easing.
        pointEasing(p:Box2D.Common.Math.b2Vec2):void{
            this.cameraEasing = this.cameraEasing.setPoint(p);
        }
        
        // void scale(number s)
        //      Set scale without easing.
        scale(delta:number):void{
            this.camera       = this.camera.setScale(Math.max(Viewport.MIN_SCALE, Math.min(Viewport.MAX_SCALE, this.camera.scale * Math.pow(2, delta))));
            this.cameraEasing = this.camera;
        }
        
        // void scaleEasing(number s)
        //      Set scale with easing.
        scaleEasing(delta:number):void{
            this.cameraEasing = this.cameraEasing.setScale(Math.max(Viewport.MIN_SCALE, Math.min(Viewport.MAX_SCALE, this.cameraEasing.scale * Math.pow(2, delta))));
        }
        
        // b2Vec2 toWorldCoords(b2Vec2 point)
        //      Convert the point in screen coordinates to a point in physical world coordinates. 
        toWorldCoords(pointInScreenCoords:M.b2Vec2):M.b2Vec2{
            return new M.b2Vec2(
                (pointInScreenCoords.x - this.dom.width  / 2) /   this.camera.scale  + this.camera.point.x,
                (pointInScreenCoords.y - this.dom.height / 2) / (-this.camera.scale) + this.camera.point.y                            
            );
        }
        
        toScreenCoords(pointInWorld:M.b2Vec2):M.b2Vec2{
            return new M.b2Vec2(
                (pointInWorld.x - this.camera.point.x) *   this.camera.scale  + this.dom.width   / 2,
                (pointInWorld.y - this.camera.point.y) * (-this.camera.scale) + this.dom.height  / 2                            
            );
        }
        
  
        
        // void update()
        //      update this viewport.
        //      mouseDownPosition will be cleared. Get mouseDownPosition before updating viewport on the frame. 
        update():void{
        
            // Process scale easing
            this.camera = this.camera.interpolate(0.2, this.cameraEasing);
            
            this.mouseDownPosition = undefined;
        }
        

        
        // void paint()
        //      paint all physical bodies in the world.
        //      In default, all bodies are not painted. To override this behavior, set a object has property "paint" to userData of a body.
        //      paint must be function take one argument of Graphics2D context of Canvas.
        //      The graphics context is translated as the body's coodinate.
        paint(world:Box2D.Dynamics.b2World):void{
            var canvas = this.canvas.get(0), pos;
            
            if(this.background){
                this.graphics.save();
                this.background.paint(this.graphics, this);
                this.graphics.restore();
            }
            
            var canvas = this.canvas.get(0);
            this.graphics.save();
            this.graphics.translate(canvas.width / 2, canvas.height / 2);
            this.graphics.scale(this.camera.scale, -this.camera.scale);
            this.graphics.translate(-this.camera.point.x, -this.camera.point.y);
            forEachBody(world, (body:Box2D.Dynamics.b2Body, userData:any)=>{
                var pos = body.GetPosition();
                this.graphics.save();
                this.graphics.translate(pos.x, pos.y);
                this.graphics.rotate(body.GetAngle());
                
                var paintTargetList:any[] = [];
                
                if(userData && userData.paint){
                    // body の UserData に paint があればそれを優先。 
                    
                    //paintTargetList.push({ func: userData.paint, order: userData.zOrder, args: <any[]>[this.graphics, body]}); 

                    this.graphics.save();
                    userData.paint(this.graphics, body);
                    this.graphics.restore();
                }else{
                    // そうでなければ各 fixture の userdata の paint を探す 
                    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
                        var fixtureUserData = fixture.GetUserData();
                        if(fixtureUserData && fixtureUserData.paint){
                            paintTargetList.push({ func: fixtureUserData.paint, order: fixtureUserData.zOrder, args: <any[]>[this.graphics, fixture]});
                        }
                    }
                }
                
                paintTargetList.sort((a, b)=>{
                    return (a.zOrder && b.zOrder) ? a.zOrder - b.zOrder : (a.zOrder ? 1 : b.zOrder); 
                });
                
                paintTargetList.forEach((target)=>{
                    this.graphics.save();
                    target.func.apply(window, target.args);
                    this.graphics.restore();
                });
                
                this.graphics.restore();
            });
            
            this.graphics.restore();

            // paintScreen の呼び出し
            forEachBody(world, (body, userData)=>{
                var pos = body.GetPosition();
                this.graphics.save();
                if(userData && userData.paintScreen){
                    // body の UserData に paint があればそれを優先。 
                    userData.paintScreen(this, this.graphics, body);
                }else{
                    // そうでなければ各 fixture の userdata の paint を探す 
                    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
                        var fixtureUserData = fixture.GetUserData();
                        if(fixtureUserData && fixtureUserData.paintScreen){
                            fixtureUserData.paintScreen(this, this.graphics, fixture);
                        }
                    }
                }                
                this.graphics.restore();
            });

            
            for(var joint = world.GetJointList(); joint; joint = joint.GetNext()){
                var userData = joint.GetUserData();
                if(userData && userData.paintScreen){
                    this.graphics.save();
                    userData.paintScreen(this.graphics, this);
                    this.graphics.restore();
                }
            }            
            
            if(this.foreground){
                this.graphics.save();
                this.foreground(this.graphics, this);
                this.graphics.restore();
            }
            
        }
        
        paintBodyState(body:Box2D.Dynamics.b2Body, aabbcolor?:string):void{
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
            var bodyAABB = getBodyAABB(body);
            if(bodyAABB){
                var body_lb = this.toScreenCoords(bodyAABB.lowerBound);
                var body_ub = this.toScreenCoords(bodyAABB.upperBound);
                var bodyAABBLineWidth = 4;
                this.graphics.lineWidth = bodyAABBLineWidth;
                this.graphics.strokeStyle = aabbcolor;
                this.graphics.strokeRect(
                    body_lb.x - bodyAABBLineWidth / 2, 
                    body_ub.y - bodyAABBLineWidth / 2, 
                    body_ub.x - body_lb.x + bodyAABBLineWidth, 
                    body_lb.y - body_ub.y + bodyAABBLineWidth
                );
            }
            
            // Linear Velocity ////////////////////////////////////////////
            var position = this.toScreenCoords(body.GetPosition());
            var velocity = body.GetLinearVelocity().Copy();
            velocity.Multiply(this.camera.scale * 0.1);
            this.graphics.beginPath();
            this.graphics.moveTo(position.x, position.y);
            this.graphics.lineTo(position.x + velocity.x, position.y - velocity.y);
            this.graphics.strokeStyle = "rgba(0, 255, 0, 0.6)";
            this.graphics.stroke();
            
            // Angular Velocity //////////////////////////////////////////
            var angularVelocity = body.GetAngularVelocity();
            this.graphics.beginPath();
            this.graphics.moveTo(position.x, position.y);
            for(var i = 0; i < Math.abs(angularVelocity) * 10; i++){
                var a = angularVelocity > 0 ? i : -i;
                var r = 0.2;
                var s = 0.2;
                var x = position.x + r * i * Math.cos(a * s);
                var y = position.y + r * i * Math.sin(a * s);
                this.graphics.lineTo(x, y);
            }
            this.graphics.strokeStyle = "rgba(0, 0, 255, 0.6)";
            this.graphics.stroke();
            
            // Center of Mass ///////////////////////////
            var com = this.toScreenCoords(body.GetWorldPoint(body.GetLocalCenter()));
            this.graphics.beginPath();
            this.graphics.moveTo(com.x - 6, com.y - 6);
            this.graphics.lineTo(com.x + 6, com.y + 6);
            this.graphics.moveTo(com.x + 6, com.y - 6);
            this.graphics.lineTo(com.x - 6, com.y + 6);
            this.graphics.lineWidth = 4;
            this.graphics.strokeStyle = "rgba(64, 120, 0, 0.8)";
            this.graphics.stroke();

            // Position ///////////////////////////
            var pos = this.toScreenCoords(body.GetPosition());
            this.graphics.beginPath();
            this.graphics.moveTo(pos.x - 6, pos.y - 6);
            this.graphics.lineTo(pos.x + 6, pos.y + 6);
            this.graphics.moveTo(pos.x + 6, pos.y - 6);
            this.graphics.lineTo(pos.x - 6, pos.y + 6);
            this.graphics.lineWidth = 4;
            this.graphics.strokeStyle = "rgba(255, 64, 64, 0.5)";
            this.graphics.stroke();

        }
        
        paintFixtureInfo(fixture:Box2D.Dynamics.b2Fixture, aabbcolor:string):void{
            /*
            var aabb = fixture.GetAABB();
            var lb = this.toScreenCoords(aabb.lowerBound);
            var ub = this.toScreenCoords(aabb.upperBound);
            this.graphics.beginPath();
            this.graphics.moveTo(lb.x, ub.y);
            this.graphics.lineTo(ub.x, ub.y);
            this.graphics.lineTo(ub.x, lb.y);
            this.graphics.lineTo(lb.x, lb.y);
            this.graphics.closePath();
            this.graphics.lineWidth = 4;
            this.graphics.strokeStyle = aabbcolor;
            this.graphics.stroke();   
            */
            var body = fixture.GetBody();
            var shape = fixture.GetShape();
            if(shape instanceof S.b2PolygonShape){
                var polygon = <S.b2PolygonShape>shape;
                var vs = polygon.GetVertices();
                this.graphics.beginPath();
                for(var i = 0; i < polygon.GetVertexCount(); i++){
                    var v = this.toScreenCoords(body.GetWorldPoint(vs[i]));
                    this.graphics.lineTo(v.x, v.y);
                }                    
                this.graphics.closePath();
                this.graphics.lineWidth = 6;
                this.graphics.strokeStyle = "rgba(0, 0, 0, 0.2)";
                this.graphics.stroke();   
                this.graphics.lineWidth = 4;
                this.graphics.strokeStyle = aabbcolor;
                this.graphics.stroke(); 
            }else if(shape instanceof S.b2CircleShape){
                var circle = <S.b2CircleShape>shape;
                var center = this.toScreenCoords(body.GetWorldPoint(circle.GetLocalPosition()));
                this.graphics.beginPath();
                this.graphics.arc(center.x, center.y, circle.GetRadius() * this.camera.scale, 0, 8, true);
                this.graphics.closePath();
                this.graphics.lineWidth = 6;
                this.graphics.strokeStyle = "rgba(0, 0, 0, 0.2)";
                this.graphics.stroke();   
                this.graphics.lineWidth = 4;
                this.graphics.strokeStyle = aabbcolor;
                this.graphics.stroke(); 
            }
        }
    }


    export function createViewport(canvas:JQuery, viewport?:Viewport):Viewport{
        return new Viewport(canvas, viewport);
    }
}