import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Test View");
    }

    // getHtml = async () => {
    //     return `
    //     <div class="window">
    //         <div class="topbar">
    //         <button class="icon-button">
    //             <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
    //         </button>
    //         <div class="title">2FA - Login</div>
    //         <button class="icon-button">
    //             <img class="icon" src="./static/media/home.svg" alt="Home" draggable="false" (dragstart)="false;">
    //         </button>
    //         </div>
    //         <div class="content">
    //         <div class="small-text">To login, please enter the 6-digit verification code from your authenticator app:</div>
    //         <input class="twoFA-input" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" pattern="\d{6}">
    //         </div>
    //     </div>
    //     `
    // }
    getHtml = async () => {
        return `
        <div class="window">
            <div class="topbar">
            <button class="icon-button">
                <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
            </button>
            <div class="title">Enable 2FA</div>
            <button class="icon-button">
                <img class="icon" src="./static/media/home.svg" alt="Home" draggable="false" (dragstart)="false;">
            </button>
            </div>
            <div class="content">
            <div class="small-text">To enable Two-Factor-Authentication, please scan the QR-Code with your authenticator app:</div>
            <img class="twoFA-QR" src="./static/media/2fa-qr.png" draggable="false" (dragstart)="false;">
            <div class="small-text">And enter the 6-digit verification code:</div>
            <input class="twoFA-input" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" pattern="\d{6}">
            </div>
        </div>
        `
    }
}
