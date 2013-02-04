/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    export function createRevoluteJointEditor(sandbox, revoluteJoint){
        function update(){
            editList.update();
        }
        
        var editList = createEditList();
        
        editList.createBooleanEdit("角度の制限",          function(){ return revoluteJoint.IsLimitEnabled();      }, function(v){ revoluteJoint.EnableLimit  (v);                             });
        editList.createNumberEdit ("最小角度"  ,     0.1, function(){ return revoluteJoint.GetLowerLimit ();      }, function(v){ revoluteJoint.SetLimits(v, revoluteJoint.GetUpperLimit ()); });
        editList.createNumberEdit ("最大角度"  ,     0.1, function(){ return revoluteJoint.GetUpperLimit ();      }, function(v){ revoluteJoint.SetLimits(revoluteJoint.GetLowerLimit (), v); });
        
        editList.createBooleanEdit("モーター",            function(){ return revoluteJoint.IsMotorEnabled();      }, function(v){ revoluteJoint.EnableMotor(v);                               });
        editList.createNumberEdit ("モーター速度",   0.1, function(){ return revoluteJoint.GetMotorSpeed ();      }, function(v){ revoluteJoint.SetMotorSpeed (v);                            });
        editList.createNumberEdit ("モータートルク", 0.1, function(){ return revoluteJoint.GetMotorTorque();      }, function(v){ revoluteJoint.SetMaxMotorTorque(v);                            });
        
        editList.createNumberEdit ("反作用トルク",   0.1, function(){ return revoluteJoint.GetReactionTorque();   }, undefined);
        editList.createNumberEdit ("反作用力.X",     0.1, function(){ return revoluteJoint.GetReactionForce ().x; }, undefined);
        editList.createNumberEdit ("反作用力.Y",     0.1, function(){ return revoluteJoint.GetReactionForce ().y; }, undefined);

        editList.createBooleanEdit("アクテイブ",          function(){ return revoluteJoint.IsActive();            }, undefined);
        editList.createNumberEdit ("アンカー.X",     0.1, function(){ return revoluteJoint.GetAnchorA().x;        }, undefined);
        editList.createNumberEdit ("アンカー.Y",     0.1, function(){ return revoluteJoint.GetAnchorA().y;        }, undefined);
        editList.createNumberEdit ("角度"      ,     0.1, function(){ return revoluteJoint.GetJointAngle();       }, undefined);
        editList.createNumberEdit ("速度"      ,     0.1, function(){ return revoluteJoint.GetJointSpeed();       }, undefined);
        
        //editList.createNewDictionaryButton();
        
        return {
            object: revoluteJoint,
            control: editList.root,
            update: update
        }
    }
}
