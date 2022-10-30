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

function drawModel(transform, model) {
    ctx.save();
    ctx.translate(transform.position.x, transform.position.y);
    ctx.rotate(Util.degToRad(transform.rotation));

    let scaledModel = scaleModel(model, transform.scale);

    for(let tri of scaledModel) {
        drawTri(tri, tri.color);
    }

    ctx.restore();
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

function scaleModel(model, scale) {
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