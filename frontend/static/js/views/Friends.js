import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Friends");
    }

    async getHtml() {
        return `
        <h1>You sure have friends</h1>
        `
    }
}