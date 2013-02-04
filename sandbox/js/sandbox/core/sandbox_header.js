"use strict";

var SANDBOX = (function(){
    var userDataDeserializerTable = {};
    return {
        putUserDataDeserializer: function(type, callback){
            if(userDataDeserializerTable[type]){
                console.log("WARNING: SANDBOX.putUserDataDeserializer: body userdata type overrided: " + type);
            }
            userDataDeserializerTable[type] = callback;
        },
        deserializeUserData: function(data){
            if(data === null){
                return null;
            }else{
                var deserializer = userDataDeserializerTable[data.type];
                if(deserializer){
                    return deserializer(data);
                }else{
                    console.log("Sandbox.deserializeWorld: Unknown User Data Type: " + data.type);
                }
            }
        }
    };
})();