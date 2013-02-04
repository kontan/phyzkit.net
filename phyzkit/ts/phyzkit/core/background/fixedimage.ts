/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;
    function createFixedImageBackground(image):ViewportBackground{
	    return {
	        paint: function(g, viewport){
	            var imageAspectRatio    = image.width / image.height; 
	            var viewportAspectRatio = viewport.canvas.width() / viewport.canvas.height();
	            var s = Math.max(imageAspectRatio, viewportAspectRatio); 
	          
	            g.drawImage(image, 0, 0);
	        }
	    }
	};
}