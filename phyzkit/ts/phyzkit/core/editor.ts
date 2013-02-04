/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    export interface Editor{
        input:JQuery;
        update():void;
    }

    export interface EditorOption{
        input:JQuery;
        content: JQuery;
        update(any):void;
    }

    export class EditList{
        root:JQuery;
        editList:Editor[];

        constructor(){
            this.root = $("<div></div>");
            this.editList = [];
        }

        createEdit(type:string, label:string, onUpdate:(JQuery)=>void, onChange:(JQuery)=>void):Editor{
            var input:JQuery = $("<input type=\"" + type + "\"></input>").change(function(){
                onChange(input);
            });
            this.root.append($("<div class=\"edit_div_row\"/>").append(
                $("<div style=\"float:left;\" class=\"edit_div_label\"/>").text(label), 
                $("<div style=\"float:left;\" class=\"edit_div_input\"/>").append(input),
                $("<div style=\"clear:both;\" />")
            ));
            return {
                input: input,
                update: function(){
                    if(input.get(0) !== $(":focus").get(0) && onUpdate){
                        onUpdate(input);
                    }
                }
            };    
        }

        createBooleanEdit(label, onUpdate:()=>bool, onChange:(bool)=>void):Editor{
            var edit:Editor = this.createEdit("checkbox", label, 
                function(input){
                    if(onUpdate()){
                        if(input.attr("checked") === undefined){
                            input.attr("checked", "checked");
                        }
                    }else{
                        if(input.attr("checked")){
                            input.removeAttr("checked");
                        }                    
                    }            
                }, 
                function(input){
                    if(onChange){
                        onChange(input.attr("checked") ? true : false);
                    }
                }
            );
            if( ! onChange){
                edit.input.attr("readonly", "readonly");
            }
            this.editList.push(edit);
            return edit;
        }
        
        createNumberEdit(label:string, step:number, onUpdate:()=>number, onChange:(number)=>void):Editor{
            var edit:Editor = this.createEdit("number", label, 
                function(input){
                    if(onUpdate() === undefined){
                        console.log("hoge");
                    }
                    var value = onUpdate().toFixed(8).substr(0, 10);
                    if(value === "-0.0000000") value = "0.00000000";
                    input.val(value);
                }, 
                function(input){
                    if(onChange){
                        onChange(parseFloat(input.val()));
                    }
                }
            );
            edit.input.attr("step", step.toString());
            if( ! onChange){
                edit.input.attr("readonly", "readonly");
            }
            this.editList.push(edit);
            return edit;
        }
        
        createEnumEdit(label:string, options:{text:string;value:any;}[], onUpdate:()=>any, onChange):Editor{



            function createOption(option:{text:string;value:any;}):EditorOption{
                var input:JQuery = $("<input type=\"radio\"></input>").text(option.text).change(function(){
                    onChange(option.value);
                });
                return {
                    input: input,
                    content: $("<div></div>").append(input, option.text),
                    update: function(value){
                        if(value === option.value){
                            input.attr("checked", "checked");
                        }else{
                            input.removeAttr("checked");
                        }
                    }
                };
            }    
            
            var optionList:EditorOption[] = [];
            var div_option:JQuery = $("<div></div>");
            for(var i = 0; i < options.length; i++){
                var option:EditorOption = createOption(options[i]);
                optionList.push(option);
                div_option.append(option.content);
            }
              
            this.root.append($("<div class=\"edit_div_row\"/>").append(
                $("<div style=\"float:left;\" class=\"edit_div_label\"/>").text(label), 
                $("<div style=\"float:left;\" class=\"edit_div_input\"/>").append(div_option),
                $("<div style=\"clear:both;\" />")
            ));
            var edit:Editor = {
                input:undefined,
                update: function(){
                    var current = onUpdate();
                    optionList.forEach(function(op, i){
                        op.update(current);
                    });
                }
            };    
            this.editList.push(edit);
            return edit;
        }
        
        update():void{
            this.editList.forEach(function(f){
                f.update();
            });
        }
    }

    export function createEditList():EditList{
        return new EditList();
    };
}
