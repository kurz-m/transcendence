import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Two Factor");
    }

    getHtml = async () => {
        if (this.isLoggedIn) {
            return `
            <h1>You sure have friends</h1>
            `
        } else {
            return `
            <h1>You are not logged in</h1>
            `
        }
    }
}