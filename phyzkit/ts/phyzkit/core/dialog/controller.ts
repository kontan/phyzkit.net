/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;
    export function showControllerDialog(container, sandbox){
        var tbody = $("<tbody class=\"setting_tbody\" />");
        var table = $("<table class=\"setting_table\" />").append(tbody);
        var div   = $("<div class=\"setting_div\"></div>").append(table);
        var close = $("<div class=\"button\">閉じる</div>");
        var background = $("<div class=\"dialog_background\"><h3>Box2D 詳細設定</h3></div>").append(div, close);
        
        function control(index, controller){
            var type = controller instanceof Box2D.Dynamics.Controllers.b2BuoyancyController      ? "Buoyancy" :
                       controller instanceof Box2D.Dynamics.Controllers.b2ConstantAccelController ? "ConstantAccel" :
                       controller instanceof Box2D.Dynamics.Controllers.b2ConstantForceController ? "ConstantForce" :
                       controller instanceof Box2D.Dynamics.Controllers.b2GravityController       ? "Gravity" :
                       ("UNKNOWN: " + controller.constructor);
        
            var input = $("<input type=\"number\" class=\"setting_number\" />");
            tbody.append($("<tr />").append($("<td/>").append("[" + index + "]"), $("<td />").append(type)));
        }
        
        function update(sandbox){
            for(var controller = sandbox.world.m_controllerList, i = 0; controller; controller = controller.GetNext(), i++){
                control(i, controller);
            }    
        }
        
        background.click(function(){
            background.fadeOut("normal");
        });
        table.click(function(e){
            e.stopPropagation();
        });

        update(sandbox);
        
        container.append(background);
        background.fadeIn("normal");
    };
}