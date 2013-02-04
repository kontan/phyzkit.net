/// <reference path="../../box2dwebambient.d.ts"/>

module Phyzkit{
    import M = Box2D.Common.Math;

    // Replesents scale and position of camera. Camera object is imutable.
    export class Camera{
        constructor(private _scale?:number, private _point?:M.b2Vec2){
            if(this._scale === undefined) this._scale = 1;
            if(this._point === undefined) this._point = new M.b2Vec2(0, 0);
        }

        get scale():number{
            return this._scale;
        }

        get point():M.b2Vec2{ 
            return this._point ? this._point.Copy() : new M.b2Vec2(0, 0); 
        }

        setScale(s:number):Camera{
            return new Camera(s, this.point);
        }

        setPoint(p:M.b2Vec2):Camera{
            return new Camera(this.scale, p);
        }

        interpolate(ratio:number, camera:Camera):Camera{
            return new Camera(
                this.scale + (camera.scale - this.scale) * ratio,
                new M.b2Vec2(
                    this.point.x + (camera.point.x - this.point.x) * ratio,
                    this.point.y + (camera.point.y - this.point.y) * ratio
                )
            );
        }
    }
}