"use strict";

Toolkit.createRectTool = function(){
    var start, end;
    var that = {
        style: "tool_rect",     
        tooltip: "矩形：ドラッグして矩形ポリゴンを作成します。",
        mousedown: function(event){
            if(event.button == 0 && ! event.shiftKey && ! event.ctrlKey && ! event.altKey){
                start = SANDBOX.pointFromEvent(event);
            }
        },
        mousemove: function(event){
            if( ! event.shiftKey){
                end = SANDBOX.pointFromEvent(event);
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

                var body = Toolkit.SimplePolygon.create(sandbox.world, b2Body.b2_staticBody, [
                    new b2Vec2(-hw, -hh),
                    new b2Vec2(+hw, -hh),
                    new b2Vec2(+hw, +hh),
                    new b2Vec2(-hw, +hh)
                ]);
                body.SetPosition(new b2Vec2(cx, cy));
                
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
