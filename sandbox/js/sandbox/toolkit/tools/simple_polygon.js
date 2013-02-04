"use strict";


(function(){

    var VERTEX_MARKER_SIZE = 6;
    var TOUCH_RANGE = VERTEX_MARKER_SIZE * 2;    

    function range(p, q){
        return Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
    }
    
    function forEachVertex(polygonShape, callback){
        var vs = polygonShape.GetVertices();
        for(var i = 0; i < polygonShape.GetVertexCount(); i++){
            callback(vs[i], i);
        }
    }
    
    function packVertices(polygonShape){
        var vs = [];
        for(var i = 0; i < polygonShape.GetVertexCount(); i++){
            vs.push(polygonShape.GetVertices()[i].Copy());
        }
        return vs;
    }
    
    // 点 a, b を結ぶ直線を境界とした領域に収まるように、p を丸めます
    function round_plane(a, b, p){
        if( ! a || ! b || ! p){
            throw new TypeError();
        }
        var v = new b2Vec2(b.x - a.x, b.y - a.y);
        var t = new b2Vec2(p.x - a.x, p.y - a.y);
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
            return new b2Vec2(cx, cy);
        }
    }
    
    // 凹多角形ができないように、新規の点の位置を丸めます。
    // a, b, c, d は時計回りの点 vs において vs[0] == a, vs[1] == c, vs[vs.length - 2] == d, vs[vs.length - 1] == c です
    function _round(p, a, b, c, d){
        p = round_plane(a, c, p);
        p = round_plane(d, b, p);
        p = round_plane(a, b, p);
        return p;
    }
    
    // 凹多角形ができないように、新規の点の位置を丸めます。
    function round(vertices, p){
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
    function getCenter(vertices){
        var center = new b2Vec2(0, 0);
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
    function isCounterClockwise(vertices){
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


    Toolkit.createSimplePolygonTool = function(){
        var VERTEX_MARKER_SIZE = 4;
        var vertices = [], mousePoint;

        var that = {
            style: "tool_simple_polygon",     
            tooltip: "ポリゴン：クリックで頂点追加、多角形を閉じるとオブジェクト生成。凸多角形のみ",
            
            select: function(sandbox){
                sandbox.clearSelection();
            },
            
            mousedown: function(event, sandbox){
                if(event.button == 0 && ! event.shiftKey && ! event.ctrlKey && ! event.altKey){
                    mousePoint = SANDBOX.pointFromEvent(event);
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
                        
                            var fixture = Toolkit.SimplePolygon.createFixture(parentBody, vertices);
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
                        
                            var body = Toolkit.SimplePolygon.create(sandbox.world, b2Body.b2_staticBody, vertices);
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
            mousemove: function(event, sandbox){
                if( ! event.shiftKey){
                    mousePoint = SANDBOX.pointFromEvent(event);
                }
            },
            mouseup: function(event, sandbox){
                mousePoint = undefined;
            },
            mouseout: function(){
                mousePoint = undefined;
            },
            paint: function(g, viewport, sandbox){
            
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
                            size = 4;
                        }else{
                            g.fillStyle = "black";                    
                            size = 2;
                        }
                    
                        g.fillRect(p.x - size, p.y - size, size * 2, size * 2);
                    });
                }
            },
            unselect: function(){
                vertices = [];
            }
        };
        return that;
    };
    
    
    Toolkit.createPolygonTransformTool = function(){
        
        var vertices = [], mousePoint, mousedownPoint;
        var activeFixture, initialActiveVertex, initialActiveVertexIndex;
        var selectedVertexIndices = [], initialSelectedVertices = [];
        
        // マウス位置に頂点があるかどうか調べ、あれば
        function processVertex(sandbox){

            return activeFixture;
        }
        
        function addVertex(shape, newVertex, index){

        }
        
        function deleteVertex(shape, index){
            
        }
        
        var that = {
            style: "tool_polygon_edit",     
            tooltip: "ポリゴン編集：ポリゴンフィクスチャの頂点を編集します。２つ以上頂点を選択して S で辺を分割。delete で頂点の削除　",
            
            select: function(sandbox){
                if(sandbox.selectedFixtures.length > 0){
                    var fixture = sandbox.selectedFixtures[0];
                    sandbox.clearSelection();
                    if(fixture.GetShape() instanceof b2PolygonShape){
                        sandbox.selectObject(fixture.GetBody());
                        sandbox.selectObject(fixture);
                    }
                }else if(sandbox.selectedBodies.length > 0){
                    var body = sandbox.selectedBodies[0];
                    sandbox.clearSelection();
                    sandbox.selectObject(body);
                    if(body.GetFixtureList() && body.GetFixtureList().GetShape() instanceof b2PolygonShape){
                        sandbox.selectObject(body.GetFixtureList());
                    }
                }
                selectedVertexIndices = [];
            },
            
            keydown: function(event, sandbox){
                if(activeFixture){
                    var shape = activeFixture.GetShape();
                    
                    if(event.keyCode === 65 /* a */ && event.ctrlKey){
                        // 全選択
                        if(selectedVertexIndices.length === shape.GetVertexCount()){
                            selectedVertexIndices = [];
                        }else{
                            selectedVertexIndices = [];
                            for(var i = 0; i < shape.GetVertexCount(); i++){
                                selectedVertexIndices.push(i);
                            }
                        }
                    }else if(event.keyCode === 83 /* s */){
                        // エッジ分割 /////////////////////////////////////////////////////
                        var vs = packVertices(shape);
                        var newVertices = [];
                        for(var i = 0; i < vs.length; i++){
                            var v = vs[i];
                            newVertices.push(v.Copy()); // ディープコピーしないと変なエラー
                            var k = (i + 1) % vs.length;
                            if(selectedVertexIndices.indexOf(i) >= 0 && selectedVertexIndices.indexOf(k) >= 0){
                                var t = vs[k];
                                newVertices.push(new b2Vec2((v.x + t.x) / 2, (v.y + t.y) / 2));
                            }                        
                        }
                        shape.SetAsArray(newVertices, newVertices.length);
                        selectedVertexIndices = [];
                    }else if(event.keyCode === 46 /* delete */){
                        // 頂点削除 ////////////////////////////////////////////////////////////////////////////
                        var vs = packVertices(activeFixture.GetShape());
                        if(vs.length > 3){
                            // 最低 3 頂点は残す
                            var deleteTargets = selectedVertexIndices.slice(0, Math.max(0, vs.length - 3));
                            var newVertices = [];
                            forEachVertex(shape, function(v, i){ 
                                if(deleteTargets.indexOf(i) < 0){
                                    newVertices.push(v.Copy());     
                                }
                            });
                            shape.SetAsArray(newVertices, newVertices.length);
                            selectedVertexIndices = [];
                        }
                    }
                    
                    var body = activeFixture.GetBody();
                    body.SetPosition(body.GetPosition().Copy());
                }
            },
            
            mousedown: function(event, sandbox){
                if(event.button == 0){
                    mousePoint = SANDBOX.pointFromEvent(event);
                    
                    if(sandbox.selectedFixtures.length > 0){
                        
                        // 変形モード
                        
                        //変形する頂点を探す
                        activeFixture = undefined;
                        initialActiveVertex  = undefined;
                        var body = sandbox.selectedBodies[0];
                        sandbox.selectedFixtures.forEach(function(fixture){
                            var shape = fixture.GetShape();
                            if(shape instanceof b2PolygonShape){
                                forEachVertex(shape, function(vertex, i){
                                    var p = sandbox.viewport.toScreenCoords(body.GetWorldPoint(vertex));
                                    if(mousePoint && range(mousePoint, p) < VERTEX_MARKER_SIZE){
                                        
                                        
                                        // 頂点の移動
                                        activeFixture         = fixture;
                                        initialActiveVertex   = vertex.Copy();
                                        initialActiveVertexIndex = i;
                                        mousedownPoint        = mousePoint.Copy();
                                        
                                        

                                        
                                        if(selectedVertexIndices.length == 0 || (event.ctrlKey && selectedVertexIndices.indexOf(i) < 0)){
                                            selectedVertexIndices.push(i);
                                        }else{
                                            selectedVertexIndices = [];
                                            selectedVertexIndices.push(i);
                                        }
                                        
                                        initialSelectedVertices = [];
                                        for(var i = 0; i < selectedVertexIndices.length; i++){
                                            initialSelectedVertices.push(shape.GetVertices()[selectedVertexIndices[i]].Copy());
                                        }
                                        
                                        return;  
                                        
                                    }                      
                                });
                            }else if(shape instanceof b2CircleShape){
                            
                            }
                        });
                        
                        
                        if( ! activeFixture){
                            // 頂点がなければ fixture の選択
                            var p = sandbox.viewport.toWorldCoords(mousePoint);
                            sandbox.world.QueryPoint(function(fixture){
                                sandbox.clearFixtureSelection();
                                sandbox.selectFixture(fixture);
                            }, p);
                        }
                    }
                }
            },
            mousemove: function(event, sandbox){
                if( ! event.shiftKey){
                    mousePoint = SANDBOX.pointFromEvent(event);
                    if(activeFixture && initialActiveVertex && mousedownPoint){
                        var body = activeFixture.GetBody();
                        var shape = activeFixture.GetShape();
                        var vs = packVertices(shape);
                        
                        selectedVertexIndices.forEach(function(vertexIndex, i){
                            
                        
                            
                            //var target = vs[initialActiveVertexIndex];
                            //var target = ;
                            var p = sandbox.viewport.toScreenCoords(body.GetWorldPoint(initialSelectedVertices[i]));
                            
                            //var p = sandbox.viewport.toScreenCoords(body.GetWorldPoint(initialActiveVertex));
                            p.x += mousePoint.x - mousedownPoint.x;
                            p.y += mousePoint.y - mousedownPoint.y;
                            var lp = body.GetLocalPoint(sandbox.viewport.toWorldCoords(p));
                            lp = _round(lp, 
                                vs[(((initialActiveVertexIndex + 1) % vs.length) + vs.length) % vs.length],
                                vs[(((initialActiveVertexIndex - 1) % vs.length) + vs.length) % vs.length],
                                vs[(((initialActiveVertexIndex + 2) % vs.length) + vs.length) % vs.length],
                                vs[(((initialActiveVertexIndex - 2) % vs.length) + vs.length) % vs.length]
                            );
                            
                            
                            //vs[initialActiveVertexIndex] = lp;
                            vs[vertexIndex] = lp; 
                        });
                        
                        
                        
                        shape.SetAsArray(vs);
                        
                        // *HACK* static body だと頂点を移動してもすぐに AABB に反映されないので、
                        // SetPosition() することで反映する。
                        body.SetPosition(body.GetPosition().Copy());
                    }
                }
            },
            mouseup: function(event, sandbox){
                if( ! event.shiftKey){
                    
                }
                //activeFixture = undefined;
                initialActiveVertex  = undefined;
            },
            mouseout: function(){
                mousePoint = undefined;
                
                //activeFixture = undefined;
                initialActiveVertex  = undefined;
            },
            paint: function(g, viewport, sandbox){
                // Fixture 変形モード
                var body = sandbox.selectedBodies[0];
                sandbox.selectedFixtures.forEach(function(fixture){
                    var shape = fixture.GetShape();
                    if(shape instanceof b2PolygonShape){
                        forEachVertex(shape, function(vertex, i){
                            var p = viewport.toScreenCoords(body.GetWorldPoint(vertex));
                            var active = mousePoint && range(mousePoint, p) < VERTEX_MARKER_SIZE;
                            var s = VERTEX_MARKER_SIZE + (active ? 2 : 0);
                            g.fillStyle = active ? "red" : "rgb(255, 255, 255)";
                            g.fillRect(p.x - s, p.y - s, s * 2, s * 2);
                            g.lineWidth = 1;
                            g.strokeStyle = "black";
                            g.strokeRect(p.x - s, p.y - s, s * 2, s * 2);     
                            if(selectedVertexIndices.indexOf(i) >= 0){
                                g.fillStyle = "black";
                                g.fillRect(p.x - s + 2, p.y - s + 2, s * 2 - 4, s * 2 - 4);  
                            }
                        });
                    }else if(shape instanceof b2CircleShape){
                    
                    }
                });
            }
        };
        return that;
    };
})();