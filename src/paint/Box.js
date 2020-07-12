import { RECTANGLE, LINE } from "../utils/shapes";

export default class Box {
    constructor(painter, type) {
        this.painter = painter;
        this.x = 0;
        this.y = 0;
        this.w = 1;
        this.h = 1;
        this.z = 0;
        this.fill = '#a3c6ff';

        this.shapeType = type;

        this.mySelColor = '#a3c6ff';
        this.mySelWidth = 2;
        this.mySelBoxColor = '#a3c6ff';
        this.mySelBoxSize = 6;
    }

    /**
     * @param {string} color
     */
    set fillColor(color) {
        this.fill = color;
    }

    draw(context, optionalColor) {
        if (context === this.painter.gctx) {
            context.fillStyle = 'black';
        } else {
            context.fillStyle = this.fill;
        }

        if (this.x > this.painter.WIDTH || this.y > this.painter.HEIGHT) return;
        if (this.x + this.w < 0 || this.y + this.h < 0) return;

        switch (this.shapeType) {
            case RECTANGLE:
                context.fillRect(this.x, this.y, this.w, this.h);
                break;
            case LINE:
                context.beginPath();
                context.moveTo(this.x, this.y);
                context.lineTo(this.w, this.h);
                context.stroke();
                break;

            default:
                break;
        }

        if (this.painter.mySel === this) {
            context.strokeStyle = this.mySelColor;
            context.lineWidth = this.mySelWidth;
            context.strokeRect(this.x, this.y, this.w, this.h);

            var half = this.mySelBoxSize / 2;

            // 0  1  2
            // 3     4
            // 5  6  7

            // top left, middle, right
            this.painter.selectionHandles[0].x = this.x - half;
            this.painter.selectionHandles[0].y = this.y - half;

            this.painter.selectionHandles[1].x = this.x + this.w / 2 - half;
            this.painter.selectionHandles[1].y = this.y - half;

            this.painter.selectionHandles[2].x = this.x + this.w - half;
            this.painter.selectionHandles[2].y = this.y - half;

            //middle left
            this.painter.selectionHandles[3].x = this.x - half;
            this.painter.selectionHandles[3].y = this.y + this.h / 2 - half;

            //middle right
            this.painter.selectionHandles[4].x = this.x + this.w - half;
            this.painter.selectionHandles[4].y = this.y + this.h / 2 - half;

            //bottom left, middle, right
            this.painter.selectionHandles[6].x = this.x + this.w / 2 - half;
            this.painter.selectionHandles[6].y = this.y + this.h - half;

            this.painter.selectionHandles[5].x = this.x - half;
            this.painter.selectionHandles[5].y = this.y + this.h - half;

            this.painter.selectionHandles[7].x = this.x + this.w - half;
            this.painter.selectionHandles[7].y = this.y + this.h - half;


            context.fillStyle = this.mySelBoxColor;
            for (var i = 0; i < 8; i++) {
                var cur = this.painter.selectionHandles[i];
                context.fillRect(cur.x, cur.y, this.mySelBoxSize, this.mySelBoxSize);
            }
        }

    }

    toString(){
        return JSON.stringify({
            x: this.x,
            y: this.y,
            z: this.z,
            width: this.w,
            height: this.h,
            color: this.fill,
            shape: this.shapeType
        })
    }
}