"use strict";

SANDBOX.createDeleteTool = function(){
    return {
        style: "tool_delete",   
        tooltip: "削除ツール",
        click: function(event, sandbox){
            var p = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
            sandbox.world.QueryPoint(function(fixture){
                sandbox.world.DestroyBody(fixture.GetBody());
                return false; /* first fixture only */
            }, p);
        }
    };
};