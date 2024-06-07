import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
    }

    getHtml = async () => {
        return `
        <div class="window">
            <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;" />
                </button>
                <div class="user-header">
                    <button class="edit-pp-button">
                        <img class="large-pp" src="./static/media/fallback-profile.png" draggable="false" (dragstart)="false;" />
                        <img class="edit-pp-overlay" src="./static/media/edit.svg" alt="Edit" draggable="false" (dragstart)="false;" />
                    </button>
                    <div class="medium-text">User</div>
                </div>
                <a href="/" class="icon-button" data-link>
                    <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;" />
                </a>
            </div>
            <div class="content">
                <div class="account-details">
                    <div id="event-container">
                        <div class="list-item">
                            <input id="first-name" class="list-field" type="text" value="Aaron" placeholder="First Name" readonly />
                        </div>
                        <div class="list-item">
                            <input id="last-name" class="list-field" type="text" value="Rabenstein" placeholder="Last Name" readonly />
                        </div>
                        <div class="list-item">
                            <input id="email" class="list-field" type="text" value="" placeholder="Email" readonly/>
                        </div>
                    </div>
                    <div class="list-item">
                        <div class="field">2FA</div>
                        <button class="small-button">Enable</button>
                    </div>
                </div>
            </div>
        </div>
        `
    }

    afterRender = async () => {
        const profileImage = document.querySelector('.large-pp');

        const profileImageCached = localStorage.getItem('profile_image');
        if (!profileImageCached) {
            profileImage.src = './static/media/fallback-profile.png';
        } else {
            profileImage.src = profileImageCached;
        }

        return () => {
            this.controller.abort();
        }
    }
}