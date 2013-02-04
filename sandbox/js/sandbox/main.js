"use strict";

$(function(){
    // サンドボックスオブジェクトを作成
    var sandbox = SANDBOX.createSandBox();
    
    // document.body に取り付ける。sandbox.container は Box2DSandBox のルート要素の JQuery オブジェクト。
    $(document.body).append(sandbox.container);
    
    // コア機能には物理オブジェクトを作成する機能は含まれていない。
    // Box2DSandBox には実験のための簡単なオブジェクトのセットが付属している。これらを利用するには、
    // <script> で該当するモジュールのスクリプトファイルをすべて読み込む。
    // また、Toolkit.attach で付属のツールキットの物理オブジェクト作成ツールボタンを UI に追加する。
    Toolkit.attach(sandbox);
    
    // サンドボックスのループを開始する。ちょっと設計がダメだが、ここで SANDBOX.loader のロード開始も行なっている
    sandbox.start();
    
    // URL に app という名前のパラメータを含むことで、指定されたスクリプトを自動で実行する。
    // app パラメータの読み取り
    SANDBOX.readParam("app", sandbox.loadScriptFromURL);
    
    // world というパラメータを読み取り、指定されたワールドデータを読み込む。
    // world パラメータの読み取り
    SANDBOX.readParam("world", function(data){
        sandbox.loadWorldFromURL(data, function(){
        });
                
    });     
    
    // ブラウザ移動の警告
    if(window === window.parent){
        window.onbeforeunload = function(event){  
            return event.returnValue = "この　ページから　いどうするなんて　とんでもない！";
        }
    }
      
});