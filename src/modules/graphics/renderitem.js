export default class RenderItem {
    constructor(transform, renderContent, renderLayer, isVisible = true) {
        this.transform = transform;
        this.content = renderContent;
        this.layer = renderLayer;
        this.isVisible = isVisible;
    }
}
