function format(v){
    if(v === undefined || v === null){
        throw new TypeError();
    }
    return /* + ‚ª‚Â‚¢‚Ä‚é‚Æƒ_ƒ‚Á‚Û‚¢ (v >= 0 ? "+" : "") + */ v.toFixed(10).substr(0, 10);
}

SANDBOX.createStringProperty = function(parent, label, callback){
    var labelElem = $("<td class=\"property_label\"/>").append(label);
    var input = $("<input type=\"text\"></input>");
    input.change(function(){
        callback(input.val());
        //self.body.SetAwake(true);
        //self.body.SetActive(true);  
    });
    var valueTD = $("<td />").append(input);
    var tr   = $("<tr />").append(labelElem, valueTD);
    parent.append(tr);
    return input;
};

SANDBOX.createEnumEditor = function(parent, label, buttons){
    var bodyTypeLabel = $("<td  class=\"property_label\" />").text(label);
    var inputTD = $("<td />");
    var inputs = [];
    buttons.forEach(function(button){
        var type = button.type;
        var text = button.text;
        var input = $("<input type=\"radio\" name=\"bodytype\ class=\"bodytype\" />");
        input.val(type);
        input.addClass("bodyType_" + type);
        input.change(function(){
            self.body.SetType(parseFloat(inputTD.find("input:checked").val()));
        });
        var div = $("<div />").append(input, text);
        inputTD.append(div);
        inputs.push(input);
    });
    
    var tr = $("<tr />").append(bodyTypeLabel, inputTD);
    parent.append(tr);
    
    return {
        update: function(){
            inputs.forEach(function(input){
                input.removeAttr("checked");
            });
            $(".bodyType_" + self.body.GetType()).attr("checked", "checked");
        }
    }
};

SANDBOX.createNumericProperty = function(label, step, callback, parent, getValueFunc){
    var input = $("<input type=\"number\"></input>");
    input.attr("step", "" + step);
    if(callback == undefined){
        input.attr("readonly", "readonly");
    }
    input.change(function(){
        callback(parseFloat(input.val()));
        //self.body.SetAwake(true);
        //self.body.SetActive(true);  
    });
    //input.get(0).addEventListener("DOMMouseScroll", function(e){ e.preventDefault(); });
    //input.get(0).addEventListener("mousewheel",     function(e){ e.preventDefault(); });
    var labelElem = $("<td class=\"property_label\" />").append(label);
    var valueElem = $("<td class=\"property_value\" />").append(input);
    var tr   = $("<tr />").append(labelElem, valueElem);
    (parent ? parent : propatyDialog).append(tr);
    return { 
        input: input, 
        update: function(){ 
            if(getValueFunc && input.get(0) !== $(":focus").get(0)){
                var value = getValueFunc();
                if(value != undefined && value != null){
                    input.val(format(value));
                }
            }
        }         
    };
};

SANDBOX.createBooleanProperty = function(label, callback, parent, getValueFunc){
    var input = $("<input type=\"checkbox\"></input>");
    input.change(function(){
        callback(input.attr("checked") ? true : false);
        //body.SetAwake(true);
        //body.SetActive(true);  
    });
    var tr   = $("<tr />").append($("<td  class=\"property_label\"/>").append(label), $("<td />").append(input));
    (parent ? parent : propatyDialog).append(tr);
    return { 
        input: input,
        update: function(){
            if(input.get(0) !== $(":focus").get(0)){
                if(getValueFunc && getValueFunc()){
                    input.attr("checked", "checked"); 
                }else{ 
                    input.removeAttr("checked"); 
                }
            }
        }
    };
};



SANDBOX.createStringProperty = function(parent, label, callback, onUpdate){
    var labelElem = $("<td class=\"property_label\"/>").append(label);
    
    var input = $("<input type=\"text\"></input>");
    input.change(function(){
        callback(input.val());
        //self.body.SetAwake(true);
        //self.body.SetActive(true);  
    });
    var valueTD = $("<td />").append(input);
    
    var tr   = $("<tr />").append(labelElem, valueTD);
    parent.append(tr);
    return {
        input: input,
        update: function(){
            if(input.get(0) !== $(":focus").get(0) && onUpdate){    
                input.val(onUpdate());
            }
        }
    };
};




SANDBOX.createEnumEditor = function(parent, label, buttons, onChange, onUpdate){
    var bodyTypeLabel = $("<td  class=\"property_label\" />").text(label);
    var inputTD = $("<td />");
    var inputs = [];
    buttons.forEach(function(button){
        var type = button.type;
        var text = button.text;
        var input = $("<input type=\"radio\" name=\"bodytype\ class=\"bodytype\" />");
        input.val(type);
        input.addClass("bodyType_" + type);
        input.change(function(){
            if(onChange){
                onChange(inputTD.find("input:checked").val());
            }
        });
        var div = $("<div />").append(input, text);
        inputTD.append(div);
        inputs.push(input);
    });
    
    var tr = $("<tr />").append(bodyTypeLabel, inputTD);
    parent.append(tr);
    
    return {
        update: function(){
            if(onUpdate){
                onUpdate(inputs);
            }    
        }
    }
};