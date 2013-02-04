/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;
	export function createSimpleBackground(fillStyle):ViewportBackground{
	    return {
	        paint: function(g, viewport){
	            g.fillStyle = fillStyle;
	            g.fillRect(0, 0, viewport.canvas.width(), viewport.canvas.height());
	        }
	    };
	}
}