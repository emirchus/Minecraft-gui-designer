import { TOOL_RECTANGLE, TOOL_CIRCLE, TOOL_IMAGE, TOOL_LINE } from './utils/tools';
import Paint from './paint/paint';
import jetpack from "fs-jetpack";
import { remote } from 'electron';
const userDataDir = jetpack.cwd(remote.app.getPath("userData"));
const projectFile = `test.json`;

var painter = new Paint("editor-canvas");

var current_tool = TOOL_RECTANGLE;

var isTranslate = false;
var isDraw = false;
var isDrag = false;
var isResizeDrag = false;
var expectResize = -1;
var mx, my;

var offsetx, offsety;

var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

var translatePos = {
    x: painter.canvas.width / 2,
    y: painter.canvas.height / 2
};

var scale = 1.0;
var scaleMultiplier = 0.5;
var startDragOffset = {};

function init2() {
    // (e.href = document.getElementById(editor_canvas).toDataURL()), (e.download = t);

    painter.init();

    painter.canvas.onselectstart = function () { return false; }

    if (document.defaultView && document.defaultView.getComputedStyle) {
        stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(painter.canvas, null)['paddingLeft'], 10) || 0;
        stylePaddingTop = parseInt(document.defaultView.getComputedStyle(painter.canvas, null)['paddingTop'], 10) || 0;
        styleBorderLeft = parseInt(document.defaultView.getComputedStyle(painter.canvas, null)['borderLeftWidth'], 10) || 0;
        styleBorderTop = parseInt(document.defaultView.getComputedStyle(painter.canvas, null)['borderTopWidth'], 10) || 0;
    }

    painter.canvas.onmousedown = mouseDown;
    painter.canvas.onmouseup = stop;
    painter.canvas.onmousemove = mouseMove;
    painter.canvas.onmouseout = stop;

}

function mouseMove(e) {
    if (!isTranslate) {
        if (isDraw) {
            painter.invalidate();
        }
        if (isDrag && painter.mySel) {
            getMouse(e);

            painter.mySel.x = mx - offsetx + scale;
            painter.mySel.y = my - offsety + scale;
            painter.invalidate();
        } else if (isResizeDrag) {
            var oldx = painter.mySel.x;
            var oldy = painter.mySel.y;

            // 0  1  2
            // 3     4
            // 5  6  7
            switch (expectResize) {
                case 0:
                    painter.mySel.x = mx / scale;
                    painter.mySel.y = my / scale;
                    painter.mySel.w += oldx - mx / scale;
                    painter.mySel.h += oldy - my / scale;
                    break;
                case 1:
                    painter.mySel.y = my / scale;
                    painter.mySel.h += oldy - my / scale;
                    break;
                case 2:
                    painter.mySel.y = my / scale;
                    painter.mySel.w = mx - oldx / scale;
                    painter.mySel.h += oldy - my / scale;
                    break;
                case 3:
                    painter.mySel.x = mx / scale;
                    painter.mySel.w += oldx - mx / scale;
                    break;
                case 4:
                    painter.mySel.w = mx - oldx* scale;
                    break;
                case 5:
                    painter.mySel.x = mx;
                    painter.mySel.w += oldx - mx / scale;
                    painter.mySel.h = my - oldy / scale;
                    break;
                case 6:
                    painter.mySel.h = my - oldy / scale;
                    break;
                case 7:
                    painter.mySel.w = mx - oldx / scale;
                    painter.mySel.h = my - oldy / scale;
                    break;
            }

            painter.invalidate();
        }

        getMouse(e);

        if (painter.mySel !== null && !isResizeDrag) {
            for (var i = 0; i < 8; i++) {

                var cur = painter.selectionHandles[i];

                if (mx >= cur.x * scale && mx <= cur.x * scale + painter.mySel.mySelBoxSize &&
                    my >= cur.y * scale && my <= cur.y * scale + painter.mySel.mySelBoxSize) {
                    expectResize = i;
                    painter.invalidate();
                    switch (i) {
                        case 0:
                            this.style.cursor = 'nw-resize';
                            break;
                        case 1:
                            this.style.cursor = 'n-resize';
                            break;
                        case 2:
                            this.style.cursor = 'ne-resize';
                            break;
                        case 3:
                            this.style.cursor = 'w-resize';
                            break;
                        case 4:
                            this.style.cursor = 'e-resize';
                            break;
                        case 5:
                            this.style.cursor = 'sw-resize';
                            break;
                        case 6:
                            this.style.cursor = 's-resize';
                            break;
                        case 7:
                            this.style.cursor = 'se-resize';
                            break;
                    }
                    return;
                }

            }

            isResizeDrag = false;
            expectResize = -1;
            this.style.cursor = 'auto';
        }

    } else {
        console.log("TRUE");
        getMouse(e);
        translatePos.x =  mx- startDragOffset.x;
        translatePos.y =  my- startDragOffset.y;

        painter.context.translate( translatePos.x, translatePos.y)

        painter.invalidate();        
    }
}

