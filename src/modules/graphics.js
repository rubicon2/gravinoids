import * as V2 from "./vectors";

const setCanvasSize = function(canvas, context, scale, width, height) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.scale(scale, scale);
}

const createTri = function(v1, v2, v3, color) {
    return {
        v1: v1,
        v2: v2,
        v3: v3,
        color: color
    }
}

const drawTri = function(ctx, tri, color) {
    let scale = window.devicePixelRatio;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tri.v1.x * scale, tri.v1.y * scale);
    ctx.lineTo(tri.v2.x * scale, tri.v2.y * scale);
    ctx.lineTo(tri.v3.x * scale, tri.v3.y * scale);
    ctx.closePath();
    ctx.fill();
}

const drawModel = function(ctx, transform, model) {
    ctx.save();
    ctx.translate(transform.v2_position.x, transform.v2_position.y);
    ctx.rotate(V2.degToRad(transform.n_rotation));

    let scaledModel = scaleModel(model, transform.v2_scale);

    for(let tri of scaledModel) {
        drawTri(ctx, tri, tri.color);
    }

    ctx.restore();
}

const scaleModel = function(model, scale) {
    let scaledModel = [];
    for(let tri of model) {
        let scaledTri = createTri(V2.create(tri.v1.x * scale.x, tri.v1.y * scale.y),
                                  V2.create(tri.v2.x * scale.x, tri.v2.y * scale.y),
                                  V2.create(tri.v3.x * scale.x, tri.v3.y * scale.y),
                                  tri.color);
        scaledModel.push(scaledTri);
    }
    return scaledModel;
}

export {
    setCanvasSize,
    createTri,
    drawTri,
    drawModel,
    scaleModel
}