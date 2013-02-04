"use strict";

SANDBOX.createGridBackground = function(){
    return function(g, viewport){
        g.fillStyle = "white";
        g.fillRect(0, 0, viewport.canvas.width(), viewport.canvas.height());
    
        var tl = viewport.toWorldCoords(new b2Vec2(0, 0));
        var br = viewport.toWorldCoords(new b2Vec2(viewport.canvas.width(), viewport.canvas.height()));
        
        var lines = 0;

        for(var i = -5; i <= 5; i++){                                               // i �͖ڐ���̃X�P�[���Bi �Ԗڂ̖ڐ���� 10^i ���Ƃ̃O���b�h�B
            var v = Math.LOG10E * Math.log(viewport.camera.scale);                  // ���݂̃J�����̊g�嗦�B10 ��̑ΐ��\��
            var t = 0.5 * Math.min(1, Math.max(0, 1 - 0.8 * Math.abs(v + i - 2)));  // 0.8 �͌������B�������Ȃ�قǁA���̖ڐ��肪�\�������g�嗦�ƃI�[�o�[���b�v����̂ŁA���������ׂ�������
                                                                                    // -2 �̓J�����g�嗦 log10(100) == 2 �̂Ƃ��ɁAi == 0 �܂� Box2d �X�P�[���Œ��� 10^0 == 1 �̖ڐ��肪�����Ƃ��Z���Ȃ�悤�ɂ���l�B  
            if(t > 0){                      
                var s = Math.pow(10, i);
                g.beginPath();
                for(var x = Math.ceil(tl.x / s) * s; x < br.x; x += s){
                    var p = viewport.toScreenCoords(new b2Vec2(x, 0)); 
                    g.moveTo(p.x, 0);
                    g.lineTo(p.x, +10000);
                    lines++;
                }
                for(var y = Math.floor(tl.y / s) * s; y >= br.y; y -= s){
                    var p = viewport.toScreenCoords(new b2Vec2(0, y)); 
                    g.moveTo(0, p.y);
                    g.lineTo(+10000, p.y);
                    lines++;
                }
                g.lineWidth = 1;
                g.strokeStyle = "rgba(0, 0, 0, " + t.toFixed(4) + ")"; // "rgb(" + c + "," + c + "," + c + ")";
                g.stroke();
            }
        }
        
        //console.log(lines);
    };
};