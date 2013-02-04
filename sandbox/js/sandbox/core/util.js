"use strict";

SANDBOX.serializeBody = function(body){
    var def = body.GetDefinition();
        
    var massData = new b2MassData();
    body.GetMassData(massData);
    def.massData = { center: massData.center, I: massData.I, mass: massData.mass };
    
    if(def.userData && def.userData.serialize) def.userData = def.userData.serialize(); 
    def.fixtures = [];
    for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
        var shape = fixture.GetShape();
        var fixtureDef = { shape: {} };
        if(fixture.GetDensity()  !== 0)                              fixtureDef.density     = fixture.GetDensity();
        if(true                       )                              fixtureDef.filterData  = fixture.GetFilterData();
        if(fixture.GetFriction() !== 0)                              fixtureDef.friction    = fixture.GetFriction();
        if(fixture.IsSensor()       !== false)                       fixtureDef.sensor      = fixture.IsSensor();
        if(fixture.GetRestitution() !== 0)                           fixtureDef.restitution = fixture.GetRestitution();
        if(fixture.GetUserData() && fixture.GetUserData().serialize) fixtureDef.userData    = fixture.GetUserData().serialize();
        if(shape instanceof b2CircleShape){
            fixtureDef.shape.type   = "b2CircleShape";
            fixtureDef.shape.pos    = shape.GetLocalPosition();
            fixtureDef.shape.radius = shape.GetRadius();
        }else if(shape instanceof b2PolygonShape){
            fixtureDef.shape.type   = "b2PolygonShape";
            fixtureDef.shape.vertices = shape.GetVertices();
        }else{
            var error = new Error();
            error.name = "Internal Error";
            error.message = "Box2DViewer.serialize: Unsupported fixture type.";
            throw error;
        }
        def.fixtures.push(fixtureDef);
    }
    
    return def;
};

// Object serialize(b2World world)
//      Serialize b2World to JSON data object. 
//      Box2DViewer.serialize does NOT serialize all of world. 
//      ContactFilter, ContactListener, DebugDraw and DestructionListener are NOT serialized.
//
SANDBOX.serialize = function(world){
    var bodies = [], body, userData;
    for(body = world.GetBodyList(); body && body.GetNext; body = body.GetNext()){
        bodies.push(SANDBOX.serializeBody(body));
    }
    var dat = {
        gravity: world.GetGravity(),
        bodies: bodies
    };
    if(world.m_warmStarting)      dat.warmStarting      = world.m_warmStarting;
    if(world.m_continuousPhysics) dat.continuousPhysics = world.m_continuousPhysics;
    return dat;
};

SANDBOX.deserializeAndCreateBody = function(world, bodyDef, bodyUserDataDeserializer, fictureUserDataDeserializer){
    if( ! bodyUserDataDeserializer){
        bodyUserDataDeserializer = SANDBOX.deserializeUserData;
    }

    var body = world.CreateBody(bodyDef);
 
    body.SetUserData(bodyUserDataDeserializer ? bodyUserDataDeserializer(bodyDef.userData) : null);
    bodyDef.fixtures.forEach(function(fixtureDef){
        var filter = new b2FilterData();
        filter.categoryBits = fixtureDef.filterData.categoryBits;
        filter.groupIndex   = fixtureDef.filterData.groupIndex;
        filter.maskBits     = fixtureDef.filterData.maskBits;
        var def = new b2FixtureDef();
        def.density     = fixtureDef.density;
        def.filter      = filter;
        def.friction    = fixtureDef.friction;
        def.isSensor    = fixtureDef.isSensor;
        def.restitution = fixtureDef.restitution;
        def.userData    = fictureUserDataDeserializer ? fictureUserDataDeserializer(fixtureDef.userData) : null;
        if(fixtureDef.shape.type == "b2CircleShape"){
            def.shape = new b2CircleShape();
            def.shape.SetRadius(fixtureDef.shape.radius);
            def.shape.SetLocalPosition(fixtureDef.shape.pos);
        }else if(fixtureDef.shape.type == "b2PolygonShape"){
            def.shape = new b2PolygonShape();
            def.shape.SetAsArray(fixtureDef.shape.vertices);
        }
        body.CreateFixture(def);
    });
    
    if(bodyDef.massData){
        var massData = new b2MassData();
        massData.center.x = bodyDef.massData.center.x;
        massData.center.y = bodyDef.massData.center.y;
        massData.center.z = bodyDef.massData.center.z;
        massData.I      = bodyDef.massData.I;
        massData.mass   = bodyDef.massData.mass;
        body.SetMassData(massData);
    }
    
    return body;
};

