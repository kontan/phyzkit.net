"use strict";

SANDBOX.showBodyList = function(viewport, container, world, onClose, sandbox){
    var tbody = $("<tbody/>");
    
    function update(){
        tbody.empty();
        for(var bodyList = world.GetBodyList(), i = 0; bodyList; bodyList = bodyList.GetNext(), i++){ 
            (function(){
                var body = bodyList;
                var userData = body.GetUserData();
                var pos = body.GetPosition();
                var name = userData && userData.name ? userData.name : "(名前なし)";
                var button_name = $("<input type=\"button\"></input").css("width", "8em").val(name);
                var td_num  = $("<td/>").text(SANDBOX.paddingLeft(4, i) + ":").css("text-align", "right");
                var td_name = $("<td/>").append(button_name);
                var td_pos  = $("<td/>").text("(" + SANDBOX.formatNumber(pos.x) + ", " + SANDBOX.formatNumber(pos.y) + ")");
                td_name.click(function(){
                    viewport.pointEasing(body.GetPosition());
                    SANDBOX.showPropertyDialog(body, update);
                });
                td_name.mouseover(function(){
                    sandbox.focused = body;
                });
                var del = $("<input type=\"button\" value=\"削除\" />");
                del.click(function(){
                    world.DestroyBody(body);
                    update();
                });
                tbody.append($("<tr/>").append(td_num, td_name, td_pos, del));
            })();
        }
    }
    
    function close(){
        background.fadeOut("normal", function(){
            background.remove();
            if(onClose){
                onClose();
            }
        });
    }
    
    update();
    
    var closeButton = $("<div class=\"tool_button button\">閉じる</div>");
    closeButton.click(close);

    var background = $("<div class=\"dialog_background\"></div>");
    background.css("width",  "300px");
    background.append("<h3>物体の一覧</h3>");    
    background.append($("<table/>").append(tbody));    
    background.append(closeButton);
    
    container.append(background);
    background.fadeIn("normal");
    
    return { 
        close: function(){
    
        },
        paint: function(){
        
        }
    };
};