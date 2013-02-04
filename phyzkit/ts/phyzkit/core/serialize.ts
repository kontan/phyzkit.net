/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    var TYPE_JOINT_REVOLUTE:string = "phyzkit_joint_revolute";


    export function serializeRevolveJoint(revolve:Box2D.Dynamics.Joints.b2RevoluteJoint):any{

    }

    export function serializeJoint(joint:Box2D.Dynamics.Joints.b2Joint):any{
        if(joint instanceof Box2D.Dynamics.Joints.b2RevoluteJoint){
            var m_joint:any = joint;
            return {
                type          : TYPE_JOINT_REVOLUTE,
                bodyA         : "hogehoge",
                bodyB         : "hogehoge",
                localAnchorA  : m_joint.m_localAnchor1.Copy(),
                localAnchorB  : m_joint.m_localAnchor2.Copy(),
                referenceAngle: m_joint.m_referenceAngle,
                impulse       : m_joint.m_impulse.Copy(),
                motorImpulse  : m_joint.m_motorImpulse,
                lowerAngle    : m_joint.m_lowerAngle,
                upperAngle    : m_joint.m_upperAngle,
                maxMotorTorque: m_joint.m_maxMotorTorque,
                motorSpeed    : m_joint.m_motorSpeed,
                enableLimit   : m_joint.m_enableLimit,
                enableMotor   : m_joint.m_enableMotor,
                limitState    : m_joint.m_limitState
            };
        }
    }

    export function serializeFixture(fixture:Box2D.Dynamics.b2Fixture):any{
        // Copy shape properties
        var fixtureDef:any = { shape: {} };
        if(fixture.GetDensity()     !== 0    ) fixtureDef.density     = fixture.GetDensity();
                                               fixtureDef.filterData  = fixture.GetFilterData();
        if(fixture.GetFriction()    !== 0    ) fixtureDef.friction    = fixture.GetFriction();
        if(fixture.IsSensor()       !== false) fixtureDef.sensor      = fixture.IsSensor();
        if(fixture.GetRestitution() !== 0    ) fixtureDef.restitution = fixture.GetRestitution();
        // Serialize user data
        if(fixture.GetUserData() && fixture.GetUserData().serialize){
            fixtureDef.userData    = fixture.GetUserData().serialize(fixture);
        }else{
            //console.log("WARNING serializeFixture: fixture had no user data or serialize function.");    
        }
        // Serialize the shape 
        var shape = fixture.GetShape();
        if(shape instanceof S.b2CircleShape){
            var circle = <S.b2CircleShape> shape;
            fixtureDef.shape.type   = "b2CircleShape";
            fixtureDef.shape.pos    = circle.GetLocalPosition();
            fixtureDef.shape.radius = circle.GetRadius();
        }else if(shape instanceof S.b2PolygonShape){
            var polygon = <S.b2PolygonShape> shape;
            fixtureDef.shape.type   = "b2PolygonShape";
            fixtureDef.shape.vertices = polygon.GetVertices();
        }else{
            var error = new Error();
            error.name = "Internal Error";
            error.message = "Box2DViewer.serialize: Unsupported fixture type.";
            throw error;
        }
        return fixtureDef;
    }

    export function serializeBody(body:Box2D.Dynamics.b2Body):any{
        // Copy body definition
        var def:any = body.GetDefinition();
        // Copy mass data
        var massData = new S.b2MassData();
        body.GetMassData(massData);
        def.massData = { center: massData.center, I: massData.I, mass: massData.mass };
        // Serialize user data
        if(def.userData && def.userData.serialize){
            def.userData = def.userData.serialize(); 
        }else{
            //console.log("WARNING serializeBody: body had no user data or serialize function.");
        }
        // Serialize fixtures
        def.fixtures = [];
        for(var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()){
            def.fixtures.push(serializeFixture(fixture));
        }
        return def;
    }



    export function deserializeAndCreateBody(world:Box2D.Dynamics.b2World, bodyDef:any, userDataDeserializer?:(data:any)=>any):Box2D.Dynamics.b2Body{
        if( ! userDataDeserializer){
            userDataDeserializer = SANDBOX.deserializeUserData;
        }
        var body = world.CreateBody(bodyDef);
        body.SetUserData(userDataDeserializer(bodyDef.userData));
        bodyDef.fixtures.forEach(function(fixtureDef){
            var filter = new D.b2FilterData();
            filter.categoryBits = fixtureDef.filterData.categoryBits;
            filter.groupIndex   = fixtureDef.filterData.groupIndex;
            filter.maskBits     = fixtureDef.filterData.maskBits;
            var def = new D.b2FixtureDef();
            def.density     = fixtureDef.density;
            def.filter      = filter;
            def.friction    = fixtureDef.friction;
            def.isSensor    = fixtureDef.isSensor;
            def.restitution = fixtureDef.restitution;
            def.userData    = userDataDeserializer(fixtureDef.userData);
            if(fixtureDef.shape.type == "b2CircleShape"){
                var circle = new S.b2CircleShape(fixtureDef.shape.radius);
                circle.SetLocalPosition(fixtureDef.shape.pos);
                def.shape = circle;
            }else if(fixtureDef.shape.type == "b2PolygonShape"){
                var polygon = new S.b2PolygonShape();
                polygon.SetAsArray(fixtureDef.shape.vertices, fixtureDef.shape.vertices.length);
                def.shape = polygon;
            }else{
                throw new Error("deserializeAndCreateBody: unknown shape type.");
            }
            body.CreateFixture(def);
        });
        if(bodyDef.massData){
            var massData = new S.b2MassData();
            massData.center.x = bodyDef.massData.center.x;
            massData.center.y = bodyDef.massData.center.y;
            massData.I      = bodyDef.massData.I;
            massData.mass   = bodyDef.massData.mass;
            body.SetMassData(massData);
        }
        return body;
    }



    // Object serialize(b2World world)
    //      Serialize b2World to JSON data object. 
    //      Box2DViewer.serialize does NOT serialize all of world. 
    //      ContactFilter, ContactListener, DebugDraw and DestructionListener are NOT serialized.
    //
    export function serializeWorld(world:Box2D.Dynamics.b2World):any{
        var bodies = [];
        for(var body = world.GetBodyList(); body && body.GetNext; body = body.GetNext()){
            bodies.push(serializeBody(body));
        }
        var joints = [];
        for(var joint = world.GetJointList(); joint; joint = joint.GetNext()){
            joints.push(serializeJoint(joint));
        }
        return {
            gravity: world.GetGravity(),
            bodies: bodies,
            joints: joints,
            warmStarting: world.m_warmStarting,
            continuousPhysics: world.m_continuousPhysics
        };
    }    

    // b2World deserialize(Object obj, Function<Object,Object> userDataDeserializer, Function<Object,Object> fictureUserDataDeserializer)
    //      Desirialize b2World from JSON data object.
    // userDataDeserializer は ボディとフィクスチャ両方のユーザデータで共通のテーブルになっている。
    // 本来ならボディとフィクスチャそれぞれのユーザデータは型が異なるので別テーブルにすべきだが、
    // 面倒なのでとりあえず一緒くたでいく
    export function deserializeWorld(data:any, userDataDeserializer?:(data:any)=>any):Box2D.Dynamics.b2World{
        if( ! userDataDeserializer){
            userDataDeserializer = SANDBOX.deserializeUserData;
        }
        var world = new D.b2World(data.gravity ? data.gravity : new M.b2Vec2(0, 0), true);
        if(data.bodies){
            data.bodies.forEach((bodyDef)=>{
                deserializeAndCreateBody(world, bodyDef, userDataDeserializer);
            });
        }
        return world;
    }
}