/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    export interface Tool{
        toolButtonStyle:string;
        tooltip:string;
        click     ?(e:JQueryEventObject, sandbox:SandBox):void;
        mousedown ?(e:JQueryEventObject, sandbox:SandBox):void;
        mousemove ?(e:JQueryEventObject, sandbox:SandBox):void;
        mouseup   ?(e:JQueryEventObject, sandbox:SandBox):void;
        mouseout  ?(e:JQueryEventObject, sandbox:SandBox):void;
        keydown   ?(e:JQueryEventObject, sandbox:SandBox):void;
        paint     ?(g:CanvasRenderingContext2D, viewport:Viewport, sandbox:SandBox):void;
        paintWorld?(g:CanvasRenderingContext2D):void;
        select    ?(sandbox:SandBox):void;
        unselect  ?(sandbox:SandBox):void;
    }
}