/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit.GameToolkit{
    export function createBoxTool(boxSize:number):Tool{
        return {
            tooltip: "木箱：クリックした位置に木箱を作成します",
            toolButtonStyle: "tool_box",
            click: function(e, sandbox){
                if(e.button == 0 && ! e.shiftKey && ! e.ctrlKey && ! e.altKey){                  
                    var body = createImageCrate(sandbox.world, boxSize, sandbox.viewport.toWorldCoords(pointFromEvent(e)));
                    sandbox.clearSelection();
                    sandbox.selectObject(body);
                }
            }
        };
    }; 
}