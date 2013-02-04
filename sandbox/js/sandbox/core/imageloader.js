"use strict";

// class ImageLoader
//
SANDBOX.ImageLoader = Object.freeze(Object.create(null, {
    create: { value: function(){
        var images = [],
            loadedImages = [],
            callback,
            self = Object.create(null, {
            
            // readonly number state;
            //      Return loading state. [0, 1]
            state: { get: function(){
                return images.length == 0 ? 1 : loadedImages.length / images.length;
            }},
            
            // Image request(string url)
            //      Request loading a image from the URL.
            //      It returns a image object. This image object does not completed loaing before calling load().
            request: { value: function(url){
                var image = new Image();
                image.addEventListener("load", function onImageLoaded(){
                    loadedImages.push(image);
                    image.removeEventListener(onImageLoaded);
                    if(loadedImages.length === images){
                        callback();
                        callback = undefined;
                    }
                });
                image.targetImageURL = url;
                images.push(image);
                return image;
            }},
            
            //  void load(Function<void> onComplete)
            //      Start loading. onComplete callback handler will be called on complete loading.
            load: { value: function(onComplete){
                callback = onComplete; 
                images.forEach(function(image){
                    if(image.src !== image.targetImageURL){
                        image.src = image.targetImageURL;
                    }
                });
            }},
            
            // void paint(HTMLCanvasElement canvas)
            //      Paint simple progress bar to the canvas.
            paint: { value: function(canvas){
                var g = canvas.getContext("2d");
                g.save();
                g.fillStyle = "black";
                g.fillRect(0, 0, canvas.width, canvas.height);                    
                g.strokeStyle = "white";
                g.fillStyle = "white";
                g.strokeRect(canvas.width * 0.4, canvas.height * 0.49, canvas.width * 0.2,              canvas.height * 0.02);
                g.fillRect  (canvas.width * 0.4, canvas.height * 0.49, canvas.width * 0.2 * self.state, canvas.height * 0.02);
                g.restore();
            }}
        });
        return self;
    }}
}));



SANDBOX.loader = SANDBOX.ImageLoader.create();