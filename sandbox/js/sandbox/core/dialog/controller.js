SANDBOX.showControllerDialog = function(container, sandbox){
    var tbody = $("<tbody class=\"setting_tbody\" />");
    var table = $("<table class=\"setting_table\" />").append(tbody);
    var div   = $("<div class=\"setting_div\"></div>").append(table);
    var close = $("<div class=\"button\">閉じる</div>");
    var background = $("<div class=\"dialog_background\"><h3>Box2D 詳細設定</h3></div>").append(div, close);
    
    function control(index, contoller){
        var type = controller instanceof b2BuoyancyController      ? "Buoyancy" :
                   controller instanceof b2ConstantAccelController ? "ConstantAccel" :
                   controller instanceof b2ConstantForceController ? "ConstantForce" :
                   controller instanceof b2GravityController       ? "Gravity" :
                   ("UNKNOWN: " + contoller.constructor);
    
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