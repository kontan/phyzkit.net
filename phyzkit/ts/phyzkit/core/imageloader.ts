/// <reference path="../../box2dwebambient.d.ts"/>
/// <reference path="../../jquery.d.ts"/>

module Phyzkit{
    // class ImageLoader
    class ImageLoader{
        static create():ImageLoader{
            return new ImageLoader();
        }

        private images:HTMLImageElement[] = [];
        private loadedImages:HTMLImageElement[] = [];
        private callback:()=>void;

        constructor(){
        }

        // readonly number state;
        //      Return loading state. [0, 1]
        get state():number{
            return this.images.length == 0 ? 1 : this.loadedImages.length / this.images.length;
        }
        
        // Image request(string url)
        //      Request loading a image from the URL.
        //      It returns a image object. This image object does not completed loaing before calling load().
        request(url:string):HTMLImageElement{
            var onImageLoaded:EventListener;
            var image:HTMLImageElement = new Image();
            onImageLoaded = (e:Event)=>{
                this.loadedImages.push(image);
                image.removeEventListener("load", onImageLoaded);
                if(this.callback !== undefined && this.loadedImages.length === this.images.length){
                    this.callback();
                    this.callback = undefined;
                }
            };
            image.addEventListener("load", onImageLoaded);
            (<any>image).targetImageURL = url;
            this.images.push(image);
            return image;
        }
        
        //  void load(Function<void> onComplete)
        //      Start loading. onComplete callback handler will be called on complete loading.
        load(onComplete?:()=>void){
            this.callback = onComplete; 
            this.images.forEach(function(image:HTMLImageElement){
                var targetImageURL:string = (<any>image).targetImageURL;
                if(image.src !== targetImageURL){
                    image.src = targetImageURL;
                }
            });
        }
        
        // void paint(HTMLCanvasElement canvas)
        //      Paint simple progress bar to the canvas.
        paint(canvas:HTMLCanvasElement):void{
            var g = canvas.getContext("2d");
            g.save();
            g.fillStyle = "black";
            g.fillRect(0, 0, canvas.width, canvas.height);                    
            g.strokeStyle = "white";
            g.fillStyle = "white";
            g.strokeRect(canvas.width * 0.4, canvas.height * 0.49, canvas.width * 0.2,              canvas.height * 0.02);
            g.fillRect  (canvas.width * 0.4, canvas.height * 0.49, canvas.width * 0.2 * this.state, canvas.height * 0.02);
            g.restore();
        }
    }

    export var loader = new ImageLoader();    
}



