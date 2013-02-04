/**
 * サンドボックス
 * いわゆるゲームループの管理や、オーサリングインターフェイスの提供を行います。
 */
interface SandBox{
    /**
     * 現在このサンドボックスに設定されているワールドを返します。
     */
    b2World world{
        get;
    }
    
    /**
     * ワールドの更新。false の場合はワールドの時間は進みません。
     */ 
    bool isWorldActive{
        get; set;
    };
    
  
    
    /**
     * 現在のワールドを破棄し、新たなワールドを設定します。
     */
    void initializeWorld();
    
    /**
     * 指定された位置にボックスを作成します。
     */
    void createBox(b2Vec2 position);
    
    /**
     * JSON オブジェクトからワールドを読み込みます。
     */ 
    void loadWorldFromJSON(JSON json);
    
    /**
     * 文字列からワールドを読み込みます。
     */ 
    void loadWorldFromText(string text);
    
    /**
     * 文字列をスクリプトとして実行します。
     */
    void loadScriptFromText(string text);
    
    /**
     * 指定されたURLのスクリプトを取得して実行します。
     */
    void loadScriptFromURL(string url);
    
    
    /**
     * 指定された URL のデータを取得し、ワールドとしてデシリアライズして読み込みます。
     */
     void loadWorldFromURL(string url);
     
     
     /**
      * インターフェイスにツールボタンを追加します。
      */
     void addToolButton(Tool tool);
}