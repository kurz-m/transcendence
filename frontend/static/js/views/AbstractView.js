export default class {
    constructor() {
        this.isLoggedIn = false;
        this.checkLoginStatus();
    }

    setTitle(title) {
        document.title = title;
    }

    async checkLoginStatus() {
        const tokenCookie = document.cookie.match(/(^|;\s*)access_token=([^;]+)/);
        const jwtToken = tokenCookie ? tokenCookie[2] : null;

        if (jwtToken) {
            this.isLoggedIn = true;
        } else {
            console.error('User is not logged in');
        }
    }

    async getHtml() {
        return "";
    }
}
