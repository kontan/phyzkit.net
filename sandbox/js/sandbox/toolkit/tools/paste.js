"use strict";

Toolkit.createPasteTool = function(){
    return {
        tooltip: "貼り付け：クリックした位置に現在のクリップボードの内容を貼り付けます",
        style: "tool_paste",
        click: function(e, sandbox){
            if(e.button == 0 && ! e.shiftKey && sandbox.clipboard.length > 0){                  
                var point = sandbox.viewport.toWorldCoords(SANDBOX.pointFromEvent(e));
                

                var bodies = sandbox.clipboard.map(function(data){
                    var body = SANDBOX.deserializeAndCreateBody(sandbox.world, data);
                    body.SetAwake(true);
                    body.SetActive(true);
                    return body;
                });


                var tx = point.x - bodies[0].GetPosition().x;
                var ty = point.y - bodies[0].GetPosition().y;
                
                bodies.forEach(function(body, i){
                    var pos = body.GetPosition();
                    body.SetPosition(new b2Vec2(
                        pos.x + tx,
                        pos.y + ty
                    ));
                });
                
                //sandbox.clearSelection();
                //sandbox.selectBody(body);
            }
        }
    };
}; 