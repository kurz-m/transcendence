import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Pong");
    }

    async getHtml() {
        return `
        <h1>Pong Game</h1>
        `
    }
}