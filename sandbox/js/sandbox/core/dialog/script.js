"use strict";

SANDBOX.createScriptPad = function(container){
    var background = $("<div class=\"dialog_background\" />");
    var textarea   = $("<textarea class=\"textarea_script_pad\" wrap=\"off\" />");
    var output     = $("<textarea class=\"textarea_script_console\" />");
    var close      = $("<div class=\"tool_button button\">閉じる</div>").click(function(){
        background.fadeOut("normal", function(){
            background.remove();
        });
    });
    var execute    = $("<div class=\"tool_button button\">実行</div>").click(function(){
        var script = textarea.val();
        try{
            var result = eval(script); 
            console.log(result);
            if(result) output.val(result + "\n");
            return true;
        }catch(err){
            console.log(err);
            output.val(err + "\n");
            return false;
        }
    });
    var exe_close  = $("<div class=\"tool_button button\">実行＆閉じる</div>").click(function(){
        execute.triggerHandler("click");
        close.triggerHandler("click");
    });
    var erase      = $("<div class=\"tool_button button\">消去</div>").click(function(){
        textarea.val("");
    });
    
    background.append(textarea, output, close, execute, exe_close, erase);
    container.append(background);
    background.fadeIn("normal");
};