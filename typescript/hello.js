$(function () {
    console.log("loaded!");
});
var Greeting;
(function (Greeting) {
    var Hello = (function () {
        function Hello(text) {
            this.text = text;
        }
        Hello.prototype.say = function () {
            console.log(this.text);
        };
        return Hello;
    })();
    Greeting.Hello = Hello;    
})(Greeting || (Greeting = {}));
var hello = new Greeting.Hello("Hello, World!");
var Hoge = (function () {
    function Hoge(x) {
        this.x = x;
    }
    Hoge.prototype.foo = function () {
        console.log(this.x);
    };
    Hoge.prototype.bar = function () {
        (function piyo() {
            console.log(this.x);
            var hoge = this.x;
        })();
    };
    return Hoge;
})();
var hoge = new Hoge(100);
hoge.foo();
hoge.bar();
//@ sourceMappingURL=hello.js.map
