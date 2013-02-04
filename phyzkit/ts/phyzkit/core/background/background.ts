module Phyzkit{
    export interface ViewportBackground{
        /**
         * 背景を描画します。グラフィックコンテキストの座標系は、Canvas の通常の座標系と同じで、
         * ビューポート左上を原点としたピクセル単位の座標系です。
         */
        paint(g:CanvasRenderingContext2D, viewport:Viewport):void;
    }
}