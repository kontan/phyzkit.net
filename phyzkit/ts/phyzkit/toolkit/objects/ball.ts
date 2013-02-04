/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit.GameToolkit{
    var BODY_TYPE_NAME    = "simple_ball";
    var FIXTURE_TYPE_NAME = "fixture_simple_ball";
    var SOCCER_BALL_IMAGE = "js/phyzkit/toolkit/soccer.png";    
    
    var ballImage = loader.request(SOCCER_BALL_IMAGE); 
    var crateCount = 0;
    
    export function createBallUserData(name?:string){
        return {};
    }

    export class BallFixtureUserData implements FixtureUserData{
        name:string;
        constructor(){
            this.name = "ボール";
        }
        paint(g:CanvasRenderingContext2D, fixture:Box2D.Dynamics.b2Fixture):void{
            var shape = fixture.GetShape();
            if(shape instanceof Box2D.Collision.Shapes.b2CircleShape){
                var circle = <Box2D.Collision.Shapes.b2CircleShape> shape;
                 if(ballImage.complete){
                    var radius = circle.GetRadius();
                    var pos    = circle.GetLocalPosition();
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
            }else{
                console.log("WARNING:class BallFixtureUserData / A BallFixtureUserData instance is attached a ficture that has NOT b2CircleShape.");
            }
        }
        serialize():any{
            return { name: this.name, type: FIXTURE_TYPE_NAME };
        }
        copy():FixtureUserData{
            return new BallFixtureUserData();
        }
    }
    
    export function createBallFixtureUserData(name):FixtureUserData{
        return new BallFixtureUserData();
    }
    
    export function createBall(world:Box2D.Dynamics.b2World, radius:number, position:Box2D.Common.Math.b2Vec2){
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.linearDamping  = 0.1;
        bodyDef.angularDamping = 0.1;
        bodyDef.bullet         = true;
        bodyDef.type           = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x     = position.x;
        bodyDef.position.y     = position.y;
        bodyDef.userData       = undefined;
        var body = world.CreateBody(bodyDef);
        
        var fixDef = new Box2D.Dynamics.b2FixtureDef();
        fixDef.density     = 1.0;
        fixDef.friction    = 0.4;
        fixDef.restitution = 0.2;
        fixDef.shape       = new Box2D.Collision.Shapes.b2CircleShape(radius);
        fixDef.userData    = createBallFixtureUserData("ボール" + (crateCount++));
        body.CreateFixture(fixDef); 
        
        return body;
    }
    
    // ボディデシリアライザの登録
    SANDBOX.putUserDataDeserializer(BODY_TYPE_NAME, function(data){
        return createBallUserData(data.name);
    });
    
    SANDBOX.putUserDataDeserializer(FIXTURE_TYPE_NAME, function(data){
        return createBallFixtureUserData(data.name);
    });
}