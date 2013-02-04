/// <reference path="jquery.d.ts" />

$(()=>{
    console.log("loaded!");
});

module Greeting{
    export class Hello{
        constructor(private text : string){
        }
        say() : void{
            console.log(this.text);
        }
    }
}

var hello : Greeting.Hello = new Greeting.Hello("Hello, World!");
//hello.say();





interface Func{
    [arg : number] : number;
}


class Hoge{
	constructor(private x){

	}

    foo() : void{
        console.log(this.x);
    }

    bar() : void{    
        (function piyo(){
            console.log(this.x);
            var hoge : number = this.x;
        })();
    }
}

var hoge = new Hoge(100);
hoge.foo();
hoge.bar();
