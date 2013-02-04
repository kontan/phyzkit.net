window.requestAnimationFrame 
   = window.requestAnimationFrame  
  || window['webkitRequestAnimationFrame'] 
  || window['mozRequestAnimationFrame']
  || window['oRequestAnimationFrame'] 
  || window['msRequestAnimationFrame'];

var canvas = <HTMLCanvasElement> 
                    document.querySelector('#world');
var g = canvas.getContext('2d');

// マス目の大きさ
var SIZE = 32;

// 石を表すクラス
class Stone{
  // ひっくり返すときの回転の状態。1.0 で半回転
  rotation:number = 0;
  
  // ひっくり返すまでの待ち時間
  wait:number = -1;
  
  constructor(public side:number){
  }

  // 一定時間後にひっくり返します
  flip(wait:number):void{
    this.side = (this.side + 1) % 2;
    this.rotation = 1;
    this.wait = wait;
  }
  
  update():void{
    if(this.wait > 0){
      this.wait--;
    }else if(this.rotation >= 0){
      this.rotation=Math.max(0, this.rotation-0.03);
    }
  }
  
  paint():void{
    var s = this.side + this.rotation;
    var t = ((s - Math.floor(s)) * 2 - 1);
    
    // 影
    g.save();
    g.scale(1, Math.cos(Math.PI * s));    
    g.fillStyle = "rgba(0,0,0,0.3)";
    g.beginPath();
    g.arc(0, 0, SIZE * 0.4, 0, 7, false);
    g.fill();    
    g.restore();

    // 石
    var isWhite = Math.floor(s + 0.5) % 2 == 0;
    g.save();
    g.translate(0, - 16 * (1 - t * t));
    g.scale(1, Math.cos(Math.PI * s));
    g.fillStyle = isWhite ? "white" : "black";
    g.beginPath();
    g.arc(0, 0, SIZE * 0.4, 0, 7, false);
    g.fill();
    g.restore();
  }
}

// 盤面を表すクラス
class Board{
  private stones:Stone[][] = [];

  constructor(){
    for(var y = 0; y < 8; y++){
      this.stones.push([]);
    }
  }

  // ひっくり返すことのできるすべての石を調べて
  // コールバックします
  find(side:number, x:number, y:number, 
     callback:(tx:number,ty:number,target:Stone)=>void){
    // すでに石が置いてあるか調べて、空だったら……
    if( ! this.stones[y][x]){
      // 上下左右斜め8方向に繰り返して調べます
      for(var dy = -1; dy <= 1; dy++){
        for(var dx = -1; dx <= 1; dx++){
          for(var i = 1; i < 8; i++){
            // ひっくり返せるか調べる位置
            var tx = x + dx * i;   
            var ty = y + dy * i;
            // 盤の外に出てしまったら終了
            if(tx<0 || tx>7 || ty<0 || ty>7) break;  
            var target = this.stones[ty][tx];
            // 何もないマスに到達したら終了
            if( ! target) break;  
            // 置こうとする石と同じ色の石が見つかったら
            if(target.side == side){  
              // 挟んだ石をひっくり返して終了
              for(var k = 1; k < i; k++) {
                var target=this.stones[y+dy*k][x+dx*k];
                callback(x+dx*k, y+dy*k, target);
              }
              break;
            }
          }
        } 
      }
    }
  }

  // 無条件で石を置きます
  set(side:number, x:number, y:number){
    var stone = new Stone(side);
    this.stones[y][x] = stone;
  }

  // 指定した位置に石を置きます。
  // ひっくり返した石の数を返します。
  put(side:number, x:number, y:number):number{
    var count = 0;
    this.find(side, x, y, (tx, ty)=>{
      count++;
    });
    if(count > 0){
      var stone = new Stone(side);
      this.find(side, x, y, (tx, ty, target)=>{
      	var range =Math.max(
                  Math.abs(x-tx),Math.abs(y-ty));
        target.flip(8 * range);
      });
      this.stones[y][x] = stone;
    }
    return count;
  }

  // 盤面のすべての位置について繰り返しをします
  forEach(callback:(x:number, y:number, 
         stone:Stone)=>void):void{
    for(var y = 0; y < 8; y++){
      for(var x = 0; x < 8; x++){
        callback(x, y, this.stones[y][x]);
      }
    }
  }

  update(){
    this.forEach((x, y, stone)=>{
      if(stone) stone.update();
    });
  }

  paint():void{
    this.forEach((x, y, stone)=>{
      g.fillStyle = "green";
      g.fillRect(SIZE * x, SIZE * y, SIZE, SIZE);
      g.strokeStyle = "black";
      g.lineWidth = 2;
      g.strokeRect(SIZE * x, SIZE * y, SIZE, SIZE);
    });
    this.forEach((x, y, stone)=>{
      g.save();
      g.translate(
        SIZE * (x + 0.5), 
        SIZE * (y + 0.5)
      );
      if(stone) stone.paint();
      g.restore();
    });
  }
}

// 盤面の初期配置
var board = new Board();
board.set(1, 3, 3);
board.set(0, 3, 4);
board.set(0, 4, 3);
board.set(1, 4, 4);

// 現在の手番。0 か 1
var turn = 0;

canvas.addEventListener('mousedown', (e:MouseEvent)=>{
  // クリックしたマスに石を置こうとしてみて……
  if(board.put(turn,
    Math.floor(e.offsetX / SIZE), 
    Math.floor(e.offsetY / SIZE)
  ) > 0){
    // １個以上ひっくり返せたら手番を交代
    turn = (turn + 1) % 2;
  }
});

// メインループ
function mainloop(){
  g.fillStyle = "white";
  g.fillRect(0, 0, canvas.width, canvas.height);
  board.update();
  board.paint();
  g.fillStyle = "black";
  g.font = "16px 'Times New Roman'";
  g.fillText("Turn: "+(turn==0?"White":"Black"), 
  	                                  10, SIZE*8+20);
  requestAnimationFrame(mainloop);
}

mainloop();