// b2World deserialize(Object obj, Function<Object,Object> bodyUserDataDeserializer, Function<Object,Object> fictureUserDataDeserializer)
//      Desirialize b2World from JSON data object.
SANDBOX.deserialize = function(data, bodyUserDataDeserializer, fictureUserDataDeserializer){
    if( ! bodyUserDataDeserializer){
        bodyUserDataDeserializer = SANDBOX.deserializeUserData;
    }

    var world = new b2World(data.gravity ? data.gravity : new b2Vec2(0, 0), true);
    if(data.bodies){
        data.bodies.forEach(function(bodyDef){
            SANDBOX.deserializeAndCreateBody(world, bodyDef, bodyUserDataDeserializer, fictureUserDataDeserializer);
        });
    }
    return world;
};

// b2Vec2 pointFromEvent(Event e)
//      Get offset from event object.
//      It's useful for a browser that no support offsetX/offsetY like Firefox.
SANDBOX.pointFromEvent = function(e){
    var offset = $(e.target).offset(),
        offsetX = e.pageX - offset.left,
        offsetY = e.pageY - offset.top;
    return new b2Vec2(offsetX, offsetY); 
};


SANDBOX.createToggleMaximizeFunction = function(element, onMaximize, onRestore){
    var onMiximizeButtonClicked = maximizeWindow;
                
    function maximizeWindow(){    
        var w  = element.css("width");
        var h  = element.css("height");  
        var mt = element.css("margin-top");
        var ml = element.css("margin-left");
        var l  = element.css("left");
        var t  = element.css("top");
        onMiximizeButtonClicked = function(){
            element.css("width",       w);
            element.css("height",      h);
            element.css("margin-top",  mt);
            element.css("margin-left", ml);  
            element.css("left",        l);
            element.css("top",         t);
            onMiximizeButtonClicked = maximizeWindow;
            
            if(onRestore){
                onRestore();
            }
        };
        
        element.css("width",  "100%");
        element.css("height", "100%");                      
        element.css("margin-top",  "0px");
        element.css("margin-left", "0px");
        element.css("left",  "0px");
        element.css("top", "0px");
        
        if(onMaximize){
            onMaximize();
        }
    }

    return function(e){
        onMiximizeButtonClicked();
    }
};


SANDBOX.getBodyAt = function(world, point, callback){
    // Get clicket body
    world.QueryPoint(function(fixture){
        callback(fixture.GetBody(), fixture);
        return false; /* first fixture only */
    }, point);
    return null;
};


SANDBOX.paddingLeft = function(length, text){
    text = "" + text;
    while(length > text.length){
        text = " " + text;
    }
    return text;
}; 


SANDBOX.formatNumber = function(n){
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
};

SANDBOX.readParam = function(name, callback){
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
};


SANDBOX.mergeBodies = function(base, ext){
    for(var fixture = ext.GetFixtureList(); fixture; fixture = fixture.GetNext()){

        var def = new b2FixtureDef();
        def.density     = fixture.GetDensity();
        def.friction    = fixture.GetFriction();
        def.isSensor    = fixture.IsSensor();
        def.restitution = fixture.GetRestitution(); 
        def.filter      = fixture.GetFilterData().Copy();
        def.userData    = (fixture.GetUserData() && fixture.GetUserData().copy) ? fixture.GetUserData().copy() : undefined;

        var shape = fixture.GetShape();
        if(shape instanceof b2PolygonShape){
            var vs = [];
            for(var i = 0; i < shape.GetVertexCount(); i++){
                vs.push(base.GetLocalPoint(ext.GetWorldPoint(shape.GetVertices()[i])));
            }
            def.shape = new b2PolygonShape();
            def.shape.SetAsArray(vs, vs.length);
        }else if(shape instanceof b2CircleShape){
            def.shape = new b2CircleShape(shape.GetRadius());
            def.shape.SetLocalPosition(base.GetLocalPoint(ext.GetWorldPoint(shape.GetLocalPosition().Copy())));
        }else{
            throw new TypeError();
        }
      
        base.CreateFixture(def);
    }   
    
    ext.GetWorld().DestroyBody(ext);
};

