/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    export function createBodyEditor(sandbox, body){
        function update(){
            editList.update();
        }
        
        var editList = createEditList();
        
        function tuple(text, value){
            var o:any = {};
            o.text =  text;
            o.value = value;
            return o;
        }

        editList.createEnumEdit("種類", 
            [
                tuple("静的",     Box2D.Dynamics.b2Body.b2_staticBody    ),
                tuple("運動学的", Box2D.Dynamics.b2Body.b2_kinematicBody ),
                tuple("動的",     Box2D.Dynamics.b2Body.b2_dynamicBody   )
            ],
            function(){
                return body.GetType();
            },
            function(value){
                body.SetType(value);
            }
        );
        editList.createNumberEdit ("位置.X"  ,   0.1, function(){ return body.GetPosition().x;       }, function(v){ body.SetPosition(new Box2D.Common.Math.b2Vec2(v, body.GetPosition().y)); });
        editList.createNumberEdit ("位置.Y"  ,   0.1, function(){ return body.GetPosition().y;       }, function(v){ body.SetPosition(new Box2D.Common.Math.b2Vec2(body.GetPosition().x, v)); });
        editList.createNumberEdit ("角度"  ,     0.1, function(){ return body.GetAngle();            }, function(v){ body.SetAngle(v); });
        editList.createNumberEdit ("速度.X"  ,   0.1, function(){ return body.GetLinearVelocity().x; }, function(v){ body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(v, body.GetLinearVelocity().y)); });
        editList.createNumberEdit ("速度.Y"  ,   0.1, function(){ return body.GetLinearVelocity().y; }, function(v){ body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(body.GetLinearVelocity().x, v)); });
        editList.createNumberEdit ("角速度"  ,   0.1, function(){ return body.GetAngularVelocity();  }, function(v){ body.SetAngularVelocity(v); });
        editList.createNumberEdit ("移動減衰",   0.1, function(){ return body.GetLinearDamping();    }, function(v){ body.SetLinearDamping(v);   });
        editList.createNumberEdit ("回転減衰",   0.1, function(){ return body.GetAngularDamping();   }, function(v){ body.SetAngularDamping(v);  });
        
        editList.createNumberEdit ("質量"  ,     0.1, function(){ return body.GetMass();             }, function(v){ var m = new Box2D.Collision.Shapes.b2MassData(); body.GetMassData(m); m.mass = v; body.SetMassData(m); });
        editList.createNumberEdit ("慣性"  ,     0.1, function(){ return body.GetInertia();          }, function(v){ var m = new Box2D.Collision.Shapes.b2MassData(); body.GetMassData(m); m.I = v; body.SetMassData(m); });
        editList.createNumberEdit ("重心.X"  ,   0.1, function(){ return body.GetWorldCenter().x;    }, function(v){ var m = new Box2D.Collision.Shapes.b2MassData(); body.GetMassData(m); m.center.x = v; body.SetMassData(m); });
        editList.createNumberEdit ("重心.Y"  ,   0.1, function(){ return body.GetWorldCenter().y;    }, function(v){ var m = new Box2D.Collision.Shapes.b2MassData(); body.GetMassData(m); m.center.y = v; body.SetMassData(m); });
        editList.createBooleanEdit("回転固定",        function(){ return body.IsFixedRotation();     }, function(v){ body.SetFixedRotation(v); })  ;  
        editList.createBooleanEdit("弾丸",            function(){ return body.IsBullet();            }, function(v){ body.SetBullet(v); });      
        editList.createBooleanEdit("睡眠可能",        function(){ return body.IsSleepingAllowed();   }, function(v){ body.SetSleepingAllowed(v); });    
        editList.createBooleanEdit("覚醒",            function(){ return body.IsAwake();             }, function(v){ body.SetAwake(v); }); 
        editList.createBooleanEdit("有効",            function(){ return body.IsActive();            }, function(v){ body.SetActive(v); });     
        
        return {
            object: body,
            control: editList.root,
            update: update
        }
    }
}