require('./styles.css');

import * as Util from './modules/util';
import * as V2 from './modules/vectors';
import * as Gfx from './modules/graphics';
import { publish } from './modules/pubsub';

import { InputController, InputSequence, KeyEvent } from './modules/input';

import Rigidbody from './modules/rigidbody';
import Player from './modules/player';
import Transform from './modules/transform';

let defaultKeys = [
    {
        up: 'KeyW',
        left: 'KeyA',
        down: 'KeyS',
        right: 'KeyD',
        action: 'KeyE',
    },
    {
        up: 'ArrowUp',
        left: 'ArrowLeft',
        down: 'ArrowDown',
        right: 'ArrowRight',
        action: 'ShiftRight',
    },
];

let shipMeshes = [
    new Gfx.Mesh([
        new Gfx.Polygon(
            [
                V2.create(-12, 12),
                V2.create(0, -24),
                V2.create(12, 12),
                V2.create(0, 0),
            ],
            'yellow'
        ),
    ]),
    new Gfx.Mesh([
        new Gfx.Polygon(
            [
                V2.create(-12, 12),
                V2.create(0, -24),
                V2.create(12, 12),
                V2.create(0, 0),
            ],
            'red'
        ),
        new Gfx.Polygon(
            [
                V2.create(-12, 12),
                V2.create(0, -5),
                V2.create(12, 12),
                V2.create(0, 0),
            ],
            'orange'
        ),
    ]),
];

function createRGBA(r, g, b, a) {
    return {
        r: Util.clamp(0, 255, r),
        g: Util.clamp(0, 255, g),
        b: Util.clamp(0, 255, b),
        a: Util.clamp(0, 1, a),
        toString() {
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        },
    };
}

function update() {
    let canvasSize = Gfx.getCanvasSize();
    for (let rb of Rigidbody.list) {
        rb.update();
        // Loop position within play area
        rb.transform.v2_localPosition = V2.create(
            Util.loopNumber(0, canvasSize.x, rb.transform.v2_position.x),
            Util.loopNumber(0, canvasSize.y, rb.transform.v2_position.y)
        );
    }
}

function createPlayers(playerCount) {
    let center = Gfx.getCenter();
    playerCount = Math.min(playerCount, 4);
    // Not using break on purpose so it cascades down each case.
    switch (playerCount) {
        case 4:
            // New players are automatically added to static Player.list.
            new Player(
                createRGBA(0, 255, 0, 1),
                center.x * 0.5,
                center.y * 0.5,
                shipMeshes[1],
                defaultKeys[3]
            );
        case 3:
            new Player(
                createRGBA(0, 0, 255, 1),
                center.x * 1.5,
                center.y * 1.5,
                shipMeshes[0],
                defaultKeys[2]
            );
        case 2:
            new Player(
                createRGBA(255, 0, 0, 1),
                center.x * 1.5,
                center.y * 0.5,
                shipMeshes[1],
                defaultKeys[1]
            );
        default:
            new Player(
                createRGBA(255, 0, 255, 1),
                center.x * 0.5,
                center.y * 1.5,
                shipMeshes[0],
                defaultKeys[0]
            );
    }
}

function initialiseGameData(playerCount) {
    createPlayers(playerCount);
}

function tick() {
    publish('onTickStart');

    update();
    Gfx.renderScene2D();
    requestAnimationFrame(tick);

    publish('onTickEnd');
}

Gfx.createCanvas();
initialiseGameData(2);
requestAnimationFrame(tick);

window.addEventListener('keydown', function (e) {
    if (!e.repeat) {
        // Input.oldHandler(Player.list, e);
        InputController.handleKeyDown(e);
    }
});

window.addEventListener('keyup', function (e) {
    InputController.handleKeyUp(e);
});

function createPlayerDebugPanel(player) {
    let t_debugPanel = new Transform(V2.create(50, -42.5), 0, V2.one, player.t);
    t_debugPanel.freeze_rotation = true;

    const lineGap = 25;

    let positionInfo = new Gfx.RenderItem(
        new Transform(V2.zero, 0, V2.one, t_debugPanel),
        {
            text: () => {
                return `x: ${Math.round(
                    player.t.v2_position.x
                )}, y: ${Math.round(player.t.v2_position.y)}`;
            },
        },
        Gfx.layers.debug
    );
    let velocityInfo = new Gfx.RenderItem(
        new Transform(V2.create(0, lineGap), 0, V2.one, t_debugPanel),
        {
            text: () => {
                return `vx: ${Util.roundTo(
                    player.rb.v2_velocity.x,
                    2
                )}, vy: ${Util.roundTo(player.rb.v2_velocity.y, 2)}`;
            },
        },
        Gfx.layers.debug
    );
    let rotationInfo = new Gfx.RenderItem(
        new Transform(V2.create(0, lineGap * 2), 0, V2.one, t_debugPanel),
        {
            text: () => {
                return `r: ${Math.round(player.t.n_rotation)}`;
            },
        },
        Gfx.layers.debug
    );
    let rotationSpeedInfo = new Gfx.RenderItem(
        new Transform(V2.create(0, lineGap * 3), 0, V2.one, t_debugPanel),
        {
            text: () => {
                return `rs: ${Util.roundTo(player.rb.n_rotationSpeed, 2)}`;
            },
        },
        Gfx.layers.debug
    );

    Gfx.addToRenderList(positionInfo);
    Gfx.addToRenderList(velocityInfo);
    Gfx.addToRenderList(rotationInfo);
    Gfx.addToRenderList(rotationSpeedInfo);
}

Gfx.addToRenderList(
    new Gfx.RenderItem(Player.list[0].t, { mesh: Player.list[0].mesh })
);
Gfx.addToRenderList(
    new Gfx.RenderItem(Player.list[1].t, { mesh: Player.list[1].mesh })
);
createPlayerDebugPanel(Player.list[0]);
createPlayerDebugPanel(Player.list[1]);

InputController.addBindingGroup('cheats', true, [
    new InputSequence(
        [
            new KeyEvent(['Numpad8']),
            new KeyEvent(['Numpad2']),
            new KeyEvent(['Numpad4']),
            new KeyEvent(['Numpad6']),
            new KeyEvent(
                ['NumpadEnter'],
                'keydown',
                () => (Gfx.layers.debug.isVisible = !Gfx.layers.debug.isVisible)
            ),
        ],
        () => alert('Failed to enter debug code!')
    ),
    new InputSequence(
        [
            new KeyEvent(['KeyO', 'KeyP'], 'keydown', () =>
                alert('Simultaneous double press detected!')
            ),
        ],
        () => alert('Simulteanous input break!')
    ),
    new InputSequence(
        [
            new KeyEvent(['KeyJ'], 'hold', () =>
                console.log('Hold 1 detected!')
            ),
            new KeyEvent(['KeyL'], 'hold', () =>
                console.log('Hold 2 detected!')
            ),
            new KeyEvent(['KeyK'], 'keydown', () =>
                console.log('Hold then press detected!')
            ),
            new KeyEvent(['KeyJ'], 'hold', () =>
                console.log('Hold then press then hold detected!')
            ),
        ],
        () => alert('Long sequence input break!!!')
    ),
]);

// document.addEventListener('keydown', (e) => console.log(e.code));
