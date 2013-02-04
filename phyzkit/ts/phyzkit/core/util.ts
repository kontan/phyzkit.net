/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    interface Offset{
        left:number;
        top :number;
    }

    // b2Vec2 pointFromEvent(Event e)
    //      Get offset from event object.
    //      It's useful for a browser that no support offsetX/offsetY like Firefox.
    export function pointFromEvent(e){
        var offset:Offset = <Offset> $(e.target).offset(),
            offsetX = e.pageX - offset.left,
            offsetY = e.pageY - offset.top;
        return new M.b2Vec2(offsetX, offsetY); 
    }

    export function getFixtureAt(world, point){
        var result = null;
        world.QueryPoint(function(fixture){
            result = fixture;
            return false; /* first fixture only */
        }, point);
        return result;
    }

    function getBodyAt(world, point, callback){
        // Get clicket body
        world.QueryPoint(function(fixture){
            callback(fixture.GetBody(), fixture);
            return false; /* first fixture only */
        }, point);
        return null;
    }


    function paddingLeft(length, text){
        text = "" + text;
        while(length > text.length){
            text = " " + text;
        }
        return text;
    }


    export function formatNumber(n){
        var s = n.toString();
        if(n === Math.floor(n)){
            s += ".0";
        }
        if(s.charAt(0) !== "-"){
            s = "+" + s;
        }
        s = s.substr(0, 8);
        while(s.length < 8){
            s = s + "0";
        }
        return s;
    }

    export function readParam(name, callback){
        if(window.location.search.length > 0){
            var params = window.location.search.substr(1).split("&");
            for(var i = 0; i < params.length; i++){
                var tokens = params[i].split("=");
                if(tokens.length == 2 && tokens[0] === name){
                    callback(decodeURIComponent(tokens[1]));
                    return;
                }
            };
        }
    }




    //////////////////////////////////////////////////////////////////////////////
    // Fixture Controls
    ///////////////////////////////////////////////////////////////////////////

    // ボディの原点は変更せず、ボディが持つすべてのフィクスチャの位置を変更します。
    function translateFixtures(sandbox, body, deltaInScreen){
        for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext()){
            translateShape(sandbox, fixtureList.GetShape(), deltaInScreen);
        }   
    };

    // シェイプの座標を移動します
    function translateShape(sandbox, shape, deltaInScreen){
        if(shape instanceof S.b2PolygonShape){
            var vertices = [];
            for(var i = 0; i < shape.GetVertexCount(); i++){
                vertices.push(shape.GetVertices()[i].Copy());
            }
            vertices.forEach(function(v, i){
                var sv = sandbox.viewport.toScreenCoords(v);
                sv.x += deltaInScreen.x;
                sv.y += deltaInScreen.y;
                vertices[i] = sandbox.viewport.toWorldCoords(sv);
            });
            shape.SetAsArray(vertices); 
        }else{
            throw "Not implemented";
        }
    };

    // このボディの接続しているジョイントのアンカーを移動します。
    export function translateJointAnchor(sandbox, body, deltaInScreen){
        for(var jointList = body.GetJointList(); jointList; jointList = jointList.next){
            var jointEdge = jointList;
            var joint = jointEdge.joint;
            // m_localAnchor1 は本来 private だからあんまりよくない
            var isBodyA = joint.m_bodyA === body ? true  : 
                          joint.m_bodyB === body ? false : 
                          undefined;
            if(isBodyA === undefined){
                throw "INTERNAL ERROR";
            }
            var anchor = isBodyA ? joint.m_localAnchor1 : joint.m_localAnchor2;
            var anchorInScreen = sandbox.viewport.toScreenCoords(body.GetWorldPoint(anchor));
            var newAnchor = body.GetLocalPoint(sandbox.viewport.toWorldCoords(new M.b2Vec2(
                anchorInScreen.x + deltaInScreen.x,
                anchorInScreen.y + deltaInScreen.y
            ))); 
            if(isBodyA){
                joint.m_localAnchor1 = newAnchor;
            }else{
                joint.m_localAnchor2 = newAnchor;
            }
        }
    }


    export function mergeBodies(base, ext){
        for(var fixture = ext.GetFixtureList(); fixture; fixture = fixture.GetNext()){

            var def = new D.b2FixtureDef();
            def.density     = fixture.GetDensity();
            def.friction    = fixture.GetFriction();
            def.isSensor    = fixture.IsSensor();
            def.restitution = fixture.GetRestitution(); 
            def.filter      = fixture.GetFilterData().Copy();
            def.userData    = (fixture.GetUserData() && fixture.GetUserData().copy) ? fixture.GetUserData().copy() : undefined;

            var shape = fixture.GetShape();
            if(shape instanceof S.b2PolygonShape){
                var vs:M.b2Vec2[] = [];
                for(var i = 0; i < shape.GetVertexCount(); i++){
                    vs.push(base.GetLocalPoint(ext.GetWorldPoint(shape.GetVertices()[i])));
                }
                var polygon:S.b2PolygonShape = new S.b2PolygonShape();
                polygon.SetAsArray([], vs.length);
                def.shape = polygon;
            }else if(shape instanceof S.b2CircleShape){
                var circle = new S.b2CircleShape(shape.GetRadius());
                circle.SetLocalPosition(base.GetLocalPoint(ext.GetWorldPoint(shape.GetLocalPosition().Copy())));
                def.shape = circle;
            }else{
                throw new TypeError();
            }
          
            base.CreateFixture(def);
        }   
        
        ext.GetWorld().DestroyBody(ext);
    }


    export class DropDownPanel{
        property_root:JQuery;
        property_title:JQuery;
        clickToggle:JQuery;
        sections:any[];
        sandbox:any;

        constructor(title:string, private updateFunc?:()=>void){
            this.property_root = $("<div class=\"property_content\"></div>");
                this.property_title = $("<h5 class=\"property_title\"></h5>").text(title + "▼");
                this.clickToggle = $("<div class=\"property_dialog_inner\" />");
                
            this.property_root.append(this.property_title, this.clickToggle);    

            this.property_title.click((e)=>{
                this.toggle();
                e.stopPropagation();
            });    
            
            this.sections = [];
        }

        get body():D.b2Body{
            if(this.sandbox.selectedBodies.length > 0){
                return this.sandbox.selectedBodies[this.sandbox.selectedBodies.length - 1];
            }else{
                return undefined;
            }
        }
        
    
        get root():JQuery{ 
            return this.property_root; 
        }
        
        toggle():void{
            this.clickToggle.slideToggle();    
        }
        
        update():void{
            if(this.updateFunc){
                this.sections.forEach(function(section){
                    section.update();
                });
                this.updateFunc();
            }
        }


        createSection(visible:bool){
            var autoTogglePane = $("<div class=\"property_auto_toggle\" />");
                var contentPane = $("<div class=\"property_scrollpane\" />");    
            this.clickToggle.append(autoTogglePane);
                autoTogglePane.append(contentPane);   


            autoTogglePane.css("display", visible ? "block" : "none"); 

            var section = Object.create(null, {
                // section
                slideDown: { value: function(){
                    autoTogglePane.slideDown();
                }},
                slideUp:   { value: function(){
                    autoTogglePane.slideUp();
                }},
                display:   { get: function(){ return autoTogglePane.css("display") !== "none"; }},

                createSubsection: { value: function(title, content){
                    var label = $("<h3 />").text(title);
                    var section = $("<div />");
                    contentPane.append(label, section);
                    label.click(function(e){
                        section.slideToggle();
                        e.stopPropagation();
                    });
                    return section;
                }}
            });
            this.sections.push({
                update: function(){
                    contentPane.css("max-height", ($(window).height() - 120) + "px");
                }
            });
            return section;
        }
    }
    







    export function getBodyAABB(body){
        var bl = +Number.MAX_VALUE;
        var br = -Number.MAX_VALUE;
        var bt = +Number.MAX_VALUE;
        var bb = -Number.MAX_VALUE;

        // Body AABB ////////////////////////////////////////////////////////////////
        // TODO: static な body は変形しないことが前提なのか、頂点を移動しても AABB が更新されない。
        for(var fixtureList = body.GetFixtureList(); fixtureList; fixtureList = fixtureList.GetNext()){
            var aabb = fixtureList.GetAABB();
            var lb = aabb.lowerBound;
            var ub = aabb.upperBound;
            bl = Math.min(bl, aabb.lowerBound.x);
            br = Math.max(br, aabb.upperBound.x);
            bt = Math.min(bt, aabb.lowerBound.y);
            bb = Math.max(bb, aabb.upperBound.y);
        }
        if(
            bl !== +Number.MAX_VALUE && 
            br !== -Number.MAX_VALUE && 
            bt !== +Number.MAX_VALUE &&
            bb !== -Number.MAX_VALUE
        ){
            var aabb = new Box2D.Collision.b2AABB();
            aabb.lowerBound = new M.b2Vec2(bl, bt);
            aabb.upperBound = new M.b2Vec2(br, bb);
            return aabb;
        }else{
            return undefined;
        }
    }








    
    // タイトル部をクリックすると開閉するウィンドウ
    export class DropDownWindow{
        private property_root = $("<div class=\"property_content\"></div>");
        private property_title = $("<h5 class=\"property_title\"></h5>");
        private clickToggle = $("<div class=\"property_dialog_inner\" />");
        private autoTogglePane = $("<div class=\"property_auto_toggle\" style=\"display:none;\" />");
        private currentEditor;

        constructor(private title:string, private autoToggleCondition:()=>bool, private updateHandler:()=>void){
            this.property_title.text(title + "▼").appendTo(this.property_root);
            this.clickToggle.appendTo(this.property_root);
            this.autoTogglePane.appendTo(this.clickToggle);
            this.property_title.click((e)=>{
                this.clickToggle.slideToggle();
                e.stopPropagation();
            });  
        }

        get root():JQuery{
            return this.property_root;
        }

        get content():JQuery{
            return this.autoTogglePane;
        }

        update(){
            var toggle = this.autoToggleCondition();
            var display = this.autoTogglePane.css("display") !== "none"; 
            if(toggle && ! display){
                this.autoTogglePane.slideUp();
            }else if( ! toggle && display){
                this.autoTogglePane.slideDown();
            }
            if(this.currentEditor){
                this.currentEditor.update();
            }
            if(this.updateHandler){
                this.updateHandler();
            }    
        }

        setEditor(editor){
            this.currentEditor = editor;
        }
    }
}

