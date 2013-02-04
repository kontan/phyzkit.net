//
// Box2DViewer Library and Demo
//
// Copyright(C) 2012 Kon 
// 
// * Serialize/Deserialize world of Box2D
// * Provide a framework for custom painting 
//
 /// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    export class SerializedWorld{
        private screenShot:string;
        private serializedData:string;
        private _date:Date;

        constructor(world:Box2D.Dynamics.b2World, viewport:Viewport){
            var canvas = <HTMLCanvasElement> viewport.canvas.get(0);
            this.screenShot = canvas.toDataURL();
            this.serializedData = JSON.stringify(serializeWorld(world));
            this._date = new Date();
        }

        get dataURL():string{
            return this.screenShot;
        }

        get date():Date{
            return new Date(this._date.getTime());
        }

        get serializedWorld():string{
            return this.serializedData;
        }
    }

    export interface FixtureUserData{
        name?:string;
        paint(g:CanvasRenderingContext2D, ficture:Box2D.Dynamics.b2Fixture):void;
        serialize():any;
        copy(): FixtureUserData;
    }

    export interface BodyUserData{
        name?:string;
        paint?(g:CanvasRenderingContext2D, ficture:Box2D.Dynamics.b2Body):void;
        serialize():any;
        copy(): BodyUserData;
    }

    export class SandBox{    
        private jq_canvas      :JQuery = $("<canvas style=\"position:absolute; top:0px; left:0px; width:100%; height:100%; display:block; -moz-user-select:none; -webkit-user-select:none;\" />");
        private jq_menubar     :JQuery = $("<div class=\"sandbox_menubar\" />");
        private jq_statusbar   :JQuery = $("<div class=\"status_bar\">Box2D Sandbox 0.001</div>");
        private jq_dialogLayer :JQuery = $("<div></div>");
        private jq_root        :JQuery;
        private elem_canvas    :HTMLCanvasElement;
        private graphics       :CanvasRenderingContext2D;
        private currentTool    :Tool;
        saveDataList   :SerializedWorld[] = [];
        private objectListPanel:DropDownPanel     = createObjectListDialog();
        private objectEditor   :DropDownWindow;
        private dialogStack = [];
        private _pseudoSelectedBodies:Box2D.Dynamics.b2Body[] = [];
        private _selectedObjects:any[] = [];
        world:Box2D.Dynamics.b2World = new D.b2World(new M.b2Vec2(0, -10), true);
        viewport:Viewport;
        container:JQuery; // このサンドボックス全体のルート要素の jQuery オブジェクト。
        frameRate:number = 60;
        isWorldActive:bool = true;
        clipboard:any[] = [];

        showStatus(text:string):void{
            this.jq_statusbar.text(text);
        }
        
        constructor(){
            this.jq_root     = $("<div class=\"sandbox_container\" />").append(this.jq_canvas, this.jq_menubar, this.jq_statusbar, this.jq_dialogLayer);
            this.elem_canvas = <HTMLCanvasElement>this.jq_canvas.get(0);
            this.graphics    = this.elem_canvas.getContext("2d");

            this.viewport = createViewport(this.jq_canvas);
            this.container = this.jq_root; 

            this.objectListPanel.sandbox = this;
            this.container.append(this.objectListPanel.root);    
            this.objectListPanel.root.css("right", "auto");
            this.objectListPanel.root.css("left", "2px");
            
            
            this.objectEditor = createObjectEditor(this);
            this.container.append(this.objectEditor.root);
            this.initializeWorld();
          
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
            
            
            

            

            
            this.jq_canvas.click    ((e)=>{ if(this.currentTool && this.currentTool.click    ){ this.currentTool.click    (e, this); }});
            this.jq_canvas.mousedown((e)=>{ if(this.currentTool && this.currentTool.mousedown){ this.currentTool.mousedown(e, this); }});
            this.jq_canvas.mousemove((e)=>{ if(this.currentTool && this.currentTool.mousemove){ this.currentTool.mousemove(e, this); }});
            this.jq_canvas.mouseup  ((e)=>{ if(this.currentTool && this.currentTool.mouseup  ){ this.currentTool.mouseup  (e, this); }});
            this.jq_canvas.mouseout ((e)=>{ if(this.currentTool && this.currentTool.mouseout ){ this.currentTool.mouseout (e, this); }});
            $(window)     .keydown  ((e)=>{ if(this.currentTool && this.currentTool.keydown  ){ this.currentTool.keydown  (e, this); }});
            
            // Initialization of event listeners for menu buttons ///////////////////////////////////////////////////////////////////////
            
            var menu_button = $("<div class=\"button icon_button menu_button\" />");
            menu_button.mousemove(()=>{
                this.showStatus("メニュー：メニューを開きます");
            });
            this.jq_menubar.append(menu_button);
            menu_button.click(()=>{
                showMenu(this.jq_root, [
                    createMenuItem("選択した物体の切り取り", ()=>{
                        this.clipboard.splice(0, this.clipboard.length);
                        this.selectedBodies.forEach((body)=>{
                            this.clipboard.push(serializeBody(body));
                            body.GetWorld().DestroyBody(body);
                        });
                        this.clearSelection();
                    }),                
                    createMenuItem("選択した物体のコピー", ()=>{
                        this.clipboard.splice(0, this.clipboard.length);
                        this.selectedBodies.forEach((body)=>{
                            this.clipboard.push(serializeBody(body));
                        });
                    }),
                    createMenuItem("クリップボードから貼り付け", ()=>{
                        this.clipboard.forEach(function(data){
                            var body = deserializeAndCreateBody(this.world, data);
                            body.SetAwake(true);
                            body.SetActive(true);
                        });
                    }),
                    createMenuItem("選択した物体の削除", ()=>{
                        this.selectedBodies.forEach((body)=>{
                            body.GetWorld().DestroyBody(body);
                        });
                        this.clearSelection();
                    }),      
                    createMenuItem("選択したフィクスチャの削除", ()=>{
                        this.selectedFixtures.forEach((fixture)=>{
                            fixture.GetBody().DestroyFixture(fixture);
                        });
                        this.clearSelection();
                    }),      
                    createMenuItem("選択した物体のマージ", ()=>{
                        if(this.selectedBodies.length >= 2){
                            var base = this.selectedBodies[0];
                            for(var i = 1; i < this.selectedBodies.length; i++){
                                mergeBodies(base, this.selectedBodies[i]);
                            }
                            this.clearSelection();
                            this.selectObject(base);
                        }
                    }),          
                    
                    createMenuItem("選択したオブジェクトを回転ジョイントで接続", ()=>{
                        function connect(bodyA:D.b2Body, bodyB:D.b2Body){
                            var posA = bodyA.GetPosition();
                            var posB = bodyB.GetPosition();
                            var anchor = new M.b2Vec2(
                                (posA.x + posB.x) / 2,
                                (posA.y + posB.y) / 2
                            );
                        
                            var def = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
                            def.bodyA = bodyA;
                            def.bodyB = bodyB;
                            def.localAnchorA = bodyA.GetLocalPoint(anchor).Copy();
                            def.localAnchorB = bodyB.GetLocalPoint(anchor).Copy(); // アンカーポイントに異なる点を与えても、solve で一つのポイントが回転中心になるらしい
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
                        
                        var bodies = this.selectedBodies;
                        if(bodies.length >= 2){
                            for(var i = 0; i < bodies.length - 1; i++){
                                connect(bodies[i], bodies[i + 1]);
                            }
                        }
                    }),
                    
                    createMenuItem("ワールドの初期化", ()=>{
                        this.initializeWorld();
                        this.showStatus("ワールドを初期化しました。");            
                    }),
                    createMenuItem("ワールドの読み込み >", ()=>{
                        new WorldDeserializeDialog(this.jq_root, this);
                    }),
                    createMenuItem("ワールドの保存", ()=>{
                        this.saveWorld();
                        this.showStatus("ワールドを保存しました。");   

                        //var button = $('<img class="menu_item"></img>');
                        //button.css("width",  "300px");
                        //button.css("height", "300px");
                        //button.attr("src", this.elem_canvas.toDataURL());

                        
                        //anchor.click((e)=>{
                        //    anchor.get(0).href = this.elem_canvas.toDataURL();
                        //    this.showStatus("スクリーンショットを撮影しました。");
                        //});         
                    }),
                    createMenuItem("スクリプト >", ()=>{
                        createScriptPad(this.jq_dialogLayer);
                    }),
                    
                    createMenuItem("データ閲覧 >", ()=>{
                        var savedWorld = serializeWorld(this.world);
                        createTextViewDialog(this.jq_dialogLayer, JSON.stringify(savedWorld), ()=>{
                            //savedWorld = JSON.parse($("#serialized_world_textarea").text());
                        })
                    }),
                    (()=>{
                        var anchor = $('<a class="menu_item" href="" target="_blank" style="text-decoration:none; display:block;">スクリーンショット</a>');
                        anchor.css("width",  "300px");
                        anchor.css("height", "300px");
                        anchor.click((e)=>{
                            anchor.get(0).href = this.elem_canvas.toDataURL();
                            this.showStatus("スクリーンショットを撮影しました。");
                        });
                        return anchor;
                    })(),
                    createMenuItem("視点の初期化", ()=>{
                        this.viewport.cameraEasing = new Camera();
                        this.showStatus("初期視点に戻ります。初期状態では 1 Box2DLength == 100px, 注視点が (0, 0) です。。");
                    }),
                    createMenuItem("ツールの編集 >"),
                    createMenuItem("Box2D 詳細設定", ()=>{
                        showSettingDialog(this.container);
                    })
                ]);    
            });
            
            (()=>{
                var world_activity_button = $("<canvas class=\"button icon_button \" />");
                var angle = 0;
                var g = world_activity_button.get(0).getContext("2d");
                this.jq_menubar.append(world_activity_button);
                setInterval(()=>{
                    world_activity_button.get(0).width  = world_activity_button.width();
                    world_activity_button.get(0).height = world_activity_button.height();
                    g.translate(12, 12);
                    g.rotate(angle);
                    g.translate(-12, -12);
                    g.fillStyle ="lightgrey";
                    g.fillRect(4, 4, 16, 16);
                    if(this.isWorldActive){
                        angle += 0.1;
                    }            
                }, 50);
                world_activity_button.click((e)=>{
                    this.isWorldActive = ! this.isWorldActive;
                });
                world_activity_button.mousemove(()=>{
                    this.showStatus("時間：ワールド時間の進行/停止の切り替え　現在:" + (this.isWorldActive ? "進行中" : "停止中"));
                });
            })();
            

            (<any>this.jq_canvas).contextmenu((e)=>{
                e.preventDefault();
            });
            this.jq_canvas.mousemove((e)=>{
                var p = this.viewport.toWorldCoords(pointFromEvent(e));
                this.showStatus("(x,y) = (" + 
                    formatNumber(p.x) + ", " + 
                    formatNumber(p.y) + ")");
                    

                this.clearPseudoSelection();

            });
            
            this.addToolButton(createSelectionTool());
            this.addToolButton(createHandTool());
            this.addToolButton(createMovingTool(this));

        }

            
        // Object Selection ///////////////////////////////////////////////////////////////////////////////

        selectObject(obj:Box2D.Dynamics.b2Body):void;
        selectObject(obj:Box2D.Dynamics.b2Fixture):void;
        selectObject(obj:Box2D.Dynamics.Joints.b2Joint):void;
        selectObject(obj:any):void{
            if( ! obj){
                throw new TypeError();
            }            
            var index = this._selectedObjects.indexOf(obj);
            if(index < 0){
                this._selectedObjects.push(obj);
            }
        }

        isSelected(obj:Box2D.Dynamics.b2Body):bool;
        isSelected(obj:Box2D.Dynamics.b2Fixture):bool;
        isSelected(obj:Box2D.Dynamics.Joints.b2Joint):bool;
        isSelected(obj:any):bool{
            return this._selectedObjects.indexOf(obj) >= 0;
        }
        clearSelection():void{
            this._selectedObjects.splice(0, this._selectedObjects.length);
            this.clearPseudoSelection();
        }
        selectOneObject(obj:Box2D.Dynamics.b2Body):void;
        selectOneObject(obj:Box2D.Dynamics.b2Fixture):void;
        selectOneObject(obj:Box2D.Dynamics.Joints.b2Joint):void;        
        selectOneObject(obj):void{
            this.clearSelection();
            this.selectObject(obj);
        }
        toggleObjectSelection(obj:Box2D.Dynamics.b2Body):void;
        toggleObjectSelection(obj:Box2D.Dynamics.b2Fixture):void;
        toggleObjectSelection(obj:Box2D.Dynamics.Joints.b2Joint):void;        
        toggleObjectSelection(obj:any){
            var index = this._selectedObjects.indexOf(obj);
            if(index < 0){
                this.selectObject(obj);
            }else{
                this._selectedObjects.splice(index, 1);
            }
        }
        
        get selectedObjects():any[]{
            return this._selectedObjects.slice(0);
        }
        get selectedBodies():Box2D.Dynamics.b2Body[]{ 
            return this._selectedObjects.filter(function(o){ return o instanceof D.b2Body; });
        }
        get selectedFixtures():Box2D.Dynamics.b2Fixture[]{
            return this._selectedObjects.filter(function(o){ return o instanceof D.b2Fixture; });
        }
        get selectedJoints():Box2D.Dynamics.Joints.b2Joint[]{
            return this._selectedObjects.filter(function(o){ return o instanceof Box2D.Dynamics.Joints.b2Joint; });
        }
        
        get pseudoSelectedBodies():Box2D.Dynamics.b2Body[]{
            return this._pseudoSelectedBodies.slice(0);
        }
        pseudoSelectBody(body:Box2D.Dynamics.b2Body):void{
            var index = this._pseudoSelectedBodies.indexOf(body);
            if(index < 0){
                this._pseudoSelectedBodies.push(body);
            }
        }
        clearPseudoSelection():void{
            this._pseudoSelectedBodies.splice(0, this._pseudoSelectedBodies.length);
        }
      

        
             

        
        pushDialog(dialog):void{
            this.dialogStack.push(dialog);
        }
        
        popDialog():void{
            if(this.dialogStack.length > 0){
                var dialog = this.dialogStack[this.dialogStack.length - 1];
                dialog.close(()=>{
                    this.dialogStack.pop();
                });
            }
        }
        

        
        
        // void initializeWorld()
        //          initialize world.
        initializeWorld():void{
            this.world = new D.b2World(new M.b2Vec2(0, -10), true);
            this.clearSelection();
        }
        
        // void saveWorld();
        //      Save current world temporarily.
        saveWorld():void{
            this.saveDataList.push(new SerializedWorld(this.world, this.viewport));
        }
        
        loadWorld():void{
            this.clearSelection();
        }
        
        update():void{  
            // fit to canvas
            if(this.elem_canvas.width  !== this.jq_canvas.width())  this.elem_canvas.width  = this.jq_canvas.width();
            if(this.elem_canvas.height !== this.jq_canvas.height()) this.elem_canvas.height = this.jq_canvas.height();
        
            // update the viewport.
            this.viewport.update();
            
            // 破棄されたジョイントを選択オブジェクトから削除する。
            // b2World#DestroyJoint を見る限り、 ! m_bodyA だとそのジョイントはすでに破棄されていると見てよさそう
            this._selectedObjects = this._selectedObjects.filter((o)=>{ 
                if(o instanceof Box2D.Dynamics.Joints.b2Joint){
                    if(o.m_bodyA && o.m_bodyB){
                        return true;
                    }else{
                        return false;
                    }
                }
                return true; 
            });
            
            // update the world
            if(this.isWorldActive){
                this.world.Step(1 / this.frameRate, 10, 10);
                this.world.ClearForces();

                // update dialog
                this.objectListPanel.update();
                this.objectEditor.update();
            }
            

        }
        paint():void{
            if(loader.state < 1){
                loader.paint(this.elem_canvas);
            }else{            
                this.viewport.paint(this.world);
                
                
                if(this._pseudoSelectedBodies.length > 0){
                    this._pseudoSelectedBodies.forEach((body)=>{
                        this.viewport.paintBodyState(body, "rgba(127, 127, 0, 0.6)");
                    });
                }else{
                    this.selectedBodies.forEach((body)=>{
                        this.viewport.paintBodyState(body);
                    });                
                    this.selectedFixtures.forEach((fixture)=>{
                        this.viewport.paintFixtureInfo(fixture, "rgba(255, 0, 0, 0.6)");
                    });
                }

                if(this.currentTool){
                    if(this.currentTool.paint){
                        this.graphics.save();
                        this.currentTool.paint(this.graphics, this.viewport, this);
                        this.graphics.restore();
                    }
                    if(this.currentTool.paintWorld){
                        this.graphics.save();
                        this.currentTool.paintWorld(this.graphics);
                        this.graphics.restore();
                    }
                }
                
                this.dialogStack.forEach((dialog)=>{
                    if(dialog.paint){
                        this.graphics.save();
                        dialog.paint(this.graphics);
                        this.graphics.restore();
                    }
                });
            }
        }
        start():void{
            loader.load();   
            var loop = ()=>{
                this.update();
                this.paint();
                setTimeout(loop, 1000 / this.frameRate);
            };
            loop();
        }

        loadWorldFromJSON(json:any):void{
            this.world = deserializeWorld(json);
            this.clearSelection();
        }
        
        loadWorldFromText(text:string):void{
            this.loadWorldFromJSON(JSON.parse(text));
        }
        
        loadScriptFromText(script:string):bool{
            try{
                var func = new Function("sandbox", script);
                var result = func(this);
                if(result) console.log(result);
                return true;
            }catch(err){
                console.log(err);
                return false;
            }
        }
        
        loadScriptFromURL(url:string, scope:any):void{
            jQuery.ajax(url, {
                type: "GET",
                url: url,
                dataType: "text",   // 省略すると script と判定されて、自動で実行されてしまう
                success: (data, dataType)=>{
                    this.loadScriptFromText(data);
                }
            });
        }
        
        loadWorldFromURL(url:string, callback?:()=>void){
            jQuery.ajax(url, {
                type: "GET",
                url: url,
                dataType: "json",   
                success: (data, dataType)=>{
                    this.loadWorldFromJSON(data);
                    if(callback){
                        callback();
                    }
                }
            });
        }
        
        addToolButton(tool):void{
            var button = $("<div class=\"action_button tool icon_button button\"></div>");
            if(tool.toolButtonStyle){
                button.addClass(tool.toolButtonStyle);
            }
            button.click(()=>{
                if(this.currentTool && this.currentTool.unselect){
                    this.currentTool.unselect(this);
                }
                this.currentTool = tool;
                if(this.currentTool && this.currentTool.select){
                    this.currentTool.select(this);
                }
                this.showStatus("ツールを選択");
                $(".tool").removeClass("tool_active");
                button.addClass("tool_active");
            });

            this.jq_menubar.append(button);
            
            button.mouseover(()=>{
                this.showStatus(tool.tooltip);
            });
            
            // Select first tool on load.
            var toolButtons = this.jq_menubar.find(".tool");
            if(toolButtons.length == 1){
                toolButtons.triggerHandler("click");
            }
        } 
    }

    export function createSandBox():SandBox{
        return new SandBox();
    }


}