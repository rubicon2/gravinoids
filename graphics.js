function setCanvasSize(canvas, context, scale, width, height) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.scale(scale, scale);
}

function createTri(va, vb, vc, color) {
    return {
        v1: va,
        v2: vb,
        v3: vc,
        c: color
    }
}