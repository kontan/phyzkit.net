"use strict";

SANDBOX.createHandTool = function(){
    var body, bodyType, fixedRotation, joint;

    function dispose(){
        if(joint){
            // Restore properties
            body.SetType(bodyType);
            body.SetFixedRotation(fixedRotation);
            
            // Delete unnecessary values 
            body.GetWorld().DestroyJoint(joint);
            joint = undefined;
            //body = undefined;
        }
    }
    
    return {
        style: "tool_hand",
        tooltip: "ハンド：物体を掴んで引っ張ったり投げたりします",
        mousedown: function(event, sandbox){
            var p = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
            
            if( ! joint){
                // Get clicket body
                body = undefined;
                sandbox.world.QueryPoint(function(fixture){
                    body = fixture.GetBody();
                    return false; /* first fixture only */
                }, p);
                
                if(body){
                    bodyType      = body.GetType();
                    fixedRotation = body.IsFixedRotation();
                    //body.SetFixedRotation(true);
                    
                    body.SetType(b2Body.b2_dynamicBody);
                    body.SetAwake(true);
                    body.SetActive(true);
                
                    var def = new b2MouseJointDef();
                    def.bodyA = sandbox.world.GetGroundBody();
                    def.bodyB = body;
                    def.target.Set(p.x, p.y);
                    def.maxForce = 3000.0 * body.GetMass();
                    def.timeStep = 1 / self.frameRate;
                    joint = sandbox.world.CreateJoint(def);
                    joint.SetUserData({
                        name: "ハンドツール",
                        paint: function(g){
                        
                        }
                    });
                    
                    sandbox.clearSelection();
                    sandbox.selectObject(body);
               
                }
            }
            
        },
        mousemove: function(event, sandbox){
            if(joint){
                joint.SetTarget(sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event)));
            }
        },
        mouseup: function(){
            dispose();
        },
        mouseout: function(){
            dispose();
        },
        paint: function(g, viewport){
            if(body){
                //viewport.paintBodyState(body);
            }
        }
    };
};