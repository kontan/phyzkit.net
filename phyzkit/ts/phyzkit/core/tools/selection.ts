/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    var SELECTION_RECT_FILL_COLOR   = "rgba(60, 60, 250, 0.6)";
    var SELECTION_RECT_STROKE_COLOR = "rgba(60, 60, 250, 1.0)";

    export function createSelectionTool(){    
        var start, end;
        return {
            toolButtonStyle: "tool_select",
            tooltip: "選択ツール　クリックで物体を選択。ドラッグで範囲を選択（わりと大雑把）。さらにクリックすると Fixture を選択",
            mousedown: function(event:JQueryEventObject, sandbox:SandBox):void{
                var ctrlKey = (<any>event).ctrlKey;
                if(event.which === 1){
                    var mousePointInScreen = pointFromEvent(event);
                    var mousePointInWorld  = sandbox.viewport.toWorldCoords(mousePointInScreen);
                    var clickedFixture    = getFixtureAt(sandbox.world, mousePointInWorld);
                    if(clickedFixture){
                        var body = clickedFixture.GetBody();
                        if(ctrlKey){
                            sandbox.toggleObjectSelection(body);
                        }else{
                            sandbox.clearSelection();
                            sandbox.selectObject(body);
                        }
                    }else{
                        start = mousePointInScreen;
                    }
                }
            },
            mousemove: function(event:JQueryEventObject, sandbox:SandBox):void{
                if(event.which === 1 && ! event.shiftKey){
                    end = pointFromEvent(event);
                }
            },
            mouseup: function(event:JQueryEventObject, sandbox:SandBox):void{
                if(event.which === 1 && ! event.shiftKey && start && end && Math.abs(start.x - end.x) > 10 && Math.abs(start.y - end.y) > 10){
                    if( ! event.ctrlKey){
                        sandbox.clearSelection();
                    }
                    var aabb = new Box2D.Collision.b2AABB();
                    aabb.lowerBound = sandbox.viewport.toWorldCoords(new Box2D.Common.Math.b2Vec2(Math.min(start.x, end.x), Math.max(start.y, end.y)));
                    aabb.upperBound = sandbox.viewport.toWorldCoords(new Box2D.Common.Math.b2Vec2(Math.max(start.x, end.x), Math.min(start.y, end.y)));   // スクリーンだと -y up なのに注意
                    sandbox.world.QueryAABB(function(fixture){
                        sandbox.selectObject(fixture);
                        return true;
                    }, aabb);
                }
                start = undefined;
                end   = undefined;
            },
            mouseout: function():void{
                start = undefined;
                end   = undefined;
            },
            paint: function(g:CanvasRenderingContext2D, viewport:Viewport):void{
                if(start && end){
                    g.fillStyle = SELECTION_RECT_FILL_COLOR;
                    g.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
                    g.lineWidth = 1;
                    g.strokeStyle = SELECTION_RECT_STROKE_COLOR;
                    g.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
                }            
            }
        };
    }
}