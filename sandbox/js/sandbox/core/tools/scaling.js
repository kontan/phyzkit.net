"use strict";

// Scaling Tool
SANDBOX.createScalingTool = function(){
    function dispose(){
        if(body){
            // Restore properties
            body.SetType(bodyType);
            body.SetFixedRotation(fixedRotation);
            
            // Delete unnecessary values 
            body = undefined;
        }
    }
        
    var body, initialShapes, dragStartPoint, bodyType, fixedRotation, initialRadius;
    
    var that = {
        style: "tool_scaling",  
        tooltip: "拡大縮小：物体をドラッグで一度に２～0.5 倍の拡大縮小を行います",
        mousedown: function(event, sandbox){
            if( ! body && event.button === 0 && ! event.shiftKey && ! event.ctrlKey && ! event.altKey){
                var p = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
                // Get clicket body
                sandbox.world.QueryPoint(function(fixture){
                    body = fixture.GetBody();
                    return false; /* first fixture only */
                }, p);
                
                if(body){
                    bodyType      = body.GetType();
                    fixedRotation = body.IsFixedRotation();
                    body.SetType(b2Body.b2_kinematicBody );
                    body.SetFixedRotation(true);
                    body.SetAwake(true);
                    body.SetActive(true);
                    
                    dragStartPoint = p;
                    
                    // Copy all shapes
                    initialShapes = [];
                    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
                        initialShapes.push(fixture.GetShape().Copy());
                    }
                    
                    sandbox.clearSelection();
                    sandbox.selectBody(body);
                }
            }
        },
        mousemove: function(event, sandbox){
            if(body){
                // Scaling origin
                var o = body.GetPosition();
                var p = dragStartPoint;
                var q = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
                
                var r = Math.sqrt(Math.pow(o.x - p.x, 2) + Math.pow(o.y - p.y, 2));
                var s = Math.sqrt(Math.pow(o.x - q.x, 2) + Math.pow(o.y - q.y, 2));
                var t = Math.max(0.5, Math.min(2, s / r));
                
                for(var fixture = body.GetFixtureList(), i = 0; fixture; fixture = fixture.GetNext(), i++){
                    var shape = fixture.GetShape();
                    if(shape instanceof b2PolygonShape){
                        var initialVertices = initialShapes[i].GetVertices();
                        shape.GetVertices().forEach(function(vertex, k){
                            vertex.x = initialVertices[k].x * t;
                            vertex.y = initialVertices[k].y * t;
                            vertex.z = initialVertices[k].z * t;
                        });
                    }else if(shape instanceof b2CircleShape){
                        shape.SetRadius(initialShapes[i].GetRadius() * t);
                    }
                }
                
                body.SetAwake(true);
                body.SetActive(true);
                //body.Set(initialBodyScale + r - s);
            }
        },
        mouseup: function(){
            dispose();
        },
        mouseout: function(){
            dispose();
        }
    };
    return that;
};