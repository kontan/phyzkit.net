/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit.GameToolkit{
	export function attachToolButtons(sandbox:Phyzkit.SandBox){
        sandbox.addToolButton(Phyzkit.GameToolkit.createRectTool());
        sandbox.addToolButton(Phyzkit.GameToolkit.createBoxTool(0.2));  
        sandbox.addToolButton(Phyzkit.GameToolkit.createBallTool(0.1));
        sandbox.addToolButton(Phyzkit.GameToolkit.createSimplePolygonTool());
        sandbox.addToolButton(Phyzkit.GameToolkit.createPolygonTransformTool());
        sandbox.addToolButton(Phyzkit.GameToolkit.createPasteTool());
	}
}