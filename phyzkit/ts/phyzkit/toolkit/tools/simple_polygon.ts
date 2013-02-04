/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit.GameToolkit{
    import D = Box2D.Dynamics;
    import M = Box2D.Common.Math;
    import S = Box2D.Collision.Shapes;

    var VERTEX_MARKER_SIZE = 6;
    var TOUCH_RANGE = VERTEX_MARKER_SIZE * 2;    

    interface VertexMoveController{
        pointmove(delta:M.b2Vec2):void;
    }

    function range(p:Box2D.Common.Math.b2Vec2, q:Box2D.Common.Math.b2Vec2):number{
        return Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
    }
    
    function forEachVertex(polygonShape:Box2D.Collision.Shapes.b2PolygonShape, callback:(v:Box2D.Common.Math.b2Vec2,i:number)=>void):void{
        var vs = polygonShape.GetVertices();
        for(var i = 0; i < polygonShape.GetVertexCount(); i++){
            callback(vs[i], i);
        }
    }
    
    function packVertices(polygonShape:Box2D.Collision.Shapes.b2PolygonShape):Box2D.Common.Math.b2Vec2[]{
        var vs = [];
        for(var i = 0; i < polygonShape.GetVertexCount(); i++){
            vs.push(polygonShape.GetVertices()[i].Copy());
        }
        return vs;
    }
    
    // 点 a, b を結ぶ直線を境界とした領域に収まるように、p を丸めます
    function round_plane(a:M.b2Vec2, b:M.b2Vec2, p:M.b2Vec2):Box2D.Common.Math.b2Vec2{
        if( ! a || ! b || ! p){
            throw new TypeError();
        }
        var v = new Box2D.Common.Math.b2Vec2(b.x - a.x, b.y - a.y);
        var t = new Box2D.Common.Math.b2Vec2(p.x - a.x, p.y - a.y);
        var k = v.x * t.y - v.y * t.x;
        if(k > 0){
            // OK
            return p;
        }else{
            // ダメな範囲にある。point との垂線の交点を返す
            var n = (b.y - a.y) / (b.x - a.x);
            var m = 1 / n;
            var cx = (p.y - a.y + n * a.x + m * p.x) / (n + m);
            var cy = (b.y - a.y) / (b.x - a.x) * (cx - a.x) + a.y;
            return new Box2D.Common.Math.b2Vec2(cx, cy);
        }
    }
    
    // 凹多角形ができないように、新規の点の位置を丸めます。
    // a, b, c, d は時計回りの点 vs において vs[0] == a, vs[1] == c, vs[vs.length - 2] == d, vs[vs.length - 1] == c です
    function _round(p:M.b2Vec2, a:M.b2Vec2, b:M.b2Vec2, c:M.b2Vec2, d:M.b2Vec2):M.b2Vec2{
        p = round_plane(a, c, p);
        p = round_plane(d, b, p);
        p = round_plane(a, b, p);
        return p;
    }
    
    // 凹多角形ができないように、新規の点の位置を丸めます。
    function round(vertices:M.b2Vec2[], p:M.b2Vec2):M.b2Vec2{
        // 
        if(vertices.length <= 2){
            return p;
        }else{
            var a = vertices[0];
            var b = vertices[vertices.length - 1];
            var c = vertices[1];
            var d = vertices[vertices.length - 2];
            if(isCounterClockwise(vertices)){
                return _round(p, a, b, c, d);
            }else{
                return _round(p, b, a, d, c);
            }
        }
    }
    
    // 中心を求める
    function getCenter(vertices:M.b2Vec2[]):M.b2Vec2{
        var center = new Box2D.Common.Math.b2Vec2(0, 0);
        for(var i = 0; i < vertices.length; i++){
            center.Add(vertices[i]);
        }
        center.Multiply(1 / vertices.length);
        return center;        
    }
    
    // ワールド座標系で反時計回りに定義されているか調べます。
    // スクリーン座標系は左上原点なので、ワールド座標系で反時計回りの頂点は、
    // スクリーン座標系では時計回りに見えます。
    // 凸多角形でないと未定義です。
    function isCounterClockwise(vertices:M.b2Vec2[]):bool{
        // 中心を求める
        var center = getCenter(vertices);
        
        // 符号付き面積を求める
        var area = 0;
        for(var i = 0; i < vertices.length; i++){
            var p = vertices[i].Copy();
            var q = vertices[(i + 1) % vertices.length].Copy();
            p.Subtract(center);
            q.Subtract(center);
            area += (p.x * q.y) - (q.x * p.y)
        }    
        
        return area > 0;
    }
    
    function paintVertex(graphics:CanvasRenderingContext2D, point:M.b2Vec2, isActive:bool, isSelected:bool):void{
        if( ! (graphics && point)){
            throw "Invalid Argument: paintVertex";
        }        
        var s = VERTEX_MARKER_SIZE + (isActive ? 0 : 0);
        graphics.fillStyle = isActive ? "red" : "rgb(255, 255, 255)";
        graphics.fillRect(point.x - s, point.y - s, s * 2, s * 2);
        graphics.lineWidth = isActive ? 2 : 1;
        graphics.strokeStyle = "black";
        graphics.strokeRect(point.x - s, point.y - s, s * 2, s * 2);     
        if(isSelected){
            graphics.fillStyle = "black";
            graphics.fillRect(point.x - s + 2, point.y - s + 2, s * 2 - 4, s * 2 - 4);  
        }
    }
    
    export function createSimplePolygonTool():Tool{
        var VERTEX_MARKER_SIZE:number = 4;
        var vertices:Box2D.Common.Math.b2Vec2[] = []; 
        var mousePoint:Box2D.Common.Math.b2Vec2;
        return {
            toolButtonStyle: "tool_simple_polygon",     
            tooltip: "ポリゴン：クリックで頂点追加、多角形を閉じるとオブジェクト生成。凸多角形のみ",
            
            select: function(sandbox:SandBox):void{
                sandbox.clearSelection();
            },
            
            mousedown: function(event:JQueryEventObject, sandbox:SandBox):void{
                if(event.button == 0 && ! event.shiftKey && ! event.ctrlKey && ! event.altKey){
                    mousePoint = pointFromEvent(event);
                    var roundedMousePoint = round(vertices, sandbox.viewport.toWorldCoords(mousePoint));
                    var roundedMousePointInScreen = sandbox.viewport.toScreenCoords(roundedMousePoint);
                
                    // Fixture 追加モード
                    if(vertices.length > 2 && range(sandbox.viewport.toScreenCoords(vertices[0]), roundedMousePointInScreen) < TOUCH_RANGE){
                        // 最初の点をクリックしたらポリゴン生成
                    
                        // 頂点の順序が時計回りの可能性があるので、どちらか判定する。
                        // 三角形をなす２つのベクトルの行列式で多角形の面積が求められる
                        // この正負で判定する
                        
                        // 時計回りなら順序を逆にする。
                        if( ! isCounterClockwise(vertices)){
                            vertices = vertices.reverse();
                        }
                        
                        if(sandbox.selectedBodies.length > 0){
                            // 選択されている body があれば、そこに追加する
                            var parentBody = sandbox.selectedBodies[0];
                        
                            vertices = vertices.map(function(v){
                                return parentBody.GetLocalPoint(v);
                            });
                        
                            var fixture = createPolygonFixture(parentBody, vertices);
                            sandbox.clearSelection();
                            sandbox.selectObject(fixture);
                            
                        }else{
                            // 選択されている body がなければ、新規に body も作成する
                            
                            // ローカル中心からの相対座標にする
                            var center = getCenter(vertices);
                            vertices = vertices.map(function(v){
                                v.Subtract(center);
                                return v;
                            });
                        
                            var body = createPolygon(sandbox.world, Box2D.Dynamics.b2Body.b2_staticBody, vertices);
                            body.SetPosition(center);
                            
                            // 後始末
                            sandbox.clearSelection();
                            sandbox.selectObject(body);
                        }
                        
                        vertices = [];
                    }else{
                        vertices.push(round(vertices, sandbox.viewport.toWorldCoords(mousePoint)));
                    }
                }
            },
            mousemove: function(event:JQueryEventObject, sandbox:SandBox):void{
                if( ! event.shiftKey){
                    mousePoint = pointFromEvent(event);
                }
            },
            mouseup: function(event:JQueryEventObject, sandbox:SandBox):void{
                mousePoint = undefined;
            },
            mouseout: function(){
                mousePoint = undefined;
            },
            paint: function(g:CanvasRenderingContext2D, viewport:Viewport, sandbox:SandBox):void{
            
                if(vertices.length > 0){
                    // Fixture 追加モード
                    var points = vertices.map(viewport.toScreenCoords);
                    var rounded_mp = mousePoint ? round(vertices, viewport.toWorldCoords(mousePoint)) : undefined;
                    var s_mp       = rounded_mp ? viewport.toScreenCoords(rounded_mp) : undefined;
                    g.beginPath();
                    points.forEach(function(p, i){
                        g.lineTo(p.x, p.y);
                    });
                    if(s_mp){
                        g.lineTo(s_mp.x, s_mp.y);
                    }
                    g.lineWidth = 4;
                    g.strokeStyle = "green";
                    g.stroke();
                    
                    if(s_mp){
                        var size = 4;
                        g.fillStyle = "yellow";
                        g.fillRect(s_mp.x - size, s_mp.y - size, size * 2, size * 2);
                    }            
                    points.forEach(function(p){
                        var size;
                        
                        if(s_mp && range(s_mp, p) < TOUCH_RANGE){
                            g.fillStyle = "red";
                            size = 2;
                        }else{
                            g.fillStyle = "black";                    
                            size = 2;
                        }
                    
                        g.fillRect(p.x - size, p.y - size, size * 2, size * 2);
                    });
                }
            },
            unselect: function():void{
                vertices = [];
            }
        };
    };


    // controller はマウスクリックから始まってドラッグまでの一連の操作。
    // ドラッグ開始からの移動量を受け取ってアクションを行う
    var controller:VertexMoveController;
    
    function createVertexMoveController(sandbox:SandBox, fixture:D.b2Fixture, selectedVertexIndices):VertexMoveController{
        var shape = fixture.GetShape();
        if(shape instanceof S.b2PolygonShape){
            var polygon = <S.b2PolygonShape> shape;
            var body = fixture.GetBody();
            var selected = [];
            for(var i = 0; i < selectedVertexIndices.length; i++){
                var vertexIndex = selectedVertexIndices[i];
                selected.push({
                    index: vertexIndex,
                    initial: polygon.GetVertices()[vertexIndex].Copy(),
                });
            }
            return {
                pointmove: function(delta){
                    var vs = packVertices(polygon);
                    selected.forEach(function(v){
                        function getV(i:number):Box2D.Common.Math.b2Vec2{
                            return vs[((i % vs.length) + vs.length) % vs.length];
                        }
                        var p = sandbox.viewport.toScreenCoords(body.GetWorldPoint(v.initial));
                        p.x += delta.x;
                        p.y += delta.y;
                        vs[v.index] = _round(body.GetLocalPoint(sandbox.viewport.toWorldCoords(p)), 
                            getV(v.index + 1),
                            getV(v.index - 1),
                            getV(v.index + 2),
                            getV(v.index - 2)
                        );
                    });
                    polygon.SetAsArray(vs, vs.length);
                    
                    // *HACK* static body だと頂点を移動してもすぐに AABB に反映されないので、
                    // SetPosition() することで反映する。
                    body.SetPosition(body.GetPosition().Copy());
                }
            };
        }else{
            return {
                pointmove: function(delta){

                }
            };
        }
        
    }
    
  
    
    export function createPolygonTransformTool():Tool{
        var mousePoint;
        var mousedownPoint;
        
        var selectedVertexIndices = [];
        
        
         // 現在選択されているオブジェクトからエディットポイントを返します。
         // エディットポイントはオブジェクトにより異なります。
         // 例えばポリゴンシェイプのフィクスチャを選択している場合は、そのポリゴンの頂点がエディットポイントになります。
         // また、ボディであればボディの中心、ジョイントであればジョイントのアンカーがエディットポイントになります。
        function getEditablePoints(sandbox){
            var points = [];
            sandbox.selectedObjects.forEach(function(obj){
            
            
                // ボディのエディットポイントはボディの位置で、エディットポイントを移動するとフィクスチャの位置を変更せずに
                // ボディの原点のみを移動します。
                function createBodyEditPoint(body){
                    points.push({
                        pointInScreen: sandbox.viewport.toScreenCoords(body.GetPosition().Copy()),
                        mousedown: function(event){
                            var initialMousePoint = pointFromEvent(event);
                            var lastMousePoint = initialMousePoint.Copy();
                            
                            controller = {
                                // とりあえず直前のマウスポインタの位置との変位から新しいエディットポイントの位置を求めている。
                                // この場合はマウスダウン時に必要な情報を記録しておく必要はないが、
                                // 移動している対象を操作しようとするとエディットポイントとマウスポインタが一致しなくなってしまう
                                // どっちにすべきか迷い中。
                                pointmove: function(delta){
                                    
                                    var currentMousePoint = new Box2D.Common.Math.b2Vec2(
                                        initialMousePoint.x + delta.x,
                                        initialMousePoint.y + delta.y
                                    );
                                    
                                    var d = new Box2D.Common.Math.b2Vec2(
                                        currentMousePoint.x - lastMousePoint.x,
                                        currentMousePoint.y - lastMousePoint.y
                                    );                                  

                                    // フィクスチャの位置を逆方向に移動
                                    //translateFixtures(sandbox, body, new Box2D.Common.Math.b2Vec2(-d.x, -d.y));

                                    // ジョイントのアンカーはボディのローカル座標系なので、該当するアンカーを逆方向に移動
                                    translateJointAnchor(sandbox, body, new Box2D.Common.Math.b2Vec2(-d.x, -d.y));
                                    
                                    // ボディの位置を移動
                                    var bodyPosInScreen = sandbox.viewport.toScreenCoords(body.GetPosition());
                                    body.SetPosition(sandbox.viewport.toWorldCoords(new Box2D.Common.Math.b2Vec2(
                                        bodyPosInScreen.x + d.x,
                                        bodyPosInScreen.y + d.y
                                    )));
                                    
                                    lastMousePoint =   currentMousePoint.Copy();                            
                                }
                            };
                        }
                    });
                }
            
            
                function createFixtureEditPoint(fixture){
                    // フィクスチャのエディットポイント
                    var fixture = obj;    
                    var shape = fixture.GetShape();
                    if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape){
                        forEachVertex(shape, function(vertex, i){
                            var vertexInScreen = sandbox.viewport.toScreenCoords(fixture.GetBody().GetWorldPoint(vertex));
                            points.push({
                                mousedown: function(event){
                                
                                    if(selectedVertexIndices.length == 0 || (event.ctrlKey && selectedVertexIndices.indexOf(i) < 0)){
                                        selectedVertexIndices.push(i);
                                    }else{
                                        selectedVertexIndices = [];
                                        selectedVertexIndices.push(i);
                                    }
                                    
                                    controller = createVertexMoveController(sandbox, fixture, selectedVertexIndices);
                                },
                                pointInScreen: vertexInScreen
                            });
                        });
                    }else if(shape instanceof Box2D.Collision.Shapes.b2CircleShape){
                    
                    }
                }
            
                function createRevoluteJointEditPoint(revoluteJoint){
                    var initialAnchorInScreen = sandbox.viewport.toScreenCoords(revoluteJoint.GetAnchorA());
                    return {
                        mousedown: function(event){
                            controller = {
                                pointmove: function(delta){
                                    var newAnchor      = sandbox.viewport.toWorldCoords(new Box2D.Common.Math.b2Vec2(
                                        initialAnchorInScreen.x + delta.x,
                                        initialAnchorInScreen.y + delta.y
                                    ));
                                    revoluteJoint.m_localAnchor1.SetV(revoluteJoint.GetBodyA().GetLocalPoint(newAnchor.Copy()));
                                    revoluteJoint.m_localAnchor2.SetV(revoluteJoint.GetBodyB().GetLocalPoint(newAnchor.Copy()));
                                    revoluteJoint.m_referenceAngle = revoluteJoint.GetBodyB().GetAngle() - revoluteJoint.GetBodyA().GetAngle();
                                }
                            };
                        },
                        pointInScreen: sandbox.viewport.toScreenCoords(revoluteJoint.GetAnchorA())
                    };
                }     
            
                if(obj instanceof Box2D.Dynamics.b2Body){
                    createBodyEditPoint(obj);
                }else if(obj instanceof Box2D.Dynamics.b2Fixture){
                    createFixtureEditPoint(obj);
                }else if(obj instanceof Box2D.Dynamics.Joints.b2RevoluteJoint){
                    points.push(createRevoluteJointEditPoint(obj)); // AnchorA と AnchorB は同じ？
                }
            });
            return points;
        }       
        
        return {
            toolButtonStyle: "tool_polygon_edit",     
            tooltip: "ポリゴン編集：ポリゴンフィクスチャの頂点を編集します。２つ以上頂点を選択して S で辺を分割。delete で頂点の削除　",
            
            select: function(sandbox){
                if(sandbox.selectedFixtures.length > 0){
                    var fixture = sandbox.selectedFixtures[0];
                    sandbox.clearSelection();
                    if(fixture.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape){
                        sandbox.selectObject(fixture.GetBody());
                        sandbox.selectObject(fixture);
                    }
                }else if(sandbox.selectedBodies.length > 0){
                    var body = sandbox.selectedBodies[0];
                    sandbox.clearSelection();
                    sandbox.selectObject(body);
                    if(body.GetFixtureList() && body.GetFixtureList().GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape){
                        sandbox.selectObject(body.GetFixtureList());
                    }
                }
                selectedVertexIndices = [];
            },
            
            keydown: function(event, sandbox){
                var keyCode = (<any> event).keyCode;
                var fixtures:Box2D.Dynamics.b2Fixture[] = sandbox.selectedFixtures;
                if(fixtures.length > 0){
                    var activeFixture = fixtures[0];
                    var shape = activeFixture.GetShape();
                    if(shape instanceof Box2D.Collision.Shapes.b2PolygonShape){
                        var polygon = <Box2D.Collision.Shapes.b2PolygonShape> shape;
                        if(keyCode === 65 /* a */ && event.ctrlKey){
                            // 全選択
                            if(selectedVertexIndices.length === polygon.GetVertexCount()){
                                selectedVertexIndices = [];
                            }else{
                                selectedVertexIndices = [];
                                for(var i = 0; i < polygon.GetVertexCount(); i++){
                                    selectedVertexIndices.push(i);
                                }
                            }
                        }else if(keyCode === 83 /* s */){
                            // エッジ分割 /////////////////////////////////////////////////////
                            var vs = packVertices(polygon);
                            var newVertices = [];
                            for(var i = 0; i < vs.length; i++){
                                var v = vs[i];
                                newVertices.push(v.Copy()); // ディープコピーしないと変なエラー
                                var k = (i + 1) % vs.length;
                                if(selectedVertexIndices.indexOf(i) >= 0 && selectedVertexIndices.indexOf(k) >= 0){
                                    var t = vs[k];
                                    newVertices.push(new Box2D.Common.Math.b2Vec2((v.x + t.x) / 2, (v.y + t.y) / 2));
                                }                        
                            }
                            polygon.SetAsArray(newVertices, newVertices.length);
                            selectedVertexIndices = [];
                        }else if(keyCode === 46 /* delete */){
                            // 頂点削除 ////////////////////////////////////////////////////////////////////////////
                            var vs = packVertices(polygon);
                            if(vs.length > 3){
                                // 最低 3 頂点は残す
                                var deleteTargets = selectedVertexIndices.slice(0, Math.max(0, vs.length - 3));
                                var newVertices = [];
                                forEachVertex(polygon, function(v, i){ 
                                    if(deleteTargets.indexOf(i) < 0){
                                        newVertices.push(v.Copy());     
                                    }
                                });
                                polygon.SetAsArray(newVertices, newVertices.length);
                                selectedVertexIndices = [];
                            }
                        }
                        
                        var body = activeFixture.GetBody();
                        body.SetPosition(body.GetPosition().Copy());
                    }
                }
            },
            
            mousedown: function(event, sandbox){
                if(event.button == 0){
                    mousedownPoint = pointFromEvent(event);
                    
                    // 現在のエディットポイントからクリックした位置にあるものを探して mousedown ハンドラを呼び出す
                    var pointClicked = false;
                    getEditablePoints(sandbox).forEach(function(editablePoint){
                        var pointInScreen = editablePoint.pointInScreen;
                        if(mousedownPoint && range(mousedownPoint, pointInScreen) < VERTEX_MARKER_SIZE){
                            editablePoint.mousedown(event);
                            pointClicked = true;
                        }
                    });
                    
                    // クリックしたエディットポイントがない場合は、その位置にフィクスチャがあればそれを選択
                    /*
                    if( ! pointClicked){
                        sandbox.world.QueryPoint(function(fixture){
                            sandbox.clearSelection();
                            sandbox.selectObject(fixture);
                            return false;
                        }, sandbox.viewport.toWorldCoords(mousedownPoint));
                    }
                    */
                }
            },
            mousemove: function(event, sandbox){
                mousePoint = pointFromEvent(event);
                if(controller){
                    var delta = new Box2D.Common.Math.b2Vec2(
                        mousePoint.x - mousedownPoint.x,
                        mousePoint.y - mousedownPoint.y
                    );
                    controller.pointmove(delta);
                }
            },
            mouseup: function(event, sandbox){
                controller = undefined;
                mousedownPoint = undefined;
            },
            mouseout: function(){
                mousePoint = undefined;
                controller = undefined;
                mousedownPoint = undefined;
            },
            paint: function(g, viewport, sandbox){
                getEditablePoints(sandbox).forEach(function(editablePoint, i){
                    var point = editablePoint.pointInScreen;
                    paintVertex(g, point, mousePoint && range(mousePoint, point) < VERTEX_MARKER_SIZE * 2, selectedVertexIndices.indexOf(i) >= 0);
                });
            }
        };
    };
}