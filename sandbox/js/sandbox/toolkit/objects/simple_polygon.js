"use strict";

(function(){
    var BODY_TYPE_NAME= "toolkit_simple_polygon";
    var FIXTURE_TYPE_NAME = "toolkit_fixture_simple_polygon";
    
    function createFixtureUserData(){
        var dat = {        
            name: "ポリゴン",
            paint: function(g, fixture){
                var shape = fixture.GetShape();
                var vertices = shape.GetVertices();
                var count = shape.GetVertexCount();
                g.save();
                g.beginPath();
                for(var i = 0; i < count; i++){
                    var vertex = vertices[i];
                    (i == 0 ? g.moveTo(vertex.x, vertex.y) : g.lineTo(vertex.x, vertex.y));
                }
                g.closePath();
                g.fillStyle = "rgb(20, 20, 40)";
                g.fill();
                g.restore();
            },
            serialize: function(){
                return { name: dat.name, type: FIXTURE_TYPE_NAME };
            },
            copy: function(){
                return createFixtureUserData();
            }
        };
        return dat;    
    }

    Toolkit.SimplePolygon = Object.freeze({
        createUserData: function(){
            var dat = {        
                name: "ポリゴン",
                serialize: function(){
                    return { name: dat.name, type: BODY_TYPE_NAME };
                },
                copy: function(){
                    return Toolkit.SimplePolygon.createUserData();
                }
            };
            return dat;
        },
        
        create: function(world, bodyType, vertices){
            var bodyDef = new b2BodyDef();
            bodyDef.angularDamping = 0;
            bodyDef.type = bodyType;
            bodyDef.fixedRotation = false;
            bodyDef.userData = Toolkit.SimplePolygon.createUserData();
            
            var fixDef = new b2FixtureDef();
            fixDef.density = 1.0;   // density がないと物体があたっても回転しない？
            fixDef.friction = 0.4;
            fixDef.restitution = 0.2;
            fixDef.userData = createFixtureUserData();
            fixDef.shape = new b2PolygonShape();
            fixDef.shape.SetAsArray(vertices);
            var body = world.CreateBody(bodyDef);
            body.CreateFixture(fixDef);
            return body;
        },
        
        createFixture: function(body, vertices){
           var fixDef = new b2FixtureDef();
            fixDef.density = 1.0;   // density がないと物体があたっても回転しない？
            fixDef.friction = 0.4;
            fixDef.restitution = 0.2;
            fixDef.userData = createFixtureUserData();
            fixDef.shape = new b2PolygonShape();
            fixDef.shape.SetAsArray(vertices);
            var fixture = body.CreateFixture(fixDef);
            return fixture;            
        }
    });
    
    SANDBOX.putUserDataDeserializer(BODY_TYPE_NAME, function(data){
        return Toolkit.SimplePolygon.createUserData();
    });
})();