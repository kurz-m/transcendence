import { getDefaultHeader } from "../shared.js";
import AbstractView from "./AbstractView.js";

const GET_MFA_QR_API = 'https://transcendence.myprojekt.tech/api-mfa/enable'

export default class extends AbstractView {
    constructor() {
        super();
        this.controller = new AbortController();
    }

    getHtml = async () => {
        return `
        <div id="account-window" class="window">
            <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;" />
                </button>
                <div class="user-header">
                    <button class="edit-pp-button">
                        <img class="large-pp" src="./static/media/fallback-profile.png" draggable="false" (dragstart)="false;" />
                        <img class="edit-pp-overlay" src="./static/media/edit.svg" alt="Edit" draggable="false" (dragstart)="false;" />
                    </button>
                    <div id="username" class="medium-text">User</div>
                </div>
                <a href="/" class="icon-button" data-link>
                    <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;" />
                </a>
            </div>
            <div class="content">
                <div class="account-details">
                    <div id="event-container">
                        <div class="list-item">
                            <input id="first-name" class="list-field" type="text" value="" readonly />
                        </div>
                        <div class="list-item">
                            <input id="last-name" class="list-field" type="text" value="" readonly />
                        </div>
                        <div class="list-item">
                            <input id="email" class="list-field-small" type="text" value="nothing" readonly />
                        </div>
                    </div>
                    <div class="list-item">
                        <div class="field">2FA</div>
                        <button id="enable-button" class="small-button">Enable</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="twoFA-window" class="window hidden">
            <div class="topbar">
                <a href="/account" class="icon-button" data-link>
                    <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;" />
                </a>
                <div class="title">Enable 2FA</div>
                <a href="/" class="icon-button" data-link>
                    <img class="icon" src="./static/media/home.svg" alt="Home" draggable="false" (dragstart)="false;" />
                </a>
            </div>
            <div class="content">
                <div class="small-text">To enable Two-Factor-Authentication, please scan the QR-Code with your authenticator app:</div>
                <img id="twoFA-img" class="twoFA-QR" src="./static/media/2fa-qr.png" draggable="false" (dragstart)="false;" />
                <div class="small-text">And enter the 6-digit verification code:</div>
                <input class="twoFA-input" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" pattern="\d{6}" />
            </div>
        </div>
    
        `
    }

    getUserCache = async () => {
        const data = localStorage.getItem('player_data');
        return JSON.parse(data);
    }

    attachEventListeners = async () => {
        
        this.handleTwoFaButton = async () => {
            try {
                const response = await fetch(GET_MFA_QR_API, {
                    method: 'POST',
                    headers: getDefaultHeader()
                });
    
                if (response.ok) {
                    /* TODO: handle qr code as a picture? HOW? */
                    console.log(response);
                } else {
                    alert('could not get a qr code');
                }
            } catch (error) {
                console.error('error', error);
            }
            this.twoFactorWindow.classList.remove('hidden');
            this.accountWindow.classList.add('hidden');
        }

        this.twoFaButton.addEventListener('click', this.handleTwoFaButton, {
            signal: this.controller.signal
        })
    }

    afterRender = async () => {
        /* elements for 2fa */
        this.twoFactorWindow = document.getElementById('twoFA-window');
        this.accountWindow = document.getElementById('account-window');
        this.twoFaButton = document.getElementById('enable-button');

        this.attachEventListeners();
        /* display values */
        const profileImage = document.querySelector('.large-pp');
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const email = document.getElementById('email');
        const username = document.getElementById('username');


        const cache = await this.getUserCache();
        if (!cache) {
            profileImage.src = './static/media/fallback-profile.png';
        } else {
            profileImage.src = cache.data.profile_img_url;
            firstName.value = cache.data.user.first_name;
            lastName.value = cache.data.user.last_name;
            email.value = cache.data.user.email;
            username.innerHTML = cache.data.user.username;
        }

        return () => {
            this.controller.abort();
        }
    }
}