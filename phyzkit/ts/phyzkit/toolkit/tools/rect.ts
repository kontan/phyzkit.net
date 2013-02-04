/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit.GameToolkit{
    export function createRectTool():Tool{
        var start, end;
        var that = {
            toolButtonStyle: "tool_rect",     
            tooltip: "矩形：ドラッグして矩形ポリゴンを作成します。",
            mousedown: function(event){
                if(event.button == 0 && ! event.shiftKey && ! event.ctrlKey && ! event.altKey){
                    start = pointFromEvent(event);
                }
            },
            mousemove: function(event){
                if( ! event.shiftKey){
                    end = pointFromEvent(event);
                }
            },
            mouseup: function(event, sandbox){
                if(event.button == 0 && ! event.shiftKey && start && end && Math.abs(start.x - end.x) > 10 && Math.abs(start.y - end.y) > 10){
                    var s = sandbox.viewport.toWorldCoords(start);
                    var e = sandbox.viewport.toWorldCoords(end);
                    var cx = (s.x + e.x) / 2;
                    var cy = (s.y + e.y) / 2;  
                    var hw = Math.abs(e.x - s.x) / 2;
                    var hh = Math.abs(e.y - s.y) / 2;

                    var body = createPolygon(sandbox.world, Box2D.Dynamics.b2Body.b2_staticBody, [
                        new Box2D.Common.Math.b2Vec2(-hw, -hh),
                        new Box2D.Common.Math.b2Vec2(+hw, -hh),
                        new Box2D.Common.Math.b2Vec2(+hw, +hh),
                        new Box2D.Common.Math.b2Vec2(-hw, +hh)
                    ]);
                    body.SetPosition(new Box2D.Common.Math.b2Vec2(cx, cy));
                    
                    sandbox.clearSelection();
                    sandbox.selectObject(body);
                }
                start = undefined;
                end = undefined;
            },
            mouseout: function(){
                start = undefined;
                end = undefined;
            },
            paint: function(g){
                if(start && end){
                    g.fillStyle = "rgba(60, 60, 250, 0.6)";
                    g.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
                }
            }
        };
        return that;
    };
}