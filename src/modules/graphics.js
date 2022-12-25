import * as V2 from "./vectors";

let canvas = null;
let ctx = null;
let v2_center = V2.zero;

let scale = window.devicePixelRatio;
let millisToRender = 0;

let renderList = [];

class RenderItem {
    constructor(renderLayer, transform, renderContent) {
        this.layer = renderLayer;
        this.transform = transform;
        this.content = renderContent;
    }
}

class Mesh {
    constructor(polygons) {
        this.polygons = polygons;
    }
    scaled(v2_scale) {
        let scaledPolygons = [];
        // Why is polygons not iterable?
        for(let p of this.polygons) {
            scaledPolygons.push(p.scaled(v2_scale));
        }
        return new Mesh(scaledPolygons);
    }
}

class Polygon {
    constructor(vertexArray, color) {
        this.vertexArray = vertexArray;
        this.color = color;
    }
    scaled(v2_scale) {
        let scaledVertexArray = [];
        for(let v of this.vertexArray) {
            let scaledVertex = V2.create(v.x * v2_scale.x, v.y * v2_scale.y);
            scaledVertexArray.push(scaledVertex);
        }
        return new Polygon(scaledVertexArray, this.color);
    }
}

const createCanvas = function() {
    canvas = document.createElement("canvas");
    canvas.id = "renderCanvas";
    document.querySelector("body").appendChild(canvas);

    ctx = canvas.getContext("2d");
    v2_center = V2.create(canvas.clientWidth / 2, canvas.clientHeight / 2); 

    setCanvasSize(scale, canvas.clientWidth, canvas.clientHeight);

    return canvas;
}

const setCanvasSize = function(scale, width, height) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
}

const getCanvasSize = function() {
    return V2.create(canvas.clientWidth, canvas.clientHeight);
}

const getCenter = function() {
    return v2_center;
}

const getDelta = function() {
    // Return how long it took to render in seconds (hopefully this is something like 0.001 etc.)
    return millisToRender / 1000;
}

const getFPS = function() {
    return Math.round(1000 / Math.abs(millisToRender));
}

const addToRenderList = function(renderItem) {
    if (!renderList.includes(renderItem))
        renderList.push(renderItem);
    console.log("Updated render list:");
    console.table(renderList);
}

const removeFromRenderList = function(renderItem) {
    if (renderList.includes(renderItem))
        renderList.splice(renderList.indexOf(renderItem), 1);
}

const renderMesh = function(renderItem) {

    let transform = renderItem.transform;
    let mesh = renderItem.content.mesh;

    ctx.save();

    ctx.translate(transform.v2_position.x, transform.v2_position.y);
    ctx.rotate(V2.degToRad(transform.n_rotation));

    let scaledMesh = mesh.scaled(transform.v2_scale);

    function renderPolygon(p) {

        let vertexes = p.vertexArray;
        let currentVertex = vertexes[0];
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.moveTo(currentVertex.x * scale, currentVertex.y * scale);

        // Skip first vertex as we already moved to that position
        for(let i = 1; i < vertexes.length; i++) {
            currentVertex = vertexes[i];
            ctx.lineTo(currentVertex.x * scale, currentVertex.y * scale);
        }

        ctx.closePath();
        ctx.fill();
    }

    for(let p of scaledMesh.polygons) {
        renderPolygon(p);
    }

    ctx.restore();

}

const renderText = function(renderItem) {

    let transform = renderItem.transform;
    let content = renderItem.content;

    ctx.save();

    if (content.strokeStyle != undefined)
        ctx.strokeStyle = content.strokeStyle;
    
    if (content.fillStyle != undefined)
        ctx.fillStyle = content.fillStyle;

    if (content.font != undefined)
        ctx.font = content.font;

    ctx.fillText(`${content.text}`, transform.v2_position.x, transform.v2_position.y);

    ctx.restore();
}

const renderToCanvas2D = function() {

    let renderStartTime = new Date().getTime();

    // Sort into renderLayer order
    renderList.sort(function(a, b) {
        return a.layer > b.layer;
    });

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Go through all items in "renderList" and call the appropriate function to draw it, depending on the content
    for (let renderItem of renderList) {
        let content = renderItem.content;
        if (content.text != undefined) {
            renderText(renderItem);
            continue;
        }
        if (content.mesh != undefined) {
            renderMesh(renderItem);
            continue;
        }
    }

    millisToRender = new Date().getTime() - renderStartTime;

    console.log(`Delta: ${getDelta()}`);
}

export {
    RenderItem,
    Mesh,
    Polygon,

    getCanvasSize,
    getCenter,
    getDelta,
    getFPS,

    createCanvas,
    setCanvasSize,
    addToRenderList,
    removeFromRenderList,
    renderToCanvas2D
}