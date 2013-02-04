"use strict";

var Toolkit = {
    attach: function(sandbox){
        sandbox.addToolButton(Toolkit.createRectTool());
        sandbox.addToolButton(Toolkit.createBoxTool(0.2));  
        sandbox.addToolButton(Toolkit.createBallTool(0.1));
        sandbox.addToolButton(Toolkit.createSimplePolygonTool());
        sandbox.addToolButton(Toolkit.createPolygonTransformTool());
        sandbox.addToolButton(Toolkit.createPasteTool());
    }
};