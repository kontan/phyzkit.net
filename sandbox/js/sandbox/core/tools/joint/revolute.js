SANDBOX.createRevoluteJointTool = function(){
    var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
    
    return {
        style: "tool_joint",
        click: function(e, sandbox){
            var body;
            var p = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(e));
            var world = sandbox.world;
            world.QueryPoint(function(fixture){
                body = fixture.GetBody();
                return false;
            }, p);
            if(body){            
                var def = new b2RevoluteJointDef();
                def.Initialize(body, world.GetGroundBody(), new b2Vec2(0, 0));
                var joint = world.CreateJoint(def);
                joint.SetUserData({
                    paintScreen: function(g, viewport){
                        function drawAnchor(label, point){
                            var p = viewport.toScreenCoords(point);
                            var s = 10;
                            g.lineWidth = 4;
                            g.strokeStyle = "black";
                            g.beginPath();
                            g.moveTo(p.x - s, p.y - s);
                            g.lineTo(p.x + s, p.y + s);
                            g.moveTo(p.x + s, p.y - s);
                            g.lineTo(p.x - s, p.y + s);
                            g.stroke();
                            g.fillStyle = "black";
                            g.fillText(label, p.x + 5, p.y + 20);
                        }
                        drawAnchor("Anchor A", joint.GetAnchorA());
                        drawAnchor("Anchor B", joint.GetAnchorB());
                    }
                });
                return joint;
            }
        }
    };
};