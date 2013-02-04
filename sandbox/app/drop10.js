// スクリプトパッド ... 任意のスクリプトを実行してワールドに干渉できます。
//
// ---- API(抜粋) ----
// void sandbox.initializeWorld();  ワールドを初期化します。                  
// void sandbox.createBox(number size, b2Vec2 position);    指定した位置に指定したサイズの木箱を作成します。
//
// ---- スクリプト例 ----
// (-2～2, -2) の範囲で1秒ごとに計10個の木箱を生成。座標が上方向が -Y であることに注意。


(function dropBox(n){
    if(n > 0){
        Toolkit.Crate.create(sandbox.world, 0.2, new b2Vec2(2 * (Math.random() - 0.5), -2));
        setTimeout(function(){ dropBox(n - 1); }, 1000);
    }
})(10);