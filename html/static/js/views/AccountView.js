import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.controller = new AbortController();
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
                            <button id="first-name-button" class="clean-button">
                                <img class="small-icon" src="./static/media/edit.svg" />
                            </button>
                        </div>
                        <div class="list-item">
                            <input id="last-name" class="list-field" type="text" value="Rabenstein" placeholder="Last Name" readonly />
                            <button id="last-name-button" class="clean-button">
                                <img class="small-icon" src="./static/media/edit.svg" draggable="false" (dragstart)="false;" />
                            </button>
                        </div>
                        <div class="list-item">
                            <input id="email" class="list-field" type="text" value="" placeholder="Email" />
                            <button id="email-button" class="clean-button">
                                <img class="small-icon" src="./static/media/checkmark.svg" draggable="false" (dragstart)="false;" />
                            </button>
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

    handleInputChange = (event) => {
        const button = event.target.closest('button');
        if (button) {
            const inputField = button.previousElementSibling;

            if (!inputField.readOnly && inputField.value.trim() === '') {
                alert('Please enter a value before saving!');
                inputField.focus();
                return;
            }

            if (inputField && inputField.type === 'text') {
                inputField.readOnly = !inputField.readOnly;
                inputField.focus();
                if (!inputField.readOnly) {
                    inputField.select();
                }
            }
        }
    }

    afterRender = async () => {
        const profileImage = document.querySelector('.large-pp');

        const profileImageCached = localStorage.getItem('profile_image');
        if (!profileImageCached) {
            profileImage.src = './static/media/fallback-profile.png';
        } else {
            profileImage.src = profileImageCached;
        }
        this.eventContainer = document.getElementById('event-container');

        this.eventContainer.addEventListener('click', this.handleInputChange, {
            signal: this.controller.signal    
        })

        return () => {
            this.controller.abort();
        }
    }
}