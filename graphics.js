function setCanvasSize(canvas, context, scale, width, height) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.scale(scale, scale);
}

function createTri(v1, v2, v3, color) {
    return {
        v1: v1,
        v2: v2,
        v3: v3,
        color: color
    }
}

function drawTri(tri, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tri.v1.x * scale, tri.v1.y * scale);
    ctx.lineTo(tri.v2.x * scale, tri.v2.y * scale);
    ctx.lineTo(tri.v3.x * scale, tri.v3.y * scale);
    ctx.closePath();
    ctx.fill();
}