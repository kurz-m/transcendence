import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Account");
    }

    async getHtml() {
        return `
        <h1>Here should be the account screen</h1>
        `
    }
}