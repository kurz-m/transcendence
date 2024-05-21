import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Dashboard");
    }

    async getHtml() {
        return `
        <h1>Welcome back, Test</h1>
        <p>
            This is whatever we want.
        </p>
        <p>
            <a href="/login" data-link>Login</a>
        </p>
        `
    }
}