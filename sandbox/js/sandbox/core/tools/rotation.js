"use strict";

    // Rotation Tool
SANDBOX.createRotationTool = function(){
    function dispose(){
        if(body){
            // Restore properties
            body.SetType(bodyType);
            body.SetFixedRotation(fixedRotation);
            
            // Delete unnecessary values 
            body = undefined;
        }
    }
    
    var body, initialBodyAngle, dragStartPoint, bodyType, fixedRotation;
    
    var that = {
        style: "tool_rotation",
        tooltip: "回転：物体をドラッグで回転します",
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
                    
                    initialBodyAngle = body.GetAngle();
                    dragStartPoint = p;
                    
                    sandbox.clearSelection();
                    sandbox.selectBody(body);
                }
            }
        },
        mousemove: function(event, sandbox){
            if(body){
                // Rotation axis
                var o = body.GetPosition();
                
                var m = dragStartPoint;
                var r = Math.atan2(o.x - m.x, o.y - m.y);
                
                var n = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
                var s = Math.atan2(o.x - n.x, o.y - n.y);
                
                body.SetAngle(initialBodyAngle + r - s);
                body.SetAwake(true);
                body.SetActive(true);
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