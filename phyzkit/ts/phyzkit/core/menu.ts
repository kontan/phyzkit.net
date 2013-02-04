/// <reference path="../../jquery.d.ts"/>
/// <reference path="../../box2dwebambient.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;

    export interface Menu{
        close():void;
    }

    export function showMenu(container:JQuery, items:JQuery[], callback?):Menu{ 

        var inner:JQuery = $("<div class=\"menu_inner_pane\" />");
        items.forEach(function(item:JQuery){
            inner.append(item);
        });
        
        var background:JQuery = $("<div />");
        background.css("width", "100%");
        background.css("height", "100%");
        background.css("margin", "0px");
        background.css("display", "none");
        background.css("background-color", "rgba(0, 0, 0, 0.4)");
        background.css("position", "absolute");
        background.css("top", "0px");
        background.css("left", "0px");
        background.click(function(){
            menu.close();
        });
        background.append(inner);
        container.append(background);
        background.fadeIn("normal");
        
        var menu:Menu = {
            close: function(){
                background.fadeOut("normal", background.remove);
            }
        };
        
        return menu;
    };

    export function createMenuItem(label:string, click?:(eventObject: JQueryEventObject)=>any):JQuery{
        var div:JQuery = $("<div class=\"menu_item\" />").text(label);
        if(click){
            div.click(click);
        }
        return div;
    }
}