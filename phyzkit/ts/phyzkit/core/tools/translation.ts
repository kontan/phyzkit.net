/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;
    // Moving tool.
        // Moving tool moves a body forcibry.
    export function createMovingTool(sandbox:SandBox){
        function getZGizmoRadius(viewport:Viewport){
            return 0.2 * Math.min(viewport.canvas.width(), viewport.canvas.height())
        }
        function getXYGizmoLength(viewport:Viewport){
            return getZGizmoRadius(viewport) * 1.5;
        }
        function getSelectedBody(){
            if(sandbox && sandbox.selectedBodies.length > 0){
                return sandbox.selectedBodies[0];
            }else{
                return undefined;
            }
        }
        
        // 点 p が 半直線 x = q + tv から r 以内の距離にあるかどうか求めます。
        function intersectGizmo(p:M.b2Vec2, q:M.b2Vec2, v:M.b2Vec2, r:M.b2Vec2):bool{
            // v の絶対値の２乗
            var k = v.LengthSquared();

            // h = q + sv を満たす s
            var s = ((p.x - q.x) * v.x + (p.y - q.y) * v.y) / k;
            
            // 垂線の足 h
            var h = new Box2D.Common.Math.b2Vec2(
                q.x + v.x * s,
                q.y + v.y * s
            );
            
            // p と h の距離
            var l = new Box2D.Common.Math.b2Vec2(p.x - h.x, p.y - h.y).Length();
            
            // p と q の距離
            var m = new Box2D.Common.Math.b2Vec2(p.x - q.x, p.y - q.y).Length();
            
            // p と q + v の距離
            var n = new Box2D.Common.Math.b2Vec2(p.x - q.x - v.x, p.y - q.y - v.y).Length();
            
            return ((l <= r) && (0 <= s && s <= 1)) || (m <= r) || (n <= r);
        }
        
        
        function isGizmoActive(mp:M.b2Vec2, bodyPos:M.b2Vec2, angle:number):bool{
            var length = getXYGizmoLength(sandbox.viewport);                
            return mp && bodyPos && intersectGizmo(mp, bodyPos, new Box2D.Common.Math.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)), 10);
        }
        function isXGizmoActive(mp:M.b2Vec2, bodyPos:M.b2Vec2):bool{
            return isGizmoActive(mp, bodyPos, 0);
        }
        function isYGizmoActive(mp:M.b2Vec2, bodyPos:M.b2Vec2):bool{
            return isGizmoActive(mp, bodyPos, -Math.PI / 2);
        }
        function isZGizmoActive(mp:M.b2Vec2, pos:M.b2Vec2, viewport:Viewport):bool{
            var range = Math.sqrt(Math.pow(mp.x - pos.x, 2) + Math.pow(mp.y - pos.y, 2));
            return Math.abs(range - getZGizmoRadius(viewport)) < 20;
        }    

        function dispose():void{
            gizmoActions = [];
            disposeAction();
        }
        
        function scaleShape(body:D.b2Body, dragStartPoint:M.b2Vec2, mousePoint:M.b2Vec2, initialShapes:S.b2Shape):void{
            // Scaling origin
            var o = body.GetPosition();
            var p = sandbox.viewport.toWorldCoords(dragStartPoint);
            var q = sandbox.viewport.toWorldCoords(mousePoint);
            
            var r = Math.sqrt(Math.pow(o.x - p.x, 2) + Math.pow(o.y - p.y, 2));
            var s = Math.sqrt(Math.pow(o.x - q.x, 2) + Math.pow(o.y - q.y, 2));
            var t = Math.max(0.5, Math.min(2, s / r));
            
            for(var fixture = body.GetFixtureList(), i = 0; fixture; fixture = fixture.GetNext(), i++){
                var shape = fixture.GetShape();
                if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape){
                    var initialVertices = initialShapes[i].GetVertices();
                    shape.GetVertices().forEach(function(vertex, k){
                        vertex.x = initialVertices[k].x * t;
                        vertex.y = initialVertices[k].y * t;
                        vertex.z = initialVertices[k].z * t;
                    });
                }else if(shape instanceof Box2D.Collision.Shapes.b2CircleShape){
                    shape.SetRadius(initialShapes[i].GetRadius() * t);
                }else{
                    console.log("sacleShape: Unknown shape type. Scaling operation ignored.");
                }
            }
        }
        
        function getBodiesCenter():M.b2Vec2{
            var bodies = sandbox.selectedBodies;
            var gizmoPosWorld = new Box2D.Common.Math.b2Vec2(0, 0);
            bodies.forEach(function(body){
                var pos = body.GetPosition();
                gizmoPosWorld.x += pos.x;
                gizmoPosWorld.y += pos.y;
            });
            gizmoPosWorld.x /= bodies.length;
            gizmoPosWorld.y /= bodies.length;
            return sandbox.viewport.toScreenCoords(gizmoPosWorld); 
        }
        
        var mousePoint;
        var xGizmoAction, yGizmoAction, zGizmoAction, disposeAction = function(){};
        var gizmoActions = [];
        
        return {
            toolButtonStyle: "tool_move",
            tooltip: "移動：物体をドラッグで移動します",
            mousedown: function(event, sandbox){
                if(event.button == 0){
                    
                    var mp = pointFromEvent(event);
                    var p = sandbox.viewport.toWorldCoords(mp);
                    var mouseDownPoint = p;
                    
                    if(gizmoActions.length == 0){
                    
                        var bodies = sandbox.selectedBodies;
                        if(bodies.length > 0){
                            var gizmoPos = getBodiesCenter();
                            var xGizmoActive = isXGizmoActive(mp, gizmoPos);
                            var yGizmoActive = isYGizmoActive(mp, gizmoPos);
                            
                    
                            bodies.forEach(function(body){
                                var pos = sandbox.viewport.toScreenCoords(body.GetPosition());
                                var range = Math.pow(mp.x - pos.x, 2) + Math.pow(mp.y - pos.y, 2);
                                var initialBodyPosition = body.GetPosition().Copy();
                                
                                // X Gizmo
                                if(xGizmoActive){
                                    gizmoActions.push({ 
                                        move: function(event){
                                            var point = sandbox.viewport.toWorldCoords(pointFromEvent(event));
                                            body.SetPosition(new Box2D.Common.Math.b2Vec2(
                                                initialBodyPosition.x + point.x - mouseDownPoint.x,
                                                body.GetPosition().y
                                            ));
                                        },
                                    });
                                } 
                                
                                // Y Gizmo
                                if(yGizmoActive){
                                    gizmoActions.push({ 
                                        move: function(event){
                                            var point = sandbox.viewport.toWorldCoords(pointFromEvent(event));
                                            body.SetPosition(new Box2D.Common.Math.b2Vec2(
                                                body.GetPosition().x,
                                                initialBodyPosition.y + point.y - mouseDownPoint.y
                                            ));
                                        }
                                    });
                                } 
                                
                                if(gizmoActions.length == 0 && isZGizmoActive(mp, pos, sandbox.viewport)){
                                    (function(){
                                        var initialShapes = [];
                                        for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
                                            initialShapes.push(fixture.GetShape().Copy());
                                        }
                                    
                                        var mouseDownAngle = Math.atan2(mp.y - pos.y, mp.x - pos.x);
                                        var initialBodyAngle = body.GetAngle();
                                        gizmoActions.push({
                                            move: function(event){
                                                var point = pointFromEvent(event);
                                                if(event.shiftKey){
                                                    scaleShape(body, mp, pointFromEvent(event), initialShapes);
                                                }else{
                                                    var mouseAngle = Math.atan2(point.y - pos.y, point.x - pos.x);
                                                    body.SetAngle(initialBodyAngle - mouseAngle + mouseDownAngle);
                                                }
                                            }
                                        });
                                    })();
                                }
                                
                                if(gizmoActions.length > 0){
                                    var initialBodyType = body.GetType();
                                    var initialLinearVelocity  = body.GetLinearVelocity().Copy();
                                    var initialAngularVelocity = body.GetAngularVelocity();
                                    
                                    //var isAwake = body.IsAwake();
                                    
                                    
                                    // 一時的に b2_kinematicBody にすると、実行中でも dynamicBody を安定して移動できる
                                    body.SetType(Box2D.Dynamics.b2Body.b2_kinematicBody);
                                    // kinematic にすると、移動時に一瞬物体がずれる不具合がある
                                    // SetPosition し直すと大丈夫みたい
                                    body.SetPosition(body.GetPosition().Copy());
                                    
                                    
                                    body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
                                    body.SetAngularVelocity(0);
                                    //body.SetAwake(isAwake); // SetType で起きる？
                                    body.SetAwake(true);
                                    
                                    disposeAction = function(){
                                        body.SetType(initialBodyType);
                                        body.SetLinearVelocity(initialLinearVelocity);
                                        body.SetAngularVelocity(initialAngularVelocity);
                                        disposeAction = function(){};
                                    };
                                }
                            });
                        }
                    }
                }
            },
            mousemove: function(event, sandbox){
                gizmoActions.forEach(function(action){ action.move(event) });
                
                mousePoint = pointFromEvent(event);
            },
            mouseup: function(){
                if(gizmoActions.length > 0){
                    dispose();
                }else{
                    var selectedFixture = getFixtureAt(sandbox.world, sandbox.viewport.toWorldCoords(pointFromEvent(event)));
                    if(selectedFixture){
                        var body = selectedFixture.GetBody();
                        if(event.ctrlKey){
                            sandbox.toggleObjectSelection(body);
                        }else{
                            sandbox.clearSelection();
                            sandbox.selectObject(body);
                        }
                    }
                }
            },
            mouseout: function(){
                dispose();
            },
            paint: function(g, viewport){
            
            
                function drawArrow(angle, color){
                    var length = getXYGizmoLength(viewport);            
                    var line = mousePoint && intersectGizmo(mousePoint, gizmoPos, new Box2D.Common.Math.b2Vec2(length * Math.cos(angle), length * Math.sin(angle)), 10) ? 2 : 1;
                
                    g.lineWidth = 4 * line;
                
                    g.save();
                    g.translate(gizmoPos.x, gizmoPos.y);
                    g.rotate(angle);
                
                    g.beginPath();
                    g.moveTo(0, 0);
                    g.lineTo(length, 0);
                    g.strokeStyle = color;
                    g.stroke();           

                    g.beginPath();
                    g.moveTo(length + 15 * line,  0);
                    g.lineTo(length,      +5 * line);
                    g.lineTo(length,      -5 * line);
                    g.fillStyle = color;
                    g.fill();         

                    g.restore();
                }
            
                if(sandbox.selectedBodies.length > 0){
                    var gizmoPos = getBodiesCenter();
                var body = sandbox.selectedBodies[0];
                    var bodyPos = viewport.toScreenCoords(body.GetPosition());
                    var radius = getZGizmoRadius(viewport); 
                    g.beginPath();
                    g.arc(gizmoPos.x, gizmoPos.y, radius, 0, 7);
                    g.strokeStyle = "rgba(64, 64, 255, 0.5)";
                    g.lineWidth = mousePoint && isZGizmoActive(mousePoint, gizmoPos, sandbox.viewport) ? 8 : 4;
                    g.stroke();
                    
                    drawArrow(0,            "rgba(255, 64,  64, 0.5)");
                    drawArrow(-Math.PI / 2, "rgba(64, 255,  64, 0.5)");
                }
            }
        };
    }
}