/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>
module Phyzkit{
    import M = Box2D.Common.Math;
    import D = Box2D.Dynamics;
    import S = Box2D.Collision.Shapes;
    import C = Box2D.Collision;
    
    export function createObjectEditor(sandbox:SandBox):DropDownWindow{
        function buildEditor(object){

            
                panel.content.empty();
                if(object instanceof Box2D.Dynamics.Joints.b2RevoluteJoint){
                    currentEditor = createRevoluteJointEditor(sandbox, object);
                    panel.content.append("<h3>回転ジョイント</h3>");
                    panel.content.append(currentEditor.control);
                    panel.content.slideDown("fast");
                    
                }else if(object instanceof Box2D.Dynamics.b2Body){
                    panel.content.append("<h3>ボディ</h3>");            
                    currentEditor = createBodyEditor(sandbox, object);
                    panel.content.append(currentEditor.control);
                    panel.content.slideDown("fast");
                }else if(object instanceof Box2D.Dynamics.b2Fixture){
                    panel.content.append("<h3>フィクスチャ</h3>");            
                    currentEditor = createFixtureEditor(sandbox, object);
                    panel.content.append(currentEditor.control);
                    panel.content.slideDown("fast");
                }
        }
        
        function update(){
            var selectedObject = sandbox.selectedObjects[0];
            if( currentEditor && selectedObject !== currentEditor.object){
                        currentEditor.control.remove();
                        currentEditor = undefined;        
            }
            if( ! currentEditor || currentEditor.object !==  selectedObject){
                buildEditor(selectedObject);
            }
            
            if(currentEditor){
                currentEditor.update();
            }
        }

        var currentEditor;
        
        var panel:DropDownWindow = new DropDownWindow("プロパティ", 
            function(){
                return sandbox.selectedObjects.length > 0;
            },
            update
        );
        
        return panel;
    }
}