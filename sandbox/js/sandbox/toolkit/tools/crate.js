"use strict";

Toolkit.createBoxTool = function(boxSize){
    return {
        tooltip: "木箱：クリックした位置に木箱を作成します",
        style: "tool_box",
        click: function(e, sandbox){
            if(e.button == 0 && ! e.shiftKey && ! e.crtlKey && ! e.altKey){                  
                var body = Toolkit.Crate.create(sandbox.world, boxSize, sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(e)));
                sandbox.clearSelection();
                sandbox.selectObject(body);
            }
        }
    };
}; 