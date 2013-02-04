"use strict";

// class BoxCamera
//      Replesents scale and position of camera. Camera object is imutable.
SANDBOX.Camera = Object.freeze(Object.create(null, {
    // BoxCamera create(Number scale, b2Vec2 point)
    //      Constractor.
    //      scale: Viewing scale. 1 of length in Box2DWorld replesents 100 pixels in Canvas. The default value is 100.
    create: { value: function(scale, point){
        var that = Object.freeze(Object.create(null, {
            scale: { value: scale ? scale : 100 },
            point: { value: point ? point.Copy() : new b2Vec2(0, 0) },
            
            setScale: { value: function(s){
                return SANDBOX.Camera.create(s, that.point);
            }},
            
            setPoint: { value: function(p){
                return SANDBOX.Camera.create(that.scale, p);
            }},
            
            // Camera interpolate(Number ratio, Camera camera)
            //      Blend two camera. For a, b of Camera, a.interpolate(0, b) == a && a.interpolate(1, b) == b 
            interpolate: { value: function(ratio, camera){
                return SANDBOX.Camera.create(
                    that.scale + (camera.scale - that.scale) * ratio,
                    new b2Vec2(
                        that.point.x + (camera.point.x - that.point.x) * ratio,
                        that.point.y + (camera.point.y - that.point.y) * ratio
                    )
                );
            }}
        }));
        return that;
    }}
}));