/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;
	export function createLayeredBackground(backgroundList):ViewportBackground{
	    return {
	        paint: function(g, viewport){
	            backgroundList.forEach(function(background){
	                g.save();
	                background.paint(g, viewport);
	                g.restore();
	            });
	        }
	    }
	};
}