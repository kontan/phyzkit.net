"use strict";

(function(){
    var BODY_TYPE_NAME    = "simple_ball";
    var FIXTURE_TYPE_NAME = "fixture_simple_ball";
    var SOCCER_BALL_IMAGE = "js/sandbox/toolkit/objects/soccer.png";    
    
    var ballImage = SANDBOX.loader.request(SOCCER_BALL_IMAGE); 
    var crateCount = 0;
    
    function createUserData(){
        return {};
    }
    
    function createFixtureUserData(name){
        var dat = {
            name: name,
            paint: function(g, fixture){
                if(ballImage.complete){
                    var shape = fixture.GetShape();
                    if(shape && shape instanceof b2CircleShape){
                        var radius = shape.GetRadius();
                        var pos    = shape.GetLocalPosition();
                        g.translate(
                            pos.x - radius, 
                            pos.y - radius
                        );
                        g.scale(
                            radius * 2 / ballImage.width, 
                            radius * 2 / ballImage.height
                        );
                        g.drawImage(ballImage, 0, 0);
                    }
                }
            },
            copy: function(){
                return createFixtureUserData(name);
            },
            serialize: function(){
                return { name: dat.name, type: FIXTURE_TYPE_NAME };
            }
        };
        return dat;
    }
    
    function create(world, radius, position){
        var bodyDef = new b2BodyDef();
        bodyDef.linearDamping  = 0.1;
        bodyDef.angularDamping = 0.1;
        bodyDef.bullet         = true;
        bodyDef.type           = b2Body.b2_dynamicBody;
        bodyDef.position.x     = position.x;
        bodyDef.position.y     = position.y;
        bodyDef.userData       = undefined;
        var body = world.CreateBody(bodyDef);
        
        var fixDef = new b2FixtureDef();
        fixDef.density     = 1.0;
        fixDef.friction    = 0.4;
        fixDef.restitution = 0.2;
        fixDef.shape       = new b2CircleShape(radius);
        fixDef.userData    = createFixtureUserData("ボール" + (crateCount++));
        body.CreateFixture(fixDef); 
        
        return body;
    }
    
    // ツールキットテーブルへの登録
    Toolkit.SimpleBall = Object.freeze(Object.create(null, {
        createUserData: { value: createUserData }, 
        create        : { value: create         }
    }));
    
    // ボディデシリアライザの登録
    SANDBOX.putUserDataDeserializer(BODY_TYPE_NAME, function(data){
        return createUserData(data.name);
    });
})();