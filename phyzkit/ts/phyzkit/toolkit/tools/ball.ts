/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit.GameToolkit{
    export function createBallTool(radius:number):Tool{
        if( ! radius) radius = 0.1;
        return {
            tooltip: "ボール：クリックした位置にボールを作成します",
            toolButtonStyle: "tool_ball",
            click: function(e:JQueryEventObject, sandbox:SandBox){
                if(e.button == 0 && ! e.shiftKey && ! e.ctrlKey && ! e.altKey){                  
                    var body = Phyzkit.GameToolkit.createBall(sandbox.world, radius, sandbox.viewport.toWorldCoords(pointFromEvent(e)));
                    sandbox.clearSelection();
                    sandbox.selectObject(body);
                }
            }
        };
    }; 
}