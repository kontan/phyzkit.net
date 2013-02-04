/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    export function createGridBackground(red?, green?, blue?):ViewportBackground{
        if(red   === undefined) red   = 0;
        if(green === undefined) green = 0;
        if(blue  === undefined) blue  = 0;
        
        return {
            paint: function(g, viewport){
                var tl = viewport.toWorldCoords(new M.b2Vec2(0, 0));
                var br = viewport.toWorldCoords(new M.b2Vec2(viewport.canvas.width(), viewport.canvas.height()));
                
                var lines = 0;

                for(var i = -5; i <= 5; i++){                                               // i は目盛りのスケール。i 番目の目盛りは 10^i ごとのグリッド。
                    var v = Math.LOG10E * Math.log(viewport.camera.scale);                  // 現在のカメラの拡大率。10 底の対数表示
                    var t = 0.5 * Math.min(1, Math.max(0, 1 - 0.8 * Math.abs(v + i - 2)));  // 0.8 は減少率。小さくなるほど、他の目盛りが表示される拡大率とオーバーラップするので、メモリが細く見える
                                                                                            // -2 はカメラ拡大率 log10(100) == 2 のときに、i == 0 つまり Box2d スケールで長さ 10^0 == 1 の目盛りがもっとも濃くなるようにする値。  
                    if(t > 0){                      
                        var s = Math.pow(10, i);
                        g.beginPath();
                        for(var x = Math.ceil(tl.x / s) * s; x < br.x; x += s){
                            var p = viewport.toScreenCoords(new M.b2Vec2(x, 0)); 
                            g.moveTo(p.x, 0);
                            g.lineTo(p.x, +10000);
                            lines++;
                        }
                        for(var y = Math.floor(tl.y / s) * s; y >= br.y; y -= s){
                            var p = viewport.toScreenCoords(new M.b2Vec2(0, y)); 
                            g.moveTo(0, p.y);
                            g.lineTo(+10000, p.y);
                            lines++;
                        }
                        var color = "rgba(" + red + ", " + green + ", " + blue + ", " + t.toFixed(4) + ")";
                        g.lineWidth = 1;
                        g.strokeStyle = color;
                        g.stroke();
                    }
                }
            }
        };
    }
}