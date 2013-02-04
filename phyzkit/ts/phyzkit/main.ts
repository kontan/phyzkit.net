

$(function(){
    // サンドボックスオブジェクトを作成
    var sandbox:Phyzkit.SandBox = new Phyzkit.SandBox();
    
    // document.body に取り付ける。sandbox.container は Box2DSandBox のルート要素の JQuery オブジェクト。
    $(document.body).append(sandbox.container);
    
    // コア機能には物理オブジェクトを作成する機能は含まれていない。
    // Box2DSandBox には実験のための簡単なオブジェクトのセットが付属している。これらを利用するには、
    // <script> で該当するモジュールのスクリプトファイルをすべて読み込む。
    // また、Toolkit.attach で付属のツールキットの物理オブジェクト作成ツールボタンを UI に追加する。
    Phyzkit.GameToolkit.attachToolButtons(sandbox);
    
    sandbox.viewport.background = Phyzkit.createLayeredBackground([
        Phyzkit.createSimpleBackground("white"),
        Phyzkit.createGridBackground(0, 0, 0)
        //createFixedImageBackground(loader.request("js/sandbox/yamada.jpg"))
    ]);
    
    // サンドボックスのループを開始する。ちょっと設計がダメだが、ここで SANDBOX.loader のロード開始も行なっている
    sandbox.start();
    
    // URL に app という名前のパラメータを含むことで、指定されたスクリプトを自動で実行する。
    // app パラメータの読み取り
    Phyzkit.readParam("app", sandbox.loadScriptFromURL);
    
    // world というパラメータを読み取り、指定されたワールドデータを読み込む。
    // world パラメータの読み取り
    Phyzkit.readParam("world", function(data){
        sandbox.loadWorldFromURL(data, function(){
        });
                
    });     
    
    // ブラウザ移動の警告
    /*
    if(window === window.parent){
        $(window).bind("beforeunload", function(event) {
            return "この　ページから　いどうするなんて　とんでもない！　(誤操作防止)";
        });
    }
    */
});