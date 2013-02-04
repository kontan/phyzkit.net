/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit.GameToolkit{
    var CRATE_BODY_TYPE_IDENTIFIER = "toolkit_crate";

    var BOX_IMAGE_URL = "box.png";

    var sourcePath = "js/phyzkit/toolkit/box.png";
    
    var boxImage = loader.request(sourcePath); 
    var crateCount = 0;

    export class CrateBodyUserData implements BodyUserData{
        name:string;
        constructor(private name:string, private imageScaleX:number, private imageScaleY:number, private imageTranslateX:number, private imageTranslateY:number, private image:HTMLImageElement){
            this.name = "木箱";
        }
        paint(g:CanvasRenderingContext2D, body:Box2D.Dynamics.b2Body):void{
            if(this.image.complete && body.GetFixtureList() && body.GetFixtureList().GetShape()){
                var imageScaleX = this.imageScaleX / this.image.width;
                var imageScaleY = this.imageScaleY / this.image.height;
                g.translate(this.imageTranslateX, this.imageTranslateY);
                g.scale(imageScaleX, imageScaleY);
                var pattern = g.createPattern(this.image, "repeat");
                g.fillStyle = pattern;
                
                for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
                    var shape = fixture.GetShape();
                    if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape){
                        var polygon = <Box2D.Collision.Shapes.b2PolygonShape> shape;
                        g.beginPath();
                        polygon.GetVertices().forEach((vertex, index)=>{
                            if(index == 0){
                                g.moveTo(
                                    (vertex.x - this.imageTranslateX) / imageScaleX, 
                                    (vertex.y - this.imageTranslateY) / imageScaleY
                                );   // パターン画像を拡大縮小するために graphics.scale するが、座標を元に戻すため 1 / scale する 
                            }else{
                                g.lineTo(
                                    (vertex.x - this.imageTranslateX) / imageScaleX, 
                                    (vertex.y - this.imageTranslateY) / imageScaleY
                                );
                            }
                        });
                        g.closePath();
                        g.fill();
                    }
                }
            }
        }
        serialize():any{
            return { 
                name: this.name, 
                type: CRATE_BODY_TYPE_IDENTIFIER, 
                imageScaleX    : this.imageScaleX,
                imageScaleY    : this.imageScaleY,
                imageTranslateX: this.imageTranslateX,
                imageTranslateY: this.imageTranslateY,
                imageSrc       : this.image.src
            };
        }
        static deserialize(json:any):CrateBodyUserData{
            if(json.type !== CRATE_BODY_TYPE_IDENTIFIER){
                throw "Error: CrateBodyUserData#deserialize: invalid argument json data type.";
            }
            var image:HTMLImageElement = new Image();
            image.src = json.imageSrc;
            return new CrateBodyUserData(
                json.name, 
                json.imageScaleX, 
                json.imageScaleY, 
                json.imageTranslateX, 
                json.imageTranslateY, 
                image
            );
        } 
        copy():BodyUserData{
            return new CrateBodyUserData(this.name, this.imageScaleX, this.imageScaleY, this.imageTranslateX, this.imageTranslateY, this.image);
        }
    }

    function createCrateBodyUserData(name:string, imageScaleX:number, imageScaleY:number, imageTranslateX:number, imageTranslateY:number, image:HTMLImageElement){
        return new CrateBodyUserData(name, imageScaleX, imageScaleY, imageTranslateX, imageTranslateY, image);
    }

    function createImagCrateBody(world:Box2D.Dynamics.b2World, image:HTMLImageElement, scale:number, position:Box2D.Common.Math.b2Vec2){
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.linearDamping = 0;
        bodyDef.angularDamping = 0;
        bodyDef.bullet = true;
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x = position.x;
        bodyDef.position.y = position.y;
        bodyDef.userData = createCrateBodyUserData(
            "木箱" + (crateCount++), 
            scale * image.width, 
            scale * image.height, 
            -scale / 2 * image.width, 
            -scale / 2 * image.height, 
            image
        );
        var body = world.CreateBody(bodyDef);
        
        var fixDef = new Box2D.Dynamics.b2FixtureDef();  
        fixDef.density = 1.0;
        fixDef.friction = 0.4;
        fixDef.restitution = 0.2;
        var polygon = new Box2D.Collision.Shapes.b2PolygonShape();
        polygon.SetAsBox(
            scale / 2 * image.width, 
            scale / 2 * image.height
        );            
        fixDef.shape = polygon;

        body.CreateFixture(fixDef); 
        
        return body;
    }

    export function createImageCrate(world, boxSize, position){
        return createImagCrateBody(world, boxImage, boxSize * 2 / boxImage.width, position);
    }
    
    SANDBOX.putUserDataDeserializer(CRATE_BODY_TYPE_IDENTIFIER, (data)=>{
        return CrateBodyUserData.deserialize(data);
    });
}