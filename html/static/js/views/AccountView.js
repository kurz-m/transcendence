import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Account");
    }

    getHtml = async () => {
        return `
        <div class="window">
            <div class="topbar">
            <button id="back-button" onclick="history.back()" class="icon-button">
                 <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
            </button>
            <div class="user-header">
                <img class="large-pp" src="./static/media/fallback-profile.jpg">
                <div class="username">User</div>
            </div>
            <a href="/" class="icon-button" data-link>
                <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;">
            </a>
            </div>
            <div class="content">
            <div class="account-details">
                <div class="list-item">
                <input class="list-field" type="text" value="Aaron" placeholder="First Name" readonly>
                <button class="clean-button">
                    <img class="small-icon" src="./static/media/edit.svg">
                </button>
                </div>
                <div class="list-item">
                <input class="list-field" type="text" value="Rabenstein" placeholder="Last Name" readonly>
                <button class="clean-button">
                    <img class="small-icon" src="./static/media/edit.svg" draggable="false" (dragstart)="false;">
                </button>
                </div>
                <!-- Above is the default state. once the edit button is clicked, input is made editable and button becomes checkmark! -->
                <div class="list-item">
                <input class="list-field" type="text" value="" placeholder="Email">
                <button class="clean-button">
                    <img class="small-icon" src="./static/media/checkmark.svg" draggable="false" (dragstart)="false;">
                </button>
                </div>
                <div class="list-item">
                <div class="field">2FA</div>
                <button class="small-button">Enable</button>
                
            </div>
            </div>
        </div>
        `
    }
}