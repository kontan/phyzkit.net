/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    var BODY_TYPE_NAME= "toolkit_simple_polygon";
    var FIXTURE_TYPE_NAME = "toolkit_fixture_simple_polygon";

    export class PolygonFixtureUserData implements FixtureUserData{
        name:string;
        constructor(){
            this.name = "ポリゴン";
        }
        paint(g:CanvasRenderingContext2D, fixture:Box2D.Dynamics.b2Fixture):void{
            var shape = fixture.GetShape();
            if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape){
                var polygon = <Box2D.Collision.Shapes.b2PolygonShape> shape;
                var vertices = polygon.GetVertices();
                var count = polygon.GetVertexCount();
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
            }else{
                console.log("WARNING:class PolygonFixtureUserData / A PolygonFixtureUserData instance is attached a ficture that has NOT b2PolygonShape.");
            }
        }
        serialize():any{
            return { name: this.name, type: FIXTURE_TYPE_NAME };
        }
        copy():FixtureUserData{
            return new PolygonFixtureUserData();
        }
    }

    class PolygonBodyUserData{
        name:string = "ポリゴン";
        constructor(){
        }
        serialize(){
            return { 
                name: this.name, 
                type: BODY_TYPE_NAME 
            };
        }
        copy(){
            return new PolygonBodyUserData();
        }
    }

    export function createPolygon(world:Box2D.Dynamics.b2World, bodyType:any, vertices:Box2D.Common.Math.b2Vec2[]):Box2D.Dynamics.b2Body{
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.angularDamping = 0;
        bodyDef.type = bodyType;
        bodyDef.fixedRotation = false;
        bodyDef.userData = new PolygonBodyUserData();
        
        var fixDef = new Box2D.Dynamics.b2FixtureDef();
        fixDef.density = 1.0;   // density がないと物体があたっても回転しない？
        fixDef.friction = 0.4;
        fixDef.restitution = 0.2;
        fixDef.userData = new PolygonFixtureUserData();
        var polygon = new Box2D.Collision.Shapes.b2PolygonShape();
        polygon.SetAsArray(vertices, vertices.length);
        fixDef.shape = polygon;
        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);
        return body;
    }

    export function createPolygonFixture(body:Box2D.Dynamics.b2Body, vertices:Box2D.Common.Math.b2Vec2[]):Box2D.Dynamics.b2Fixture{
       var fixDef = new Box2D.Dynamics.b2FixtureDef();
        fixDef.density = 1.0;   // density がないと物体があたっても回転しない？
        fixDef.friction = 0.4;
        fixDef.restitution = 0.2;
        fixDef.userData = new PolygonFixtureUserData();
        var polygon = new Box2D.Collision.Shapes.b2PolygonShape();
        polygon.SetAsArray(vertices, vertices.length);
        fixDef.shape = polygon;
        var fixture = body.CreateFixture(fixDef);
        return fixture;            
    }
    
    SANDBOX.putUserDataDeserializer(BODY_TYPE_NAME, function(data){
        return new PolygonBodyUserData();
    });
    SANDBOX.putUserDataDeserializer(FIXTURE_TYPE_NAME, function(data){
        return new PolygonFixtureUserData();
    });
}