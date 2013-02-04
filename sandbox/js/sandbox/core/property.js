"use strict";

SANDBOX.createPropertyDialog = function(){
    var panel = SANDBOX.createDropDownPanel("プロパティ", function(){
        if(getBody() && ! bodyOuterSection.display){
            bodyOuterSection.slideDown();
        }else if( ( ! getBody()) && bodyOuterSection.display){
            bodyOuterSection.slideUp();
        }
        updateProperty();
    });

    //// root /////////////////////////////////////////////////////////////////////////////////////
    var bodyOuterSection = panel.createSection();
    
    var bodySection = bodyOuterSection.createSubsection("ボディプロパティ");
    var table = $("<table />").appendTo(bodySection);
    var tbody = $("<tbody />").appendTo(table);

    var fixturePropertyList = [];
    
    //// name /////////////////////////////////////////////////////////////////////////////////    
    var name  = SANDBOX.createStringProperty(tbody, "名前", function(value){ 
        if(getBody()){
            if( ! getBody().GetUserData()){
                getBody().SetUserData({});
            }
            getBody().GetUserData().name = value; 
        }
    }, function(){
        var userData = getBody().GetUserData();
        return (userData && userData.name) ? userData.name : "";
    });    
    name.input.addClass("property_body_name");
    
    //// bodytype //////////////////////////////////////////////////////////////////////////
    var bodyType = SANDBOX.createEnumEditor(tbody, "種類", 
        [
            { type: b2Body.b2_staticBody,    text: "静的" },
            { type: b2Body.b2_kinematicBody, text: "運動学的" },
            { type: b2Body.b2_dynamicBody,   text: "動的" }
        ], 
        function(value){
            getBody().SetType(parseFloat(value));
        }, 
        function(inputs){
            inputs.forEach(function(input){
                input.removeAttr("checked");
            });
            $(".bodyType_" + getBody().GetType()).attr("checked", "checked");
        }
    );
    
    /////// other numeric propaties ////////////////////////////////////////////////////////////////////
    function setMass(value){
        if(getBody()){
            var m = new b2MassData();
            getBody().GetMassData(m);
            m.mass = parseFloat(value); 
            getBody().SetMassData(m);
        }    
    }
    
    
    
    
    var mass       = SANDBOX.createNumericProperty("質量",       0.1, function(value){ setMass(value);},                                                                   tbody, function(){ return getBody().GetMass(); } );
    // body.GetPosition().x だけ変更してもうまくいかない。b2Vec2 を作りなおして代入する必要があるらしい
    var position_x = SANDBOX.createNumericProperty("位置.X",     0.1, function(value){ getBody().SetPosition(new b2Vec2(value, getBody().GetPosition().y)); },             tbody, function(){ return getBody().GetPosition().x; }); 
    var position_y = SANDBOX.createNumericProperty("位置.Y",     0.1, function(value){ getBody().SetPosition(new b2Vec2(getBody().GetPosition().x, value)); },             tbody, function(){ return getBody().GetPosition().y; });
    var angle      = SANDBOX.createNumericProperty("角度",       5.0, function(value){ getBody().SetAngle(Math.PI * value / 180); },                                       tbody, function(){ return 180 * getBody().GetAngle() / Math.PI; });
    var velocity_x = SANDBOX.createNumericProperty("速度.X",     0.1, function(value){ getBody().SetLinearVelocity(new b2Vec2(value, getBody().GetLinearVelocity().y)); }, tbody, function(){ return getBody().GetLinearVelocity().x; });
    var velocity_y = SANDBOX.createNumericProperty("速度.Y",     0.1, function(value){ getBody().SetLinearVelocity(new b2Vec2(getBody().GetLinearVelocity().x, value)); }, tbody, function(){ return getBody().GetLinearVelocity().y; });
    var angular_v  = SANDBOX.createNumericProperty("角速度",     0.1, function(value){ getBody().SetAngularVelocity(value); },                                             tbody, function(){ return getBody().GetAngularVelocity(); });
    var linear_d   = SANDBOX.createNumericProperty("移動抵抗",   0.1, function(value){ getBody().SetLinearDamping(value); },                                               tbody, function(){ return getBody().GetLinearDamping(); });
    var angular_d  = SANDBOX.createNumericProperty("回転抵抗",   0.1, function(value){ getBody().SetAngularDamping(value); },                                              tbody, function(){ return getBody().GetAngularDamping(); });
    var fixed_rot  = SANDBOX.createBooleanProperty("回転の固定",      function(value){ getBody().SetFixedRotation(value); },                                               tbody, function(){ return getBody().IsFixedRotation();  });
    var bullet     = SANDBOX.createBooleanProperty("弾丸",            function(value){ getBody().SetBullet(value); },                                                      tbody, function(){ return getBody().IsBullet(); });
    var sleep      = SANDBOX.createBooleanProperty("スリープ可",      function(value){ getBody().SetSleepingAllowed(value); },                                             tbody, function(){ return getBody().IsSleepingAllowed(); });
    var awake      = SANDBOX.createBooleanProperty("覚醒",            function(value){ getBody().SetAwake(value); },                                                       tbody, function(){ return getBody().IsAwake(); });
    var active     = SANDBOX.createBooleanProperty("アクテイブ",      function(value){ getBody().SetActive(value); },                                                      tbody, function(){ return getBody().IsActive(); });

    
    
    
    function updateProperty(){
        if(getBody() && panel.root.css("display") !== "none"){
            var body = getBody();
            var userData = body.GetUserData();
            var focused = $(":focus").get(0);
            //name.val((userData && userData.name) ? userData.name : "");
            name.update();
            bodyType.update();
            mass      .update();
            position_x.update();
            position_y.update();
            angle     .update();
            velocity_x.update();
            velocity_y.update();
            angular_v .update();
            linear_d  .update();
            angular_d .update();
            fixed_rot .update();
            bullet    .update();
            sleep     .update();
            awake     .update();
            active    .update();
            
            // fixture のリストに変化があれば、いったんすべて削除する
            for(var fixtureList = getBody().GetFixtureList(), i = 0; fixtureList; fixtureList = fixtureList.GetNext(), i++){
                if(i >= fixturePropertyList.length || fixtureList !== fixturePropertyList[i].fixture){
                    // すべて削除
                    $(".fixture_property").remove();     
                    fixturePropertyList = [];               
                    break;
                }
            }
                   
            // fixture プロパティがなければ作成
            if($(".fixture_property").length == 0){
                for(var fixtureList = getBody().GetFixtureList(), i = 0; fixtureList; fixtureList = fixtureList.GetNext(), i++){
                    (function(){
                        var fixture = fixtureList;
                        var shape = fixture.GetShape();
                        var shapeType = shape instanceof b2CircleShape ? "b2CircleShape" : shape instanceof b2PolygonShape ? "b2PolygonShape" : "UNKNOWN";
                        var container = $("<div class=\"fixture_property\"></div>");
                        container.mousemove(function(){
                        });
                        
                        var label = $("<h4 class=\"fixture_info\">[" + i + "] ：" + shapeType + "</h4>");
                        label.click(function(){
                            tableDiv.slideToggle();
                        });
                        container.append(label);
                        
                        var tbody = $("<tbody />");
                        var table = $("<table></table>").append(tbody);
                        var tableDiv = $("<div></div>").append(table);
              
                        var friction     = SANDBOX.createNumericProperty("摩擦",     0.1, function(value){ fixture.SetFriction(value); }, tbody, function(){ return fixture.GetFriction(); });
                        var restitution  = SANDBOX.createNumericProperty("反発係数", 0.1, function(value){ fixture.SetRestitution(value);                                             }, tbody, function(){ return fixture.GetRestitution(); });        
                        var categoryBits = SANDBOX.createNumericProperty("カテゴリ", 1,   function(value){ var d = fixture.GetFilterData(); d.categoryBits = value; fixture.SetFilterData(d); }, tbody, function(){ return fixture.GetFilterData().categoryBits; });
                        var groupIndex   = SANDBOX.createNumericProperty("グループ", 1,   function(value){ var d = fixture.GetFilterData(); d.gruopIndex   = value; fixture.SetFilterData(d); }, tbody, function(){ return fixture.GetFilterData().groupIndex; });
                        var maskbits     = SANDBOX.createNumericProperty("マスク",   1,   function(value){ var d = fixture.GetFilterData(); d.maskBits     = value; fixture.SetFilterData(d); }, tbody, function(){ return fixture.GetFilterData().maskBits; });
                        var density      = SANDBOX.createNumericProperty("密度",     0.1, function(value){ fixture.SetDensity(value); }, tbody, function(){ return fixture.GetDensity(); });
                        var mass_x       = SANDBOX.createNumericProperty("重心.X",   0.1, undefined, tbody, function(){ return fixture.GetMassData().center.x; });
                        var mass_y       = SANDBOX.createNumericProperty("重心.Y",   0.1, undefined, tbody, function(){ return fixture.GetMassData().center.y; });
                        var inertia      = SANDBOX.createNumericProperty("慣性",     0.1, undefined, tbody, function(){ return fixture.GetMassData().I; });
                        var mass         = SANDBOX.createNumericProperty("質量",     0.1, undefined, tbody, function(){ return fixture.GetMassData().mass; });
                        var sendor       = SANDBOX.createBooleanProperty("センサ",   function(value){ }, tbody);
                        
                        
                        container.append(tableDiv);
                        fixtureSection.append(container);
                        
                        fixturePropertyList.push({
                            fixture: fixture,
                            update: function(){
                                var focused = $(":focus").get(0);
                                density.update();
                                categoryBits.update();
                                groupIndex.update();
                                maskbits.update();
                                friction.update();
                                mass_x.update();
                                mass_y.update();
                                inertia.update();
                                mass.update();
                                restitution.update();
                                
                            }
                        });
                    })();
                }               
            }            
    
            // fixture のプロパティを更新する
            fixturePropertyList.forEach(function(fixtureProperty){
                fixtureProperty.update();
            });
        }
    }
    
    
    
    /////// Fixture List /////////////////////////////////////////////
    var fixtureSection = bodyOuterSection.createSubsection("フィクスチャプロパティ");
    

    // Custom data ////////////////////
    var extensionSection = bodyOuterSection.createSubsection("拡張データ");
    
    var customDataTable = $("<table />").appendTo(extensionSection);
    var customDataTBody = $("<tbody />").appendTo(customDataTable);
    var newCustomDataButton = $("<div>追加</div>").click(function(){
        var input_key   = $("<input type=\"text\" />");
        var input_value = $("<input type=\"text\" />");
        var deleteButton = $("<div></div>").text("×").click(function(){
            tr.remove();
        });
        var tr = $("<tr />").append($("<td />").append(input_key), $("<td />").append(input_value), $("<td />").append(deleteButton));
        customDataTBody.append(tr);
    });
    extensionSection.append(newCustomDataButton);
    
    
    /////// ジョイントプロパティ ///////////////////////////////////
    
    var jointOuterSection = panel.createSection();
    
    var jointProperty = jointOuterSection.createSubsection("ジョイントプロパティ");
    
    /////////////////////
    function getBody(){
        if(panel.sandbox.selectedBodies.length > 0){
            return panel.sandbox.selectedBodies[panel.sandbox.selectedBodies.length - 1];
        }else{
            return undefined;
        }
    }
    return panel;
};