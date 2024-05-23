import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Pong");
    }

    getHtml = async () => {
        return `
        <h1>Pong Game</h1>
        `
    }
}