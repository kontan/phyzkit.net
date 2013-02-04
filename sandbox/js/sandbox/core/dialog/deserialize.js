SANDBOX.showDeserializeMenu = function(container, sandbox, callback){ 

    var inner = $("<div class=\"menu_inner_pane\" />");
    inner.css("top", "20px");
    inner.css("left", "20px");
    inner.css("bottom", "20px");
    inner.css("right", "20px");
    inner.css("position", "absolute");
    inner.css("max-width", "none");
    inner.click(function(event){
        event.stopPropagation();
    });
    
    sandbox.serializedWorldList.forEach(function(item){
        var img = $("<img class=\"button\" border=\"0\" />");
        img.attr("src", item.thumbnail); 
        img.css("width", "90px");
        img.css("height", "30px");
        img.click(function(){
            sandbox.loadWorldFromJSON(item.data);
            self.close();
        });
        inner.append(img);
    });
    
    var background = $("<div />");
    background.css("width", "100%");
    background.css("height", "100%");
    background.css("margin", "0px");
    background.css("display", "none");
    background.css("background-color", "rgba(0, 0, 0, 0.4)");
    background.css("position", "absolute");
    background.css("top", "0px");
    background.css("left", "0px");
    background.click(function(){
        self.close();
    });
    background.append(inner);
    container.append(background);
    background.fadeIn("normal");
    
    var self = {
        close: function(){
            background.fadeOut("normal", background.remove);
        }
    };
    
    return self;
};
