import Box from './Box';
import { TOOL_RECTANGLE, TOOL_CIRCLE, TOOL_IMAGE, TOOL_LINE } from '../utils/tools';
import { LINE, RECTANGLE } from '../utils/shapes';

export default class Paint {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.current_view = this.canvas.parentElement;

        this.canvas.width = this.current_view.clientWidth;
        this.canvas.height = window.innerHeight;

        this.shapes = []
        this.selectionHandles = [];

        this.mySel = null;

        this.canvasValid = false;
        this.INTERVAL = 20;  //TODO: Intervalo de dibujo

        this.HEIGHT = this.canvas.height;
        this.WIDTH = this.canvas.width;
        this.ghostcanvas = document.createElement('canvas');
        this.ghostcanvas.height = this.HEIGHT;
        this.ghostcanvas.width = this.WIDTH;
        this.gctx = this.ghostcanvas.getContext('2d');

    }

    set activeTool(tool) {
        this.tool = tool;
    }

    init() {
        setInterval(() => {
            this.mainDraw();
        }, this.INTERVAL);

        for (var i = 0; i < 8; i++) {
            var rect = new Box(this);
            this.selectionHandles.push(rect);
        }

    }

    addObject(x, y, w, h, z, fill, tool) {
        var rect = new Box(this, tool);
        rect.x = x;
        rect.y = y;
        rect.w = w
        rect.h = h;
        rect.z = z;
        rect.fill = fill;
        this.shapes.push(rect);
        this.invalidate();
        return rect;
    }

    mainDraw() {
        if (this.canvasValid == false) {
            this.clear(this.context)

            this.shapes = this.shapes.sort((a, b) => a.z - b.z);

            this.shapes.forEach((shape, index) => {
                shape.draw(this.context);
            })
            this.canvasValid = true;
        }
    }

    invalidate() {
        this.canvasValid = false;
    }

    clear(c) {
        c.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    }

}