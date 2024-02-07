import * as V2 from './vectors';
import { subscribe, publish } from './pubsub';
import RenderLayer from './graphics/renderlayer';
import RenderItem from './graphics/renderitem';

let canvas = null;
let ctx = null;
let v2_center = V2.zero;

let scale = window.devicePixelRatio;

let renderList = [];

let defaultTextStyle = {
    font: '24px Arial',
    strokeStyle: 'white',
    fillStyle: 'white',
};

let layers = {
    background: new RenderLayer(0, 'background', true),
    game: new RenderLayer(1, 'game', true),
    ui: new RenderLayer(2, 'ui', true),
    debug: new RenderLayer(3, 'debug', true),
};

function addRigibodyDebug(rigidbody) {
    addToRenderList(
        new RenderItem(
            rigidbody.transform,
            { mesh: rigidbody.collisionMesh },
            layers.debug,
            true
        )
    );
}

subscribe('onNewRigidbody', addRigibodyDebug);

class Mesh {
    constructor(polygons) {
        this.polygons = polygons;
    }
    scaled(v2_scale) {
        let scaledPolygons = [];
        // Why is polygons not iterable?
        for (let p of this.polygons) {
            scaledPolygons.push(p.scaled(v2_scale));
        }
        return new Mesh(scaledPolygons);
    }
}

class Polygon {
    constructor(vertexArray, color, isColorFill = true) {
        this.vertexArray = vertexArray;
        this.color = color;
        this.isColorFill = isColorFill;
    }
    scaled(v2_scale) {
        let scaledVertexArray = [];
        for (let v of this.vertexArray) {
            let scaledVertex = V2.create(v.x * v2_scale.x, v.y * v2_scale.y);
            scaledVertexArray.push(scaledVertex);
        }
        return new Polygon(scaledVertexArray, this.color, this.isColorFill);
    }
}

const createCanvas = function () {
    canvas = document.createElement('canvas');
    canvas.id = 'renderCanvas';
    document.querySelector('body').appendChild(canvas);

    ctx = canvas.getContext('2d');
    v2_center = V2.create(canvas.clientWidth / 2, canvas.clientHeight / 2);

    setCanvasSize(scale, canvas.clientWidth, canvas.clientHeight);

    return canvas;
};

const setCanvasSize = function (scale, width, height) {
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
};

const getCanvasSize = function () {
    return V2.create(canvas.clientWidth, canvas.clientHeight);
};

const getCenter = function () {
    return v2_center;
};

const addToRenderList = function (renderItem) {
    if (!renderList.includes(renderItem)) renderList.push(renderItem);
    publish('onAddToRenderList', renderItem);
    publish('onRenderListChange', renderList);
};

const removeFromRenderList = function (renderItem) {
    if (renderList.includes(renderItem))
        renderList.splice(renderList.indexOf(renderItem), 1);
    publish('onRemoveFromRenderList', renderItem);
    publish('onRenderListChange', renderList);
};

const renderMesh = function (renderItem) {
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
        ctx.strokeStyle = p.color;

        ctx.beginPath();
        ctx.moveTo(currentVertex.x * scale, currentVertex.y * scale);

        // Skip first vertex as we already moved to that position
        for (let i = 1; i < vertexes.length; i++) {
            currentVertex = vertexes[i];
            ctx.lineTo(currentVertex.x * scale, currentVertex.y * scale);
        }

        ctx.closePath();

        if (p.isColorFill) ctx.fill();
        else ctx.stroke();
    }

    for (let p of scaledMesh.polygons) {
        renderPolygon(p);
    }

    ctx.restore();
};

const renderText = function (renderItem) {
    let transform = renderItem.transform;
    let content = renderItem.content;

    let text = 'empty string';
    if (typeof content.text === 'function') text = content.text();
    else text = content.text;

    ctx.save();
    ctx.translate(transform.v2_position.x, transform.v2_position.y);
    ctx.rotate(V2.degToRad(transform.n_rotation));

    ctx.strokeStyle =
        content.strokeStyle != undefined
            ? content.strokeStyle
            : defaultTextStyle.strokeStyle;
    ctx.fillStyle =
        content.fillStyle != undefined
            ? content.fillStyle
            : defaultTextStyle.fillStyle;
    ctx.font = content.font != undefined ? content.font : defaultTextStyle.font;

    ctx.fillText(`${text}`, 0, 0);

    ctx.restore();
};

const renderRenderItem = function (renderItem) {
    let content = renderItem.content;
    if (content.text != undefined) {
        renderText(renderItem);
    } else if (content.mesh != undefined) {
        renderMesh(renderItem);
    } else {
        console.error(`RenderItem has no valid content to render.`);
        console.error(new Error().stack);
    }
};

const renderScene2D = function () {
    // Filter renderList by visible layers only
    let visibleOnly = renderList.filter(function (e) {
        return e.layer.isVisible && e.isVisible;
    });

    // Sort what remains into renderLayer order
    visibleOnly.sort(function (a, b) {
        return a.layer.renderOrder > b.layer.renderOrder;
    });

    // Sort into renderLayer order
    // renderList.sort(function(a, b) {
    //     return a.layer.renderOrder > b.layer.renderOrder;
    // });

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Go through all items in "renderList" and call the appropriate function to draw it, depending on the content
    // for (let renderItem of renderList) {
    //     renderRenderItem(renderItem);
    // }

    for (let renderItem of visibleOnly) {
        renderRenderItem(renderItem);
    }
};

export {
    Mesh,
    Polygon,
    layers,
    getCanvasSize,
    getCenter,
    createCanvas,
    setCanvasSize,
    addToRenderList,
    removeFromRenderList,
    renderScene2D,
};
