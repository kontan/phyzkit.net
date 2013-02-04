function createJointRow(sandbox, joint, parent){
    var div = $("<div class=\"object_list_item\"></div>");
    parent.append(div);
    div.click(function(e){
        if(e.ctrlKey){
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
        div.text("★" + type);
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
        if(e.ctrlKey){
            sandbox.toggleObjectSelection(fixture);
        }else{
            sandbox.selectOneObject(fixture);
        }
        e.stopPropagation();
    });
    function update(){
        div.text("(名前なし)");
        if(fixture.GetShape() instanceof b2PolygonShape){
            div.addClass("shape_polygon");
            div.removeClass("shape_circle");
        }else if(fixture.GetShape() instanceof b2CircleShape){
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
        div_name.text(userData && userData.name ? userData.name : "(名前なし)");
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
        if(e.ctrlKey){
            sandbox.toggleObjectSelection(body);
        }else{
            sandbox.selectOneObject(body);
        }
    });
    tr.dblclick(function(){
        var viewport = sandbox.viewport;
        viewport.pointEasing(body.GetPosition());
    
        var aabb = SANDBOX.getBodyAABB(body);
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

SANDBOX.createObjectListDialog = function(){
    

    var currentBodies = [], currentJoints = [];
    
    function checkUpdate(array, b2listCount, b2list){
        if(array.length != b2listCount){
            return true;
        }
        var i = 0;
        for(var bodies = b2list; bodies; bodies = bodies.GetNext(), i++){
            if(bodies !== array[i].body){
                return true;
            }
        }
        if(i !== array.length){
            return true;
        }
        return false;
    }
    
    
    var panel = SANDBOX.createDropDownPanel("オブジェクト", function(){
    
        var sandbox = panel.sandbox;
        var world = panel.sandbox.world;
    
        // 変更をチェックする。現在のボディのリストとワールドのリストが合致しなければ、全体を再構築する
        if(checkUpdate(currentBodies, world.GetBodyCount(), world.GetBodyList())){
            bodyTbody.children().remove();
            currentBodies = [];
            for(var bodies = world.GetBodyList(), i = 0; bodies; bodies = bodies.GetNext(), i++){
                currentBodies.push(createBodyInfoCell(sandbox, world.GetBodyCount() - 1 - i, bodies, bodyTbody));
            }
        }
        
        // ボディの情報の更新
        currentBodies.forEach(function(bodyInfo){ bodyInfo.update(); });
        
        /*
        if(checkUpdate(currentJoints, world.GetJointCount(), world.GetJointList())){
            jointTbody.children().remove();
            currentJoints = [];
            for(var joints = panel.sandbox.world.GetJointList(), i = 0; joints; joints = joints.GetNext(), i++){
                (function(){
                    var joint = joints;
                    var type = joint instanceof Box2D.Dynamics.Joints.b2DistanceJoint  ? "Distance"   :
                               joint instanceof Box2D.Dynamics.Joints.b2FrictionJoint  ? "Friction"   :
                               joint instanceof Box2D.Dynamics.Joints.b2GearJoint      ? "Gear"       :
                               joint instanceof Box2D.Dynamics.Joints.b2LineJoint      ? "Line"       :
                               joint instanceof Box2D.Dynamics.Joints.b2MouseJoint     ? "MouseJoint" :
                               joint instanceof Box2D.Dynamics.Joints.b2PrismaticJoint ? "Prismatic"  :
                               joint instanceof Box2D.Dynamics.Joints.b2PulleyJoint    ? "Pulley"     :
                               joint instanceof Box2D.Dynamics.Joints.b2RevoluteJoint  ? "Revolute"   :
                               joint instanceof Box2D.Dynamics.Joints.b2WeldJoint      ? "Weld"       : "UNKNOWN";
                               
                    var userData = joint.GetUserData();
                    var name = userData && userData.name ? userData.name : "(名前なし)";
                    var td_name = $("<td class=\"object_list_name\" />").text(name);
                    var tr = $("<tr class=\"object_list_row\"/>").append(
                        $("<td />").text("[" + i + "]"), 
                        $("<td />").text(type + ":"),
                        name
                    );
                    jointTbody.append(tr);
                    tr.click(function(e){
                        if(e.ctrlKey){
                            panel.sandbox.toggleObjectSelection(joint);
                        }else{
                            sandbox.selectOneObject(joint);
                        }
                    });
                    currentJoints.push({
                        body: joint,
                        update: function(){
                            tr.css("background-color", sandbox.selectedJoints.indexOf(joint) < 0 ? "transparent" : "rgba(255,255,255,0.2)");
                        }
                    });
                })();
            }
            
        }
        
        currentJoints.forEach(function(jointInfo){ jointInfo.update(); });

        */
    });
    
    var section = panel.createSection(true);
    
    var bodySection = section.createSubsection("ボディ");
    var bodyTbody = $("<div class=\"object_list_tbody\" />").appendTo(bodySection);
    
    /*
    var jointSection = section.createSubsection("ジョイント");
    var jointTable = $("<table class=\"object_list_table\"  />").appendTo(jointSection);
    var jointThead = $("<thead><tr><th>No.</th><th>種類</th><th>名前</th></tr></thead>").appendTo(jointTable);
    var jointTbody = $("<tbody class=\"object_list_tbody\"  />").appendTo(jointTable);
      */
      
    return panel;
};