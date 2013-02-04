// サムネイルを
//
/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;

    export class WorldDeserializeDialog{
        private background:JQuery;

        constructor(private container:JQuery, sandbox:SandBox){
            var inner = $('<div class="menu_inner_pane" />');
            inner.css("top", "20px");
            inner.css("left", "20px");
            inner.css("bottom", "20px");
            inner.css("right", "20px");
            inner.css("position", "absolute");
            inner.css("max-width", "none");
            inner.click((event)=>{
                event.stopPropagation();
            });

            var listPane = $('<div />');
            listPane.css("position", "absolute");
            listPane.css("top",    "12px");
            listPane.css("left",   "12px");
            listPane.css("right",  "12px");
            listPane.css("bottom", "50px");
            listPane.css("border", "solid 1px rgba(255,255,255,0.4)");
            listPane.css("overflow", "auto");
            
            inner.append(listPane);

            var buttonBox = $('<div/>');
            buttonBox.css("position", "absolute");
            buttonBox.css("height", "25px");
            buttonBox.css("left",   "12px");
            buttonBox.css("right",  "12px");
            buttonBox.css("bottom", "12px");
            //buttonBox.css("border", "solid 1px white");
            inner.append(buttonBox);

            sandbox.saveDataList.forEach((item:SerializedWorld)=>{
                var img = $('<img class="button" border="0" />');
                img.attr("src", item.dataURL); 
                img.attr("width", "120");
                img.attr("height", "80");
                img.css("width", "90px");
                img.css("height", "30px");
                img.click(()=>{
                    sandbox.loadWorldFromText(item.serializedWorld);
                    this.close();
                });
                listPane.append(img);
            });

            var loadButton = $('<div class="button" style="width:4em;height:12px;float:left;">Load</div>');
            buttonBox.append(loadButton);

            var closeButton = $('<div class="button" style="width:4em;height:12px;float:left;">Cancel</div>');
            buttonBox.append(closeButton);

            var deleteButton = $('<div class="button" style="width:4em;height:12px;float:left;">Delete</div>');
            buttonBox.append(deleteButton);

            this.background = $("<div />");
            this.background.css("width", "100%");
            this.background.css("height", "100%");
            this.background.css("margin", "0px");
            this.background.css("display", "none");
            this.background.css("background-color", "rgba(0, 0, 0, 0.4)");
            this.background.css("position", "absolute");
            this.background.css("top", "0px");
            this.background.css("left", "0px");
            this.background.click(()=>{
                this.close();
            });
            this.background.append(inner);
            container.append(this.background);
            this.background.fadeIn("normal");
        }

        close(){
            this.background.fadeOut("normal", ()=>{
                this.background.remove();
            });
        }
    }
}
