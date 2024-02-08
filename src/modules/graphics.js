import * as V2 from './vectors';
import { subscribe, publish } from './pubsub';
import RenderLayer from './graphics/renderlayer';
import { RenderMesh } from './graphics/renderitem';

let canvas = null;
let ctx = null;
let v2_center = V2.zero;

let scale = window.devicePixelRatio;

let renderList = [];

let layers = {
    background: new RenderLayer(0, 'background', true),
    game: new RenderLayer(1, 'game', true),
    ui: new RenderLayer(2, 'ui', true),
    debug: new RenderLayer(3, 'debug', true),
};

function addRigibodyDebug(rigidbody) {
    addToRenderList(
        new RenderMesh(
            rigidbody.transform,
            rigidbody.collisionMesh,
            layers.debug,
            true
        )
    );
}

subscribe('onNewRigidbody', addRigibodyDebug);

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

const renderScene2D = function () {
    // Filter renderList by visible layers only
    let visibleOnly = renderList.filter(function (e) {
        return e.layer.isVisible && e.isVisible;
    });

    // Sort what remains into renderLayer order
    visibleOnly.sort(function (a, b) {
        return a.layer.renderOrder > b.layer.renderOrder;
    });

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (let renderItem of visibleOnly) {
        // renderRenderItem(renderItem);
        renderItem.draw(ctx, scale);
    }
};

export {
    layers,
    getCanvasSize,
    getCenter,
    createCanvas,
    setCanvasSize,
    addToRenderList,
    removeFromRenderList,
    renderScene2D,
};
