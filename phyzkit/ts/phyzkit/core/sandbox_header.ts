/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    export class SANDBOX{
        static userDataDeserializerTable:{[index:string]:(data:any)=>any;} = {};

        static putUserDataDeserializer(type:string, callback:(data:any)=>any){
            if(userDataDeserializerTable[type]){
                console.log("WARNING: SANDBOX.putUserDataDeserializer: body userdata type overrided: " + type);
            }
            userDataDeserializerTable[type] = callback;
        }
        static deserializeUserData(data:any){
            if(data){
                var deserializer = userDataDeserializerTable[data.type];
                if(deserializer){
                    return deserializer(data);
                }else{
                    console.log("Sandbox.deserializeWorld: Unknown User Data Type: " + data.type);
                }
            }else{
                return undefined;
            }
        }
    }
}
