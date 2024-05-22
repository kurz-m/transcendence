import { getLoggedIn } from "../authentication.js";

export default class {
    constructor() {
        this.isLoggedIn = getLoggedIn();
    }

    setTitle = title => {
        document.title = title;
    }

    getHtml = async () => {
        return "";
    }
}
