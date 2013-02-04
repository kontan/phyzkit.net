//
// Box2DViewer Library and Demo
//
// Copyright(C) 2012 Kon 
// 
// * Serialize/Deserialize world of Box2D
// * Provide a framework for custom painting 
//
"use strict";

SANDBOX.createSandBox = function(){
    
    var jq_canvas      = $("<canvas style=\"position:absolute; top:0px; left:0px; width:100%; height:100%; display:block; -moz-user-select:none; -webkit-user-select:none;\" />");
    var jq_menubar     = $("<div class=\"sandbox_menubar\" />");
    var jq_statusbar   = $("<div class=\"status_bar\">Box2D Sandbox 0.001</div>");
    var jq_dialogLayer = $("<div></div>");
    var jq_root        = $("<div class=\"sandbox_container\" />").append(jq_canvas, jq_menubar, jq_statusbar, jq_dialogLayer);

    
    
    var elem_canvas = jq_canvas.get(0);
    var graphics = elem_canvas.getContext("2d");

    var currentTool, dialogStack = [], pseudoSelectedBodies = [];
    var selectedObjects = [];

    function showStatus(text){
        jq_statusbar.text(text);
    }
    
    var self = Object.seal(Object.create(null, {
        world: { writable: true, value: new b2World(new b2Vec2(0, -10), true) },
        viewport: { value: SANDBOX.createViewport(jq_canvas) },
    
        // このサンドボックス全体のルート要素の jQuery オブジェクト。
        container: { value: jq_root }, 
        
        frameRate: { value: 60 },
        isWorldActive: { writable: true, value: true },
        
        
        // Object Selection ///////////////////////////////////////////////////////////////////////////////
        selectObject: { value: function(obj){
            if( ! obj){
                throw new TypeError();
            }            
            var index = selectedObjects.indexOf(obj);
            if(index < 0){
                selectedObjects.push(obj);
            }
        }},
        isSelected: { value: function(obj){
            return selectedObjects.indexOf(obj) >= 0;
        }},
        clearSelection: { value: function(){
            selectedObjects.splice(0, selectedObjects.length);
            self.clearPseudoSelection();
        }},
        
        selectOneObject: { value: function(obj){
            self.clearSelection();
            self.selectObject(obj);
        }},
        toggleObjectSelection: { value: function(obj){
            var index = selectedObjects.indexOf(obj);
            if(index < 0){
                self.selectObject(obj);
            }else{
                selectObject.splice(index, 1);
            }
        }},
        
        
        selectedBodies: { get: function(){ 
            return selectedObjects.filter(function(o){ return o instanceof b2Body; });
            //return selectedBodies.slice(0); 
        }},
        selectedFixtures: { get: function(){
            return selectedObjects.filter(function(o){ return o instanceof b2Fixture; });
        }},        
        selectedJoints: { get: function(){
            return selectedObjects.filter(function(o){ return o instanceof Box2D.Dynamics.Joints.b2Joint; });
        }},
        
        pseudoSelectedBodies: { value: function(){
            return pseudoSelectedBodies.slice(0);
        }},
        pseudoSelectBody: { value: function(body){
            var index = pseudoSelectedBodies.indexOf(body);
            if(index < 0){
                pseudoSelectedBodies.push(body);
            }
        }},
        clearPseudoSelection: { value: function(){
            pseudoSelectedBodies.splice(0, pseudoSelectedBodies.length);
        }},
      

        
             
        clipboard: { value: [] },
        serializedWorldList: { value: []},
        
        pushDialog: { value: function(dialog){
            dialogStack.push(dialog);
        }},
        
        popDialog: { value: function(){
            if(dialogStack.length > 0){
                var dialog = dialogStack[dialogStack.length - 1];
                dialog.close(function(){
                    dialogStack.pop();
                });
            }
        }},
        
        propertyDialog: { value: SANDBOX.createPropertyDialog() },
        objectListPanel: { value: SANDBOX.createObjectListDialog() },
        
        // void initializeWorld()
        //          initialize world.
        initializeWorld: { value: function (){
            self.world = new b2World(new b2Vec2(0, -10), true);
            self.clearSelection();
        }},
        
        // void saveWorld();
        //      Save current world temporarily.
        saveWorld: { value: function (){
            self.serializedWorldList.push(Object.freeze({
                date: new Date(),
                data: SANDBOX.serialize(self.world),
                thumbnail: elem_canvas.toDataURL()
            }));
        
            //savedWorld = SANDBOX.serialize(self.world);
        }},
        
        loadWorld: { value: function(){
            //self.world = SANDBOX.deserialize(savedWorld);
            self.clearSelection();
        }},
        
        update: {value: function(){  
            // fit to canvas
            if(elem_canvas.width  !== jq_canvas.width())  elem_canvas.width  = jq_canvas.width();
            if(elem_canvas.height !== jq_canvas.height()) elem_canvas.height = jq_canvas.height();
        
            // update the viewport.
            self.viewport.update();
            
            // update the world
            if(self.isWorldActive){
                self.world.Step(1 / self.frameRate, 10, 10);
                self.world.ClearForces();

                // update dialog
                self.propertyDialog.update();
                
                self.objectListPanel.update();
            }
            

        }},
        paint: { value: function(){
            if(SANDBOX.loader.state < 1){
                SANDBOX.loader.paint(elem_canvas);
            }else{            
                self.viewport.paint(self.world);
                
                if(self.focused){
                    self.viewport.paintBodyState(self.focused);
                }
                
                if(pseudoSelectedBodies.length > 0){
                    pseudoSelectedBodies.forEach(function(body){
                        self.viewport.paintBodyState(body, [], "rgba(127, 127, 0, 0.6)");
                    });
                }else{
                    self.selectedBodies.forEach(function(body){
                        self.viewport.paintBodyState(body, self.selectedFixtures);
                    });                
                }

                if(currentTool){
                    if(currentTool.paint){
                        graphics.save();
                        currentTool.paint(graphics, self.viewport, self);
                        graphics.restore();
                    }
                    if(currentTool.paintWorld){
                        graphics.save();
                        currentTool.paintWorld(graphics);
                        graphics.restore();
                    }
                }
                
                dialogStack.forEach(function(dialog){
                    if(dialog.paint){
                        graphics.save();
                        dialog.paint(graphics);
                        graphics.restore();
                    }
                });
            }
        }},
        start: { value: function(){
            
            SANDBOX.loader.load();
                
            (function loop(){
                self.update();
                self.paint();
                setTimeout(loop, 1000 / self.frameRate);
            }());
        }},

        loadWorldFromJSON: { value: function(json){
            self.world = SANDBOX.deserialize(json);
            self.clearSelection();
        }},
        
        loadWorldFromText: { value: function(text){
            self.loadWorldFromText(JSON.parse(text));
        }},
        
        loadScriptFromText: { value: function(script){
            try{
                var func = new Function("sandbox", script);
            
                //var result = eval("(function(){" + script + "})();"); 
                
                var result = func(self);
                if(result) console.log(result);
                //if(result) $("#textarea_script_console").val(result + "\n");
                return true;
            }catch(err){
                console.log(err);
                //$("#textarea_script_console").val(err + "\n");
                return false;
            }
        }},
        
        loadScriptFromURL: { value: function(url, scope){
            jQuery.ajax({
                type: "GET",
                url: url,
                dataType: "text",   // 省略すると script と判定されて、自動で実行されてしまう
                success: function(data, dataType){
                    self.loadScriptFromText(data);
                }
            });
        }},
        
        loadWorldFromURL: { value: function(url, callback){
            jQuery.ajax({
                type: "GET",
                url: url,
                dataType: "json",   
                success: function(data, dataType){
                    self.loadWorldFromJSON(data);
                    if(callback){
                        callback();
                    }
                }
            });
        }},
        
        addToolButton: { value: function(tool){
            var button = $("<div class=\"action_button tool icon_button button\"></div>");
            if(tool.style){
                button.addClass(tool.style);
            }
            button.click(function(){
                if(currentTool && currentTool.unselect){
                    currentTool.unselect(self);
                }
                currentTool = tool;
                if(currentTool && currentTool.select){
                    currentTool.select(self);
                }
                showStatus("ツールを選択");
                $(".tool").removeClass("tool_active");
                button.addClass("tool_active");
            });

            jq_menubar.append(button);
            
            button.mouseover(function(){
                showStatus(tool.tooltip);
            });
            
            // Select first tool on load.
            var toolButtons = jq_menubar.find(".tool");
            if(toolButtons.length == 1){
                toolButtons.triggerHandler("click");
            }
        }}
    }));       

    self.propertyDialog.sandbox = self;
    self.objectListPanel.sandbox = self;
    self.container.append(self.propertyDialog.root, self.objectListPanel.root);    
    self.objectListPanel.root.css("right", "auto");
    self.objectListPanel.root.css("left", "2px");
    
    
    self.initializeWorld();
  
    /*
    // Initialize Listeners
    world.SetContactFilter({
        RayCollide: function(){
            return false;
        },
        ShouldCollide: function(a, b){
        }
    });
    world.SetContactListener({
        BeginContact: function(){
    
        },
        EndContact: function(contact){                        
        },
        PreSolve: function(){
        
        },                
        PostSolve: function(){
        
        }
    });
    */
    
    
    

    

    
    jq_canvas.click    (function(e){ if(currentTool && currentTool.click    ){ currentTool.click    (e, self); }});
    jq_canvas.mousedown(function(e){ if(currentTool && currentTool.mousedown){ currentTool.mousedown(e, self); }});
    jq_canvas.mousemove(function(e){ if(currentTool && currentTool.mousemove){ currentTool.mousemove(e, self); }});
    jq_canvas.mouseup  (function(e){ if(currentTool && currentTool.mouseup  ){ currentTool.mouseup  (e, self); }});
    jq_canvas.mouseout (function(e){ if(currentTool && currentTool.mouseout ){ currentTool.mouseout (e, self); }});
    $(window)  .keydown  (function(e){ if(currentTool && currentTool.keydown  ){ currentTool.keydown  (e, self); }});
    
    // Initialization of event listeners for menu buttons ///////////////////////////////////////////////////////////////////////
    var fullscreenToggleFunction = SANDBOX.createToggleMaximizeFunction(jq_root);
    
    var menu_button = $("<div class=\"button icon_button menu_button\" />");
    menu_button.mousemove(function(){
        showStatus("メニュー：メニューを開きます");
    });
    jq_menubar.append(menu_button);
    menu_button.click(function(){
        SANDBOX.showMenu(jq_root, [
            SANDBOX.createMenuItem("選択した物体の切り取り", function(){
                self.clipboard.splice(0, self.clipboard.length);
                self.selectedBodies.forEach(function(body){
                    self.clipboard.push(SANDBOX.serializeBody(body));
                    body.GetWorld().DestroyBody(body);
                });
                self.clearSelection();
            }),                
            SANDBOX.createMenuItem("選択した物体のコピー", function(){
                self.clipboard.splice(0, self.clipboard.length);
                self.selectedBodies.forEach(function(body){
                    self.clipboard.push(SANDBOX.serializeBody(body));
                });
            }),
            SANDBOX.createMenuItem("クリップボードから貼り付け", function(){
                self.clipboard.forEach(function(data){
                    var body = SANDBOX.deserializeAndCreateBody(self.world, data);
                    body.SetAwake(true);
                    body.SetActive(true);
                });
            }),
            SANDBOX.createMenuItem("選択した物体の削除", function(){
                self.selectedBodies.forEach(function(body){
                    body.GetWorld().DestroyBody(body);
                });
                self.clearSelection();
            }),      
            SANDBOX.createMenuItem("選択したフィクスチャの削除", function(){
                self.selectedFixtures.forEach(function(fixture){
                    fixture.GetBody().DestroyFixture(fixture);
                });
                self.clearSelection();
            }),      
            SANDBOX.createMenuItem("選択した物体のマージ", function(){
                if(self.selectedBodies.length >= 2){
                    var base = self.selectedBodies[0];
                    for(var i = 1; i < self.selectedBodies.length; i++){
                        SANDBOX.mergeBodies(base, self.selectedBodies[i]);
                    }
                    self.clearSelection();
                    self.selectBody(base);
                }
            }),          
            
            SANDBOX.createMenuItem("選択したオブジェクトを回転ジョイントで接続", function(){
                function connect(bodyA, bodyB){
                    var posA = bodyA.GetPosition();
                    var posB = bodyB.GetPosition();
                    var anchor = new b2Vec2(
                        (posA.x + posB.x) / 2,
                        (posA.y + posB.y) / 2
                    );
                
                    var def = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
                    def.bodyA = bodyA;
                    def.bodyB = bodyB;
                    def.localAnchorA = bodyA.GetLocalPoint(anchor).Copy();
                    def.localAnchorB = bodyB.GetLocalPoint(anchor).Copy();
                    def.referenceAngle = bodyB.GetAngle() - bodyA.GetAngle();
                    var joint = bodyA.GetWorld().CreateJoint(def);
                    joint.SetUserData({
                        paintScreen: function(g, viewport){
                            function drawAnchor(label, point){
                                var p = viewport.toScreenCoords(point);
                                var s = 10;
                                g.lineWidth = 4;
                                g.strokeStyle = "black";
                                g.beginPath();
                                g.moveTo(p.x - s, p.y - s);
                                g.lineTo(p.x + s, p.y + s);
                                g.moveTo(p.x + s, p.y - s);
                                g.lineTo(p.x - s, p.y + s);
                                g.stroke();
                                g.fillStyle = "black";
                                g.fillText(label, p.x + 5, p.y + 20);
                            }
                            //drawAnchor("Anchor A", joint.GetAnchorA());
                            //drawAnchor("Anchor B", joint.GetAnchorB());
                            
                            var pa = viewport.toScreenCoords(bodyA.GetPosition());
                            var aa = viewport.toScreenCoords(joint.GetAnchorA());
                            var ab = viewport.toScreenCoords(joint.GetAnchorB());
                            var pb = viewport.toScreenCoords(bodyB.GetPosition());
                            
                            g.beginPath();
                            g.moveTo(pa.x, pa.y);
                            g.lineTo(aa.x, aa.y);
                            g.lineTo(ab.x, ab.y);
                            g.lineTo(pb.x, pb.y);
                            g.lineWidth = 4;
                            g.strokeStyle = "black";
                            g.stroke();
                            
                            g.beginPath();
                            g.arc(pa.x, pa.y, 4, 0, 7);
                            g.arc(aa.x, aa.y, 4, 0, 7);
                            g.arc(ab.x, ab.y, 4, 0, 7);
                            g.arc(pb.x, pb.y, 4, 0, 7);
                            g.fillStyle = "red";
                            g.fill();
                        }
                    });
                }
                
                var bodies = self.selectedBodies;
                if(bodies.length >= 2){
                    for(var i = 0; i < bodies.length - 1; i++){
                        connect(bodies[i], bodies[i + 1]);
                    }
                }
            }),
            
            SANDBOX.createMenuItem("ワールドの初期化", function(){
                self.initializeWorld();
                showStatus("ワールドを初期化しました。");            
            }),
            SANDBOX.createMenuItem("ワールドの読み込み >", function(){
                SANDBOX.showDeserializeMenu(jq_root, self);
            }),
            SANDBOX.createMenuItem("ワールドの保存", function(){
                self.saveWorld();
                showStatus("ワールドを保存しました。");            
            }),
            SANDBOX.createMenuItem("スクリプト >", function(){
                SANDBOX.createScriptPad(jq_dialogLayer);
            }),
            
            SANDBOX.createMenuItem("データ閲覧 >", function(){
                var savedWorld = SANDBOX.serialize(self.world);
                SANDBOX.createTextViewDialog(jq_dialogLayer, JSON.stringify(savedWorld), function(){
                    //savedWorld = JSON.parse($("#serialized_world_textarea").text());
                })
            }),
            (function(){
                var anchor = $("<a class=\"menu_item\" href=\"\" target=\"_blank\" style=\"text-decoration:none; display:block;\">スクリーンショット</a>");
                anchor.click(function(e){
                    anchor.get(0).href = elem_canvas.toDataURL();
                    showStatus("スクリーンショットを撮影しました。");
                });
                return anchor;
            })(),
            SANDBOX.createMenuItem("視点の初期化", function(){
                self.viewport.cameraEasing = SANDBOX.Camera.create();
                showStatus("初期視点に戻ります。初期状態では 1 Box2DLength == 100px, 注視点が (0, 0) です。。");
            }),
            SANDBOX.createMenuItem("ツールの編集 >"),
            SANDBOX.createMenuItem("Box2D 詳細設定", function(){
                SANDBOX.showSettingDialog(self.container);
            })
        ]);    
    });
    
    (function(){
        var world_activity_button = $("<canvas class=\"button icon_button \" />");
        var angle = 0;
        var g = world_activity_button.get(0).getContext("2d");
        jq_menubar.append(world_activity_button);
        setInterval(function(){
            world_activity_button.get(0).width  = world_activity_button.width();
            world_activity_button.get(0).height = world_activity_button.height();
            g.translate(12, 12);
            g.rotate(angle);
            g.translate(-12, -12);
            g.fillStyle ="lightgrey";
            g.fillRect(4, 4, 16, 16);
            if(self.isWorldActive){
                angle += 0.1;
            }            
        }, 50);
        world_activity_button.click(function(){
            self.isWorldActive = ! self.isWorldActive;
        });
        world_activity_button.mousemove(function(){
            showStatus("時間：ワールド時間の進行/停止の切り替え　現在:" + (self.isWorldActive ? "進行中" : "停止中"));
        });
    })();
    
    /*
    (function(){
        var property_button = $("<canvas class=\"button tool_property icon_button\" />");
        property_button.css("margin-right", "12px");
        property_button.click(function(){
            if(self.propertyDialog.element.css("display") === "none"){
                self.propertyDialog.show();
            }else{
                self.propertyDialog.hide();
            }
        });
        property_button.mousemove(function(){
            showStatus("選択している物体のプロパティを確認・編集します");
        });
        jq_menubar.append(property_button);
    })();
    */
    
    jq_canvas.contextmenu(function(e){
        e.preventDefault();
    });
    jq_canvas.mousemove(function(e){
        var p = self.viewport.toWorldCoords(SANDBOX.pointFromEvent(e));
        showStatus("(x,y) = (" + 
            SANDBOX.formatNumber(p.x) + ", " + 
            SANDBOX.formatNumber(p.y) + ")");
            

        self.clearPseudoSelection();

    });
    
    self.addToolButton(SANDBOX.createSelectionTool());
    self.addToolButton(SANDBOX.createHandTool());
    self.addToolButton(SANDBOX.createMovingTool());
    self.addToolButton(SANDBOX.createRotationTool());
    self.addToolButton(SANDBOX.createScalingTool());
    //self.addToolButton(SANDBOX.createRevoluteJointTool());
    // self.addToolButton(SANDBOX.createDeleteTool());
    //self.addToolButton(SANDBOX.createPropertyTool(self));
    
    
    fullscreenToggleFunction();
    
    
    return self;
};

