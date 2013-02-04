"use strict";

Toolkit.createBallTool = function(radius){
    if( ! radius) radius = 0.1;
    return {
        tooltip: "ボール：クリックした位置にボールを作成します",
        style: "tool_ball",
        click: function(e, sandbox){
            if(e.button == 0 && ! e.shiftKey && ! e.crtlKey && ! e.altKey){                  
                var body = Toolkit.SimpleBall.create(sandbox.world, radius, sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(e)));
                sandbox.clearSelection();
                sandbox.selectObject(body);
            }
        }
    };
}; 