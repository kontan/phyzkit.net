"use strict";

SANDBOX.createTextViewDialog = function(container, text, callback){
    var textarea   = $("<textarea wrap=\"soft\" style=\"overflow:scroll; width:100%; height: 100%;\"/>").val(text);
    
    // Firefoxのバグ？　直接 textarea の left, right を設定しても無視されてしまうので、
    // 他の要素に 100% で貼り付ける。Webkit だとレイアウトできているように見えるが、
    // スクロールバーの表示がおかしい。Webkit のほうのバグかもしれない。
    var textarea_div = $("<div class=\"serialized_world_textarea \"></div>").append(textarea);
    
    var close      = $("<div class=\"tool_button button serialized_world_textarea_close\">閉じる</div>").click(function(){
        background.fadeOut("normal", function(){
            background.remove();
            callback(textarea.text());
        });
    });
    var background = $("<div class=\"dialog_background\" />").append(textarea_div, close);
    container.append(background);
    background.fadeIn("normal");
};