function mouseDown(e) {
    getMouse(e);

    if (!isTranslate) {
        if (expectResize !== -1) {
            isResizeDrag = true;
            return;
        }
        getMouse(e);
        var array_to_use = painter.mySel ? painter.shapes.sort((a, b) => b.z - a.z) : painter.shapes;
        painter.clear(painter.gctx);
        var foundShape = array_to_use.some((shape, index) => {
            console.log(mx, my, shape.toString(), index);
            if (!(mx < shape.x || mx > shape.x + shape.w
                || my < shape.y || my > shape.y + shape.h)) {
                console.log(shape);
                painter.mySel = shape;
                offsetx = mx - painter.mySel.x;
                offsety = my - painter.mySel.y;
                painter.mySel.x = (mx - offsetx) + scale;
                painter.mySel.y = (my - offsety) + scale;
                isDrag = true;

                painter.invalidate();
                painter.clear(painter.gctx);
                return true;
            }
        })

        if (foundShape) {
            return
        } else {
            if (!isDraw) {
                getMouse(e)

                isDraw = true;
                painter.mySel = null;
                isDrag = false;
                expectResize = -1;
                isResizeDrag = false;

                painter.mySel = painter.addObject(mx * scale, my * scale, 2, 2, 0, 'black', current_tool);

                isResizeDrag = true;
                expectResize = 7;

                return;
            }

        }


     
    } else {
        startDragOffset.x = e.clientX - translatePos.x;
        startDragOffset.y = e.clientY - translatePos.y;
        return;
    }

    painter.mySel = null;
    painter.clear(painter.gctx);
    painter.invalidate();
}

function stop(e) {
    isDrag = false;
    isResizeDrag = false;
    expectResize = -1;
    isDraw = false;
    isTranslate = false;
}

function getMouse(e) {
    var element = painter.canvas, offsetX = 0, offsetY = 0;

    if (element.offsetParent) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    offsetX += stylePaddingLeft
    offsetY += stylePaddingTop

    offsetX += styleBorderLeft;
    offsetY += styleBorderTop;

    mx = (e.pageX - offsetX);
    my = (e.pageY - offsetY);
}
document.addEventListener('keydown', (e) => {
    if (e.code === "ControlLeft") {
        isTranslate = true;
    }
})
document.addEventListener('keyup', (e) => {
    if (e.code === "Delete") {
        if (painter.mySel != null) {
            var newArray = painter.shapes.filter((value) => { return value != painter.mySel });
            painter.shapes = newArray;
            painter.invalidate();
            painter.clear(painter.gctx)
        }
    }else{
        if (e.code === "ControlLeft") {
            isTranslate = false;
        }
    }
})

init2();
/*
const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'nano', // or 'monolith', or 'nano'

    swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
        'rgba(63, 81, 181, 0.8)',
        'rgba(33, 150, 243, 0.75)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(0, 188, 212, 0.7)',
        'rgba(0, 150, 136, 0.75)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(139, 195, 74, 0.85)',
        'rgba(205, 220, 57, 0.9)',
        'rgba(255, 235, 59, 0.95)',
        'rgba(255, 193, 7, 1)'
    ],

    components: {

        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            hex: true,
            rgba: true,
            hsla: true,
            hsva: true,
            cmyk: true,
            input: true,
            clear: true,
            save: true
        }
    }
});
*/
document.querySelectorAll("a[data-action]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".button.active").forEach(btn => btn.classList.remove("active"))

        if (button.classList.contains("active")) {
            button.classList.remove("active")
        } else {
            button.classList.add("active")
        }
        switch (button.getAttribute("data-action")) {
            case "save":
                console.log("guardar");
                break;
            case "square":
                console.log("square");
                break;
            case "square-shape":
                break;
            case "circle":
                break;
            case "image":
                break;
            case "undo":
                break;
            case "redo":
                break;
            case "edit":
                break;

            case "zoom-in":
                scale /= scaleMultiplier;
                painter.context.scale(scale, scale);
                painter.gctx.scale(scale, scale);
                painter.invalidate();
                painter.clear(painter.gctx)
                break;

            case "zoom-out":
                scale *= scaleMultiplier;
                painter.context.scale(scale, scale);
                painter.gctx.scale(scale, scale);
                painter.invalidate();
                painter.clear(painter.gctx)
                break;
            default:
                break;
        }
    })
})

function saveToJSON() {
    var map = [];
    painter.shapes.forEach((shape) => {
        map.push(JSON.parse(shape.toString()));
    })
    var allMaps = { "shapes": map };
    userDataDir.write(projectFile, allMaps, { atomic: true });

}


function groupsLayers(arr) {
    if (typeof (arr) == "object") {
        for (var i = 0; i < arr.length; i++) {
            printArray(arr[i]);
        }
    }
}
