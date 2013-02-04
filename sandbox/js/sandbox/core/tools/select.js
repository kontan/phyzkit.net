"use strict";

SANDBOX.createSelectionTool = function(){    
    var start, end;
    return {
        style: "tool_select",
        tooltip: "選択ツール　クリックで物体を選択。ドラッグで範囲を選択（わりと大雑把）。さらにクリックすると Fixture を選択",
        mousedown: function(event, sandbox){
            if(event.button === 0){
                var p = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(event));
                

                // Get clicket body
                var body = undefined;
                var selectedFixture = undefined;
                sandbox.world.QueryPoint(function(fixture){
                    selectedFixture = fixture;
                    body = fixture.GetBody();
                    return false; /* first fixture only */
                }, p);
                

                if(body && (event.shiftKey || event.ctrlKey)){
                    sandbox.toggleObjectSelection(body);
                }else if(sandbox.selectedBodies.length !== 1 || sandbox.selectedBodies[0] !== body){ 
                    sandbox.clearSelection();
                    if(body){
                        sandbox.selectObject(body);
                    }
                }
                
                if(sandbox.selectedBodies.length === 1 && sandbox.selectedBodies[0] === body){
                    sandbox.toggleObjectSelection(selectedFixture);
                }

                if( ! event.shiftKey){
                    start = SANDBOX.pointFromEvent(event);
                }
            }
        },
        mousemove: function(event, sandbox){
            if(event.button === 0 && ! event.shiftKey){
                end = SANDBOX.pointFromEvent(event);
            }
        },
        mouseup: function(event, sandbox){
            if(event.button === 0 && ! event.shiftKey && start && end && Math.abs(start.x - end.x) > 10 && Math.abs(start.y - end.y) > 10){
                sandbox.clearSelection();
                
                var aabb = new Box2D.Collision.b2AABB();
                aabb.lowerBound = sandbox.viewport.toWorldCoords(new b2Vec2(Math.min(start.x, end.x), Math.min(start.y, end.y)));
                aabb.upperBound = sandbox.viewport.toWorldCoords(new b2Vec2(Math.max(start.x, end.x), Math.max(start.y, end.y)));
                sandbox.world.QueryAABB(function(fixture){
                    sandbox.selectBody(fixture.GetBody());
                    return true;
                }, aabb);
            }
            start = undefined;
            end = undefined;
        },
        mouseout: function(){
            start = undefined;
            end = undefined;
        },
        paint: function(g, viewport){
            if(start && end){
                g.fillStyle = "rgba(60, 60, 250, 0.6)";
                g.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
            }            
        }
    };
};