"use strict";

// Moving tool.
    // Moving tool moves a body forcibry.
SANDBOX.createMovingTool = function(){
    function dispose(){
        if(body){
            // Restore properties
            body.SetType(bodyType);
            //body.SetFixedRotation(fixedRotation);
            //body.SetActive(true);
            body = undefined;
        }
    }
    
    var body, bodyType, fixedRotation;
    
    var mouseDownPoint, initialBodyPosition;
    
    return {
        style: "tool_move",
        tooltip: "移動：物体をドラッグで移動します",
        mousedown: function(event, sandbox){
            if( ! body){
                var p = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
                
                // Get clicket body
                sandbox.world.QueryPoint(function(fixture){
                    body = fixture.GetBody();
                    return false; /* first fixture only */
                }, p.Copy());
                
                if(body){
                    bodyType      = body.GetType();
                    //fixedRotation = body.IsFixedRotation();
                    //body.SetType(b2Body.b2_kinematicBody);
                    
                    // 非アクテイブにすると、AABBの更新がなくなってしまう
                    //body.SetActive(false);
                    // SetFixedRotation で中心がずれる問題がある？
                    //body.SetFixedRotation(true);
                    //body.SetAwake(true);
                    mouseDownPoint = p;
                    initialBodyPosition = body.GetPosition().Copy();
                   
                    sandbox.clearSelection();
                    sandbox.selectObject(body);
                }
            }
        },
        mousemove: function(event, sandbox){
            if(body){
                var delta = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
                delta.Subtract(mouseDownPoint);
                var pos = initialBodyPosition.Copy();
                pos.Add(delta);
                body.SetPosition(pos);
                //body.SetAwake(true);
                //body.SetActive(true);
            }
        },
        mouseup: function(){
            dispose();
        },
        mouseout: function(){
            dispose();
        }
    };
};
