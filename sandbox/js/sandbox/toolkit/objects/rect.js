"use strict";

(function(){
    var BODY_TYPE_NAME= "wall";
    
    var blockCount = 0;

    Toolkit.Block = Object.freeze({
        createUserData: function(w, h, name){
            var dat = {        
                name: name,
                paint: function(g, body){
                    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
                        var vertices = fixture.GetShape().GetVertices();
                        g.beginPath();
                        vertices.forEach(function(vertex, i){
                            (i == 0 ? g.moveTo(vertex.x, vertex.y) : g.lineTo(vertex.x, vertex.y));
                        });
                        g.closePath();
                        g.fillStyle = "rgb(20, 20, 40)";
                        g.fill();
                        
                        
                        
                    }
                },
                serialize: function(){
                    return { name: dat.name, type: BODY_TYPE_NAME, w: w, h: h};
                }
            };
            return dat;
        },
        
        create: function(world, x, y, w, h){
            var fixDef = new b2FixtureDef(),
                bodyDef = new b2BodyDef();
            
            fixDef.density = 1.0;
            fixDef.friction = 0.4;
            fixDef.restitution = 0.1;
            bodyDef.linearDamping = 0;
            bodyDef.angularDamping = 0;
            bodyDef.type = b2Body.b2_staticBody;
            bodyDef.position.x = x + w / 2;
            bodyDef.position.y = y + h / 2;
            bodyDef.userData = Toolkit.Block.createUserData(w, h, "静的ブロック" + (blockCount++));
            fixDef.shape = new b2PolygonShape();
            fixDef.shape.SetAsBox(w / 2, h / 2);

            var body = world.CreateBody(bodyDef);
            body.CreateFixture(fixDef);
            return body;
        }
    });
    
    SANDBOX.putUserDataDeserializer(BODY_TYPE_NAME, function(data){
        return Toolkit.Block.createUserData(data.w, data.h);
    });
})();