interface Tool{
    /**
     * �c�[���{�^���ɒǉ������A�ǉ��̃N���X�ł��B
     * �{�^���̔w�i��ݒ肵���肵�܂��B
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