import { getCookie } from "../shared.js";
const loginAPI = 'https://transcendence.myprojekt.tech/api/auth/loggedin'

export default class {
    constructor() {
        this.username = 'user';
        if (getCookie('user')) {
            this.isLoggedIn = true;
        } else {
            this.isLoggedIn = false;
        }
        // this.checkLoginStatus();
    }

    setTitle(title) {
        document.title = title;
    }

    async checkLoginStatus() {
        try {
            const response = await fetch(loginAPI);
            if (response.ok) {
                this.username = getCookie('user');
                this.isLoggedIn = true;
            } else {
                this.isLoggedIn = false;
            }
        } catch (error) {
            console.log('Error:', error);
        }
        return this.isLoggedIn;
    }

    async getHtml() {
        return "";
    }
}
