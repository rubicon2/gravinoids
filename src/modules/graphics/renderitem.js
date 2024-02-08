import * as V2 from './../vectors';

let defaultTextStyle = {
    font: '24px Arial',
    strokeStyle: 'white',
    fillStyle: 'white',
};

class RenderItem {
    constructor(transform, renderLayer, isVisible = true) {
        this.transform = transform;
        this.layer = renderLayer;
        this.isVisible = isVisible;
    }
}

export class RenderTextInfo {
    constructor(text, font, strokeStyle, fillStyle) {
        // Text can be literal text or a function that generates a string
        this.text = text;
        this.font = font;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
    }
}

export class RenderText extends RenderItem {
    constructor(transform, renderTextInfo, renderLayer, isVisible = true) {
        super(transform, renderLayer, isVisible);
        this.renderTextInfo = renderTextInfo;
    }

    draw(ctx, scale) {
        let transform = this.transform;
        let content = this.renderTextInfo.text;
        let { strokeStyle, fillStyle, font } = this.renderTextInfo;

        let text = 'empty string';
        if (typeof content === 'function') text = content();
        else text = content;

        ctx.save();
        ctx.translate(transform.v2_position.x, transform.v2_position.y);
        ctx.rotate(V2.degToRad(transform.n_rotation));

        ctx.strokeStyle =
            strokeStyle != undefined
                ? strokeStyle
                : defaultTextStyle.strokeStyle;
        ctx.fillStyle =
            fillStyle != undefined ? fillStyle : defaultTextStyle.fillStyle;
        ctx.font = font != undefined ? font : defaultTextStyle.font;

        ctx.fillText(`${text}`, 0, 0);

        ctx.restore();
    }
}

export class RenderMesh extends RenderItem {
    constructor(transform, mesh, renderLayer, isVisible = true) {
        super(transform, renderLayer, isVisible);
        this.mesh = mesh;
    }

    draw(ctx, scale) {
        let transform = this.transform;
        let mesh = this.mesh;

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
    }
}
