"use strict";

(function(){

    
    
    var loader = SANDBOX.loader;
    var BOX_IMAGE_URL = "box.png";

    var sourcePath = $("#script_toolkit_crate").attr("src").replace("crate.js", BOX_IMAGE_URL);
    
    var boxImage = loader.request(sourcePath); 
    var crateCount = 0;
    
    Toolkit.Crate = Object.freeze(Object.create(null, {
        createUserData: { value: function(name){
            var dat = {
                name: name,
                paint: function(g, body){
                    if(boxImage.complete && body.GetFixtureList() && body.GetFixtureList().GetShape()){
                        var firstFixture = body.GetFixtureList();
                        var vertices = firstFixture.GetShape().GetVertices();
                        var boxSize = Math.abs(vertices[0].x);
                    
                        g.translate(-boxSize, -boxSize);
                        g.scale(
                            boxSize * 2 / boxImage.width, 
                            boxSize * 2 / boxImage.height
                        );
                        g.drawImage(boxImage, 0, 0);
                    }
                },
                serialize: function(){
                    return { name: dat.name, type: "box" };
                }
            };
            return dat;
        }}, 
        create: { value: function(world, boxSize, position){
            var    body,
                mx = position.x,
                my = position.y,
                fixDef = new b2FixtureDef(),
                bodyDef = new b2BodyDef();
            
            fixDef.density = 1.0;
            fixDef.friction = 0.4;
            fixDef.restitution = 0.2;
            
            bodyDef.linearDamping = 0;
            bodyDef.angularDamping = 0;
            bodyDef.bullet = true;
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.x = mx;
            bodyDef.position.y = my;
            bodyDef.userData = Toolkit.Crate.createUserData("木箱" + (crateCount++));
            
            fixDef.shape = new b2PolygonShape();
            fixDef.shape.SetAsBox(boxSize, boxSize);
            body = world.CreateBody(bodyDef);
            body.CreateFixture(fixDef); 
            return body;
        }}
    }));
    
    SANDBOX.putUserDataDeserializer("box", function(data){
        return Toolkit.Crate.createUserData(data);
    });
})();