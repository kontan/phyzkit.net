SANDBOX.showMenu = function(container, items, callback){ 

    var inner = $("<div class=\"menu_inner_pane\" />");
    items.forEach(function(item){
        inner.append(item);
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

SANDBOX.createMenuItem = function(label, click){
    var div = $("<div class=\"menu_item\" />").text(label);
    if(click){
        div.click(click);
    }
    return div;
};
