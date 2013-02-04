/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    export function createFixtureEditor(sandbox, fixture){
        function update(){
            editList.update();
        }
        
        var editList = createEditList();
        editList.createNumberEdit ("密度",         0.1, function(){ return fixture.GetDensity();                 }, function(v){ fixture.SetDensity(v);     });
        editList.createNumberEdit ("摩擦係数",     0.1, function(){ return fixture.GetFriction();                }, function(v){ fixture.SetFriction(v);    });
        editList.createNumberEdit ("反発係数"  ,   0.1, function(){ return fixture.GetRestitution();             }, function(v){ fixture.SetRestitution(v); });
        editList.createNumberEdit ("カテゴリ"  ,   0.1, function(){ return fixture.GetFilterData().categoryBits; }, function(v){ var d = fixture.GetFilterData().Copy(); d.categoryBits = v; fixture.SetFilterData(d); });
        editList.createNumberEdit ("グループ"  ,   0.1, function(){ return fixture.GetFilterData().groupIndex;   }, function(v){ var d = fixture.GetFilterData().Copy(); d.groupIndex   = v; fixture.SetFilterData(d); });
        editList.createNumberEdit ("マスク"  ,     0.1, function(){ return fixture.GetFilterData().maskBits;     }, function(v){ var d = fixture.GetFilterData().Copy(); d.maskBits     = v; fixture.SetFilterData(d); });
        editList.createBooleanEdit("センサ",            function(){ return fixture.IsSensor();                   }, function(v){ fixture.SetSensor();       });  
        
        return {
            object:  fixture,
            control: editList.root,
            update:  update
        }
    };
}