"use strict";

// box2d namespace import
var b2Vec2          = Box2D.Common.Math.b2Vec2;
var b2BodyDef       = Box2D.Dynamics.b2BodyDef;
var b2Body          = Box2D.Dynamics.b2Body;
var b2FixtureDef    = Box2D.Dynamics.b2FixtureDef;
var b2Fixture       = Box2D.Dynamics.b2Fixture;
var b2World         = Box2D.Dynamics.b2World;
var b2FilterData    = Box2D.Dynamics.b2FilterData;
var b2MassData      = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape  = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape   = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw     = Box2D.Dynamics.b2DebugDraw;
var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;