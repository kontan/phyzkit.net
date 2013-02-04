/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    function createJointRow(sandbox:SandBox, joint:Box2D.Dynamics.Joints.b2Joint, parent:JQuery){
        var div = $("<div class=\"object_list_item\"></div>");
        parent.append(div);
        div.click(function(e){
            var ctrlKey:bool = (<any>e).ctrlKey;
            if(ctrlKey){
                sandbox.toggleObjectSelection(joint);
            }else{
                sandbox.selectOneObject(joint);
            }
            e.stopPropagation();
        });
        function update(){
            var type =  joint instanceof Box2D.Dynamics.Joints.b2DistanceJoint  ? "Distance"   :
                        joint instanceof Box2D.Dynamics.Joints.b2FrictionJoint  ? "Friction"   :
                        joint instanceof Box2D.Dynamics.Joints.b2GearJoint      ? "Gear"       :
                        joint instanceof Box2D.Dynamics.Joints.b2LineJoint      ? "Line"       :
                        joint instanceof Box2D.Dynamics.Joints.b2MouseJoint     ? "MouseJoint" :
                        joint instanceof Box2D.Dynamics.Joints.b2PrismaticJoint ? "Prismatic"  :
                        joint instanceof Box2D.Dynamics.Joints.b2PulleyJoint    ? "Pulley"     :
                        joint instanceof Box2D.Dynamics.Joints.b2RevoluteJoint  ? "Revolute"   :
                        joint instanceof Box2D.Dynamics.Joints.b2WeldJoint      ? "Weld"       : "UNKNOWN";
            var typeLabel = "★" + type;
            if(div.text() !== typeLabel){
                div.text(typeLabel);
            }
            if(sandbox.isSelected(joint)){
                div.addClass("object_selected");
            }else{
                div.removeClass("object_selected");
            }
        }
        update();
        return {
            object: joint,
            update: update
        };
    }

    function createFixtureRow(sandbox, fixture, parent){
        var div = $("<div class=\"object_list_item object_fixture\"></div>");
        parent.append(div);
        div.click(function(e){
            var ctrlKey:bool = (<any>e).ctrlKey;
            if(ctrlKey){
                sandbox.toggleObjectSelection(fixture);
            }else{
                sandbox.selectOneObject(fixture);
            }
            e.stopPropagation();
        });
        function update(){
            var userData = fixture.GetUserData();
            var name = userData && userData.name ? userData.name : "(名前なし)";
            if(div.text() !== name){
                div.text(name);
            }
            if(fixture.GetShape() instanceof S.b2PolygonShape){
                div.addClass("shape_polygon");
                div.removeClass("shape_circle");
            }else if(fixture.GetShape() instanceof S.b2CircleShape){
                div.addClass("shape_circle");
                div.removeClass("shape_polygon");
            }else{
                div.removeClass("shape_circle");
                div.removeClass("shape_polygon");
            }
            if(sandbox.isSelected(fixture)){
                div.addClass("object_selected");
            }else{
                div.removeClass("object_selected");
            }
        }
        update();
        return { object: fixture, update: update };
    }

    function createBodyInfoCell(sandbox, bodyIndex, body, parent){
        var userData = body.GetUserData();
        var name = userData && userData.name ? userData.name : "(名前なし)";
        var tracking = $("<input type=\"checkbox\" />");

        var div_num      = $("<div style=\"float:left;\" />").text("[" + bodyIndex + "]");
        var div_name     = $("<div style=\"float:left;\" class=\"object_list_name\"  />").text(name);
        var div_expand   = $("<div style=\"float:left;\" class=\"object_list_name\">▲</div>");
        var div_clear    = $("<div style=\"clear:both;\" />");
        var div_body     = $("<div />").append(div_expand, div_num, div_name, div_clear);
        var div_fixtures = $("<div style=\"padding-left:40px;\" />");
        var tr = $("<div class=\"object_list_row\" />").append(div_body, div_fixtures);
        
        var childInfo = []; 
        

        
        function updateBodyRow(){
        
            // フィクスチャやジョイントの構成に変化があれば作り直す
            if((function(){
                if(div_fixtures.css("display") === "none"){
                    return false;
                }
            
                var index = 0;
                for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext(), index++){
                    if(index >= childInfo.length || fixtureList !== childInfo[index].object){
                        return true;
                    }
                }
                for(var jointList = body.GetJointList(); jointList; jointList = jointList.next, index++){
                    if(index >= childInfo.length || jointList.joint !== childInfo[index].object){
                        return true;
                    }
                }
                if(index != childInfo.length){
                    return true;
                }
                return false;
            })()){
                childInfo = [];
                div_fixtures.children().remove();
                for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext()){
                    childInfo.push(createFixtureRow(sandbox, fixtureList, div_fixtures));
                }
                for(var jointEdge = body.GetJointList(); jointEdge; jointEdge = jointEdge.next){
                    childInfo.push(createJointRow(sandbox, jointEdge.joint, div_fixtures));
                }                       
            }
                
            
        
            childInfo.forEach(function(frow){ frow.update(); });
            
            var userData = body.GetUserData();
            var name = userData && userData.name ? userData.name : "(名前なし)";
            if(div_name.text() !== name){
                div_name.text(name);
            }
            if(sandbox.isSelected(body)){
                div_body.addClass("object_selected");
            }else{
                div_body.removeClass("object_selected");
            }                        
        }
        
        div_expand.click(function(){
            div_fixtures.slideToggle("normal", function(){
                div_expand.text(div_fixtures.css("display") === "none" ? "▼" : "▲");
            });                        
        });
        
        tr.mouseover(function(e){
            sandbox.clearPseudoSelection();
            sandbox.pseudoSelectBody(body);
            e.stopPropagation();
        });
        
        tr.click(function(e){
            var ctrlKey:bool = (<any>e).ctrlKey;
            if(ctrlKey){
                sandbox.toggleObjectSelection(body);
            }else{
                sandbox.selectOneObject(body);
            }
        });
        
        tr.dblclick(function(){
            var viewport = sandbox.viewport;
            viewport.pointEasing(body.GetPosition());
        
            var aabb = Phyzkit.getBodyAABB(body);
            if(aabb){
                var size = Math.max(
                    aabb.upperBound.x - aabb.lowerBound.x,
                    aabb.upperBound.y - aabb.lowerBound.y
                );
                var view = Math.min(viewport.canvas.width(), viewport.canvas.height());
                var scale = 0.4 * view / size; 
                viewport.cameraEasing = viewport.cameraEasing.setScale(scale);
            }
        });
        parent.prepend(tr);
        
        updateBodyRow();
        
        return {
            body: body,
            update: updateBodyRow
        };
    }

    export function createObjectListDialog():DropDownPanel{
        

        var currentBodies = [], currentJoints = [];
        
        function checkUpdate(array, bodies){
            if(array.length !== bodies.length){
                return true;
            }
            for(var i = 0; i < bodies.length; i++){
                if(bodies[i] !== array[i].body){
                    return true;
                }
            }
            return false;
        }
        
        
        var panel:DropDownPanel = new Phyzkit.DropDownPanel("オブジェクト", function(){
        
            var sandbox = panel.sandbox;
            var viewport = sandbox.viewport;
            var canvas   = viewport.canvas;
            var world = panel.sandbox.world;
            
            var bodies = [];
            //for(var bodyList = world.GetBodyList(); bodyList; bodyList = bodyList.GetNext()){
             //   bodies.push(bodyList);
            //}
            
            var viewportAABB = new C.b2AABB();
            viewportAABB.lowerBound = viewport.toWorldCoords(new M.b2Vec2(0, canvas.height()));
            viewportAABB.upperBound = viewport.toWorldCoords(new M.b2Vec2(canvas.width(), 0));
            world.QueryAABB(function(fixture){
                var body = fixture.GetBody();
                if(bodies.indexOf(body) < 0){
                    bodies.push(body);
                }
                return true;
            }, viewportAABB);
        
            // 変更をチェックする。現在のボディのリストとワールドのリストが合致しなければ、全体を再構築する
            if(checkUpdate(currentBodies, bodies)){
                bodyContentPane.children().remove();
                currentBodies = [];
                for(var i = 0; i < bodies.length; i++){
                    currentBodies.push(createBodyInfoCell(sandbox, world.GetBodyCount() - 1 - i, bodies[i], bodyContentPane));
                }
            }
            
            // ボディの情報の更新
            currentBodies.forEach(function(bodyInfo){ bodyInfo.update(); });
        });
        
        var section = panel.createSection(true);
        
        var optionSection = section.createSubsection("オプション");
        optionSection.append("<input type=\"checkbox\"></input>ビューポート内");
        
        var bodySection = section.createSubsection("ボディ");
        var bodyContentPane = $("<div class=\"object_list_tbody\" />").appendTo(bodySection);
        
        return panel;
    }
}