SANDBOX.createSimpleDistanceJointTool = function(bodyA, bodyB){
    var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
    
    return {
        click: function(e, sandbox){
            var body;
            var p = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
            var world = bodyA.GetWorld();
            world.QueryPoint(function(b){
                body = b;
                return false;
            }, p);
            if(body){            
                var def = new b2RevoluteJointDef();
                def.Initialize(body, world.GetGroundBody(), body.GetWorldCenter());
                var joint = world.CreateJoint(def);
                joint.SetUserData({
                    paintScreen: function(g){
                        
                    }
                });
                return joint;
            }
        }
    };
};