interface Tool{
    /**
     * ツールボタンに追加される、追加のクラスです。
     * ボタンの背景を設定したりします。
     */
    string style{
        get;
    }
    string tooltip{
        get;
    }
    void click    (Event e, SandBox sandbox);
    void mousedown(Event e, SandBox sandbox);
    void mousemove(Event e, SandBox sandbox);
    void mouseup  (Event e, SandBox sandbox);
    void mouseout (Event e, SandBox sandbox);    
}