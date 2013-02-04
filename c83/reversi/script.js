window.requestAnimationFrame = window.requestAnimationFrame || window['webkitRequestAnimationFrame'] || window['mozRequestAnimationFrame'] || window['oRequestAnimationFrame'] || window['msRequestAnimationFrame'];
var canvas = document.querySelector('#world');
var g = canvas.getContext('2d');
var SIZE = 32;
var Stone = (function () {
    function Stone(side) {
        this.side = side;
        this.rotation = 0;
        this.wait = -1;
    }
    Stone.prototype.flip = function (wait) {
        this.side = (this.side + 1) % 2;
        this.rotation = 1;
        this.wait = wait;
    };
    Stone.prototype.update = function () {
        if(this.wait > 0) {
            this.wait--;
        } else {
            if(this.rotation >= 0) {
                this.rotation = Math.max(0, this.rotation - 0.03);
            }
        }
    };
    Stone.prototype.paint = function () {
        var s = this.side + this.rotation;
        var t = ((s - Math.floor(s)) * 2 - 1);
        g.save();
        g.scale(1, Math.cos(Math.PI * s));
        g.fillStyle = "rgba(0,0,0,0.3)";
        g.beginPath();
        g.arc(0, 0, SIZE * 0.4, 0, 7, false);
        g.fill();
        g.restore();
        var isWhite = Math.floor(s + 0.5) % 2 == 0;
        g.save();
        g.translate(0, -16 * (1 - t * t));
        g.scale(1, Math.cos(Math.PI * s));
        g.fillStyle = isWhite ? "white" : "black";
        g.beginPath();
        g.arc(0, 0, SIZE * 0.4, 0, 7, false);
        g.fill();
        g.restore();
    };
    return Stone;
})();
var Board = (function () {
    function Board() {
        this.stones = [];
        for(var y = 0; y < 8; y++) {
            this.stones.push([]);
        }
    }
    Board.prototype.find = function (side, x, y, callback) {
        if(!this.stones[y][x]) {
            for(var dy = -1; dy <= 1; dy++) {
                for(var dx = -1; dx <= 1; dx++) {
                    for(var i = 1; i < 8; i++) {
                        var tx = x + dx * i;
                        var ty = y + dy * i;
                        if(tx < 0 || tx > 7 || ty < 0 || ty > 7) {
                            break;
                        }
                        var target = this.stones[ty][tx];
                        if(!target) {
                            break;
                        }
                        if(target.side == side) {
                            for(var k = 1; k < i; k++) {
                                var target = this.stones[y + dy * k][x + dx * k];
                                callback(x + dx * k, y + dy * k, target);
                            }
                            break;
                        }
                    }
                }
            }
        }
    };
    Board.prototype.set = function (side, x, y) {
        var stone = new Stone(side);
        this.stones[y][x] = stone;
    };
    Board.prototype.put = function (side, x, y) {
        var count = 0;
        this.find(side, x, y, function (tx, ty) {
            count++;
        });
        if(count > 0) {
            var stone = new Stone(side);
            this.find(side, x, y, function (tx, ty, target) {
                var range = Math.max(Math.abs(x - tx), Math.abs(y - ty));
                target.flip(8 * range);
            });
            this.stones[y][x] = stone;
        }
        return count;
    };
    Board.prototype.forEach = function (callback) {
        for(var y = 0; y < 8; y++) {
            for(var x = 0; x < 8; x++) {
                callback(x, y, this.stones[y][x]);
            }
        }
    };
    Board.prototype.update = function () {
        this.forEach(function (x, y, stone) {
            if(stone) {
                stone.update();
            }
        });
    };
    Board.prototype.paint = function () {
        this.forEach(function (x, y, stone) {
            g.fillStyle = "green";
            g.fillRect(SIZE * x, SIZE * y, SIZE, SIZE);
            g.strokeStyle = "black";
            g.lineWidth = 2;
            g.strokeRect(SIZE * x, SIZE * y, SIZE, SIZE);
        });
        this.forEach(function (x, y, stone) {
            g.save();
            g.translate(SIZE * (x + 0.5), SIZE * (y + 0.5));
            if(stone) {
                stone.paint();
            }
            g.restore();
        });
    };
    return Board;
})();
var board = new Board();
board.set(1, 3, 3);
board.set(0, 3, 4);
board.set(0, 4, 3);
board.set(1, 4, 4);
var turn = 0;
canvas.addEventListener('mousedown', function (e) {
    if(board.put(turn, Math.floor(e.offsetX / SIZE), Math.floor(e.offsetY / SIZE)) > 0) {
        turn = (turn + 1) % 2;
    }
});
function mainloop() {
    g.fillStyle = "white";
    g.fillRect(0, 0, canvas.width, canvas.height);
    board.update();
    board.paint();
    g.fillStyle = "black";
    g.font = "16px 'Times New Roman'";
    g.fillText("Turn: " + (turn == 0 ? "White" : "Black"), 10, SIZE * 8 + 20);
    requestAnimationFrame(mainloop);
}
mainloop();
