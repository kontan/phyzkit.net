/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    export function showSettingDialog(container:JQuery):void{
        var b2Settings = Box2D.Common.b2Settings;
        
        var tbody = $("<tbody class=\"setting_tbody\" />");
        var table = $("<table class=\"setting_table\" />").append(tbody);
        var div   = $("<div class=\"setting_div\"></div>").append(table);
        var close = $("<div class=\"button\">閉じる</div>");
        var background = $("<div class=\"dialog_background\"><h3>Box2D 詳細設定</h3></div>").append(div, close);
        
        var settings = [];

        function setting(label, getter, setter){
            var input = $("<input type=\"number\" class=\"setting_number\" />");
            tbody.append($("<tr />").append($("<td/>").append(label), $("<td />").append(input)));
            input.change(function(){
                setter(parseFloat(input.val()));
            });
            settings.push(function(){
                input.val(getter().toString());
            });
        }
        
        function update(){
            settings.forEach(function(setting){
                setting();
            });
        }
        
        background.click(function(){
            background.fadeOut("normal");
        });
        table.click(function(e){
            e.stopPropagation();
        });

        setting("aabbExtension"          , function(){ return b2Settings.b2_aabbExtension           ; }, function(v){ b2Settings.b2_aabbExtension            = v; });
        setting("aabbMultiplier"         , function(){ return b2Settings.b2_aabbMultiplier          ; }, function(v){ b2Settings.b2_aabbMultiplier           = v; });
        setting("angularSleepTolerance"  , function(){ return b2Settings.b2_angularSleepTolerance   ; }, function(v){ b2Settings.b2_angularSleepTolerance    = v; });
        setting("angularSlop"            , function(){ return b2Settings.b2_angularSlop             ; }, function(v){ b2Settings.b2_angularSlop              = v; });
        setting("contactBaumgarte"       , function(){ return b2Settings.b2_contactBaumgarte        ; }, function(v){ b2Settings.b2_contactBaumgarte         = v; });
        setting("linearSleepTolerance"   , function(){ return b2Settings.b2_linearSleepTolerance    ; }, function(v){ b2Settings.b2_linearSleepTolerance     = v; });
        setting("linearSlop"             , function(){ return b2Settings.b2_linearSlop              ; }, function(v){ b2Settings.b2_linearSlop               = v; });
        setting("maxAngularCorrection"   , function(){ return b2Settings.b2_maxAngularCorrection    ; }, function(v){ b2Settings.b2_maxAngularCorrection     = v; });
        setting("maxLinearCorrection "   , function(){ return b2Settings.b2_maxLinearCorrection     ; }, function(v){ b2Settings.b2_maxLinearCorrection      = v; });
        setting("maxManifoldPoints "     , function(){ return b2Settings.b2_maxManifoldPoints       ; }, function(v){ b2Settings.b2_maxManifoldPoints        = v; });
        setting("maxRotation"            , function(){ return b2Settings.b2_maxRotation             ; }, function(v){ b2Settings.b2_maxRotation              = v; });
        setting("maxRotationSquared"     , function(){ return b2Settings.b2_maxRotationSquared      ; }, function(v){ b2Settings.b2_maxRotationSquared       = v; });
        setting("maxTOIContactsPerIsland", function(){ return b2Settings.b2_maxTOIContactsPerIsland ; }, function(v){ b2Settings.b2_maxTOIContactsPerIsland  = v; });
        setting("maxTOIJointsPerIsland"  , function(){ return b2Settings.b2_maxTOIJointsPerIsland   ; }, function(v){ b2Settings.b2_maxTOIJointsPerIsland    = v; });
        setting("maxTranslation"         , function(){ return b2Settings.b2_maxTranslation          ; }, function(v){ b2Settings.b2_maxTranslation           = v; });
        setting("maxTranslationSquared"  , function(){ return b2Settings.b2_maxTranslationSquared   ; }, function(v){ b2Settings.b2_maxTranslationSquared    = v; });
        setting("pi "                    , function(){ return b2Settings.b2_pi                      ; }, function(v){ b2Settings.b2_pi                       = v; });
        setting("polygonRadius"          , function(){ return b2Settings.b2_polygonRadius           ; }, function(v){ b2Settings.b2_polygonRadius            = v; });
        setting("timeToSleep"            , function(){ return b2Settings.b2_timeToSleep             ; }, function(v){ b2Settings.b2_timeToSleep              = v; });
        setting("toiSlop"                , function(){ return b2Settings.b2_toiSlop                 ; }, function(v){ b2Settings.b2_toiSlop                  = v; });
        setting("velocityThreshold"      , function(){ return b2Settings.b2_velocityThreshold       ; }, function(v){ b2Settings.b2_velocityThreshold        = v; });
        
        update();
        
        container.append(background);
        background.fadeIn("normal");
    };
}