SANDBOX.___margeBodies = function(body1, body2){
    throw "Not implemented";

/*
    var b2Math = {
        MulFV: function(f, v){ return new b2Vec2(v.x * f, v.y * f); },
        AddVV: function(v, s){ return new b2Vec2(v.x + s.x, v.y + s.y); },
        MulXX: function(a, b){ 
            a = a.Copy();
            a.
        return new b2Mat33(
            new b2Vec3(
                a.col1.x * b.col1.x + a.col1.y * b.col2.x + a.col1.z * b.col2.x, 
                a.col2.x * b.col2.x + a.col2.y * b.col2.x + a.col1.z * b.col2.x,
                a.col3.x * b.col3.x + a.col3.y * b.col2.x + a.col1.z * b.col2.x,                 
        ); }
    };
*/

    function InverseTransform(t){
        return new b2Transform(
            new b2Vec2(-t.position.x, -t.position.y, -t.position.z), -t.R
        );
    }

    var b2Math = Box2D.Common.Math.b2Math;
    //body1.m_world.CheckUnlocked();
    
    // Compute consistent velocites for new bodies based on cached velocity
    
    var center1 /* :b2Vec2 */ = body1.GetWorldCenter();
    var center2 /* :b2Vec2 */ = body2.GetWorldCenter();
    
    var v1 /* :b2Vec2 */ = body1.GetLinearVelocity();
    var v2 /* :b2Vec2 */ = body2.GetLinearVelocity();
    
    var m1 /* :Number */ = body1.GetMass();
    var m2 /* :Number */ = body2.GetMass();
    
    var c /* :b2Vec2 */ = b2Math.AddVV(
        b2Math.MulFV(m1, center1),
        b2Math.MulFV(m2, center2));
    var mass /* :Number */ = m1 + m2;
    c.x /= mass;
    c.y /= mass;
    
    var v /* :b2Vec2 */ = b2Math.AddVV(
        b2Math.MulFV(m1, v1),
        b2Math.MulFV(m2, v2));
    
    var r1 /* :b2Vec2 */ = b2Math.SubtractVV(center1, c);
    var r2 /* :b2Vec2 */ = b2Math.SubtractVV(center2, c);
    
    var angularMomentum /* :Number */ = 
        body1.GetAngularVelocity() * body1.GetInertia() + m1 * b2Math.CrossVV(r1, v1)
        body2.GetAngularVelocity() * body2.GetInertia() + m2 * b2Math.CrossVV(r2, v2);
    
    var I /* :Number */ = 
        body1.GetInertia() + m1 * r1.LengthSquared() + 
        body2.GetInertia() + m2 * r2.LengthSquared();
        
    // Copy fixtures
    //var xf /* :b2Transform */ = b2Math.MulXX(
    //    body1.GetTransform().GetInverse(),
    //    body2.GetTransform());
        
    var xf_t = new b2Mat33(
        new b2Vec3(1, 0, -body2.GetTransform().position.x),
        new b2Vec3(1, 0, -body2.GetTransform().position.y),
        new b2Vec3(1, 0, -body2.GetTransform().position.z)
    );
    var xf_r = new b2Mat33(
        new b2Vec3(Math.cos(-body2, 0, -body1.GetTransform().position.x),
        new b2Vec3(1, 0, -body1.GetTransform().position.y),
        new b2Vec3(1, 0, -body1.GetTransform().position.z))
    );
    
        
    var f /* :b2Fixture */;
    for (f = body2.m_fixtureList; f; f=f.m_next)
    {
        var fd /* :b2FixtureDef */ = f.GetDefinition();
        fd.shape.MulBy(xf);
        body1.CreateFixture(fd);
    }
    
    var md /* :b2MassData */ = new b2MassData();
    md.center = b2Math.MulXT(body1.GetTransform(), c);
    md.I = I + mass * md.center.LengthSquared();
    md.mass = mass;
    SetMassData(md);
    
    body1.m_linearVelocity.x = (v1.x * m1 + v2.x * m2) / mass;
    body1.m_linearVelocity.y = (v1.y * m1 + v2.y * m2) / mass;
    body1.m_angularVelocity = angularMomentum / I;
    
    body1.m_world.DestroyBody(body2);
    
    body1.SynchronizeFixtures();   
};



SANDBOX.createDropDownPanel = function(title, update){

    var property_root = $("<div class=\"property_content\"></div>");
        var property_title = $("<h5 class=\"property_title\"></h5>").text(title + "▼");
        var clickToggle = $("<div class=\"property_dialog_inner\" />");
        
    property_root.append(property_title, clickToggle);    

    property_title.click(function(e){
        self.toggle();
        e.stopPropagation();
    });    
    
    var sections = [];
    
    var self = Object.create(null, {
        sandbox: { writable: true, value: undefined },
    
        body: { get: function(){
            if(self.sandbox.selectedBodies.length > 0){
                return self.sandbox.selectedBodies[self.sandbox.selectedBodies.length - 1];
            }else{
                return undefined;
            }
        } },
        
    
        root: { value: property_root },
        
        toggle: { value: function(){
            clickToggle.slideToggle();    
        }},
        
        update: { writable: true, value: function(){
            if(update){
                sections.forEach(function(section){
                    section.update();
                });
                update();
            }
        }},


        createSection: { value: function(visible){
            var autoTogglePane = $("<div class=\"property_auto_toggle\" />");
                var contentPane = $("<div class=\"property_scrollpane\" />");    
            clickToggle.append(autoTogglePane);
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
            sections.push({
                update: function(){
                    contentPane.css("max-height", ($(window).height() - 120) + "px");
                }
            });
            return section;
        }}
    });
    return self;
};









SANDBOX.getBodyAABB = function(body){
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
        aabb.lowerBound = new b2Vec2(bl, bt);
        aabb.upperBound = new b2Vec2(br, bb);
        return aabb;
    }else{
        return undefined;
    }
};

