"use strict";

SANDBOX.createPropertyTool = function(){
    var targetBody;
    return {
        style: "tool_property", 
        tooltip: "プロパティ",
        
        select: function(sandbox){
            sandbox.selectedBodies.splice(0, sandbox.selectedBodies.length - 1);
            sandbox.propertyDialog.show();
        },
        
        unselect: function(sandbox){
            //sandbox.propertyDialog.hide();
        },
        
        click: function(event, sandbox){
            sandbox.propertyDialog.body = undefined;
            SANDBOX.getBodyAt(sandbox.world, sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event)), function(body, fixture){
                sandbox.selectedBodies[0] = body;

            });
            if(sandbox.selectedBodies.length > 0){
                sandbox.propertyDialog.body = sandbox.selectedBodies[0];
            }
        }
    };
};