import { updateCache } from "../authentication.js";
import { navigateTo } from "../index.js";
import { getDefaultHeader } from "../shared.js";
import AbstractView from "./AbstractView.js";

const POST_MFA_QR_API = 'https://transcendence.myprojekt.tech/api-mfa/enable'
const POST_MFA_VERIFY_API = 'https://transcendence.myprojekt.tech/api-mfa/verify'
const PUT_PLAYER_API = 'https://transcendence.myprojekt.tech/api/player'

const CACHE_KEY = 'player_data'

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
                <img id="twoFA-img" class="twoFA-QR" src="" draggable="false" (dragstart)="false;" />
                <div class="small-text">And enter the 6-digit verification code:</div>
                <input id="twoFA-input" class="twoFA-input" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" pattern="\d{6}" />
            </div>
        </div>
        `
    }

    getUserCache = async () => {
        const data = localStorage.getItem('player_data');
        return JSON.parse(data);
    }

    updateQrImage = async () => {
        /* TODO: resend the same POST request again after a certain time */
    }

    updatePlayerEntry = async () => {
        try {
            this.cache.data.two_factor = true;
            updateCache(CACHE_KEY, this.cache);
            const response = fetch(`${PUT_PLAYER_API}/${this.cache.data.user.id}`, {
                method: 'PUT',
                headers: getDefaultHeader(),
                body: JSON.stringify({
                    "two_factor": this.cache.data.two_factor
                })
            });
            if (response.ok) {

            } else {

            }
        } catch (error) {
            console.error('error', error);
        }
    }

    attachEventListeners = async () => {

        this.handleTwoFaButton = async () => {
            try {
                const response = await fetch(POST_MFA_QR_API, {
                    method: 'POST',
                    headers: getDefaultHeader()
                });

                if (response.ok) {
                    const data = await response.json();
                    this.twoFaImg.src = data.mfa_qrimage_url
                } else {
                    navigateTo(`/error?statuscode=${response.status}`)
                }
                this.updateQrImage();
            } catch (error) {
                console.error('error', error);
            }
            this.twoFactorWindow.classList.remove('hidden');
            this.accountWindow.classList.add('hidden');
            this.twoFaInput.focus();
        };
        this.twoFaButton.addEventListener('click', this.handleTwoFaButton, {
            signal: this.controller.signal
        })

        this.handleSendVerifyCode = async (event) => {
            const allowedKeys = ["Enter", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace"];

            if (!allowedKeys.includes(event.key)) {
                event.preventDefault();
                return;
            };
            if (event.key === 'Enter' && this.twoFaInput.value.length === 6) {
                try {
                    const raw = JSON.stringify({
                        "token": this.twoFaInput.value
                    });
                    const response = await fetch(POST_MFA_VERIFY_API, {
                        method: 'POST',
                        headers: getDefaultHeader(),
                        body: raw
                    });

                    if (response.ok) {
                        /* update cache and player 2FA to true */
                        this.updatePlayerEntry();
                    } else {

                    }
                } catch (error) {
                    console.error('error', error);
                }
            }
        }
        this.twoFaInput.addEventListener('keydown', this.handleSendVerifyCode, {
            signal: this.controller.signal
        })
    }

    afterRender = async () => {
        /* elements for 2fa */
        this.twoFactorWindow = document.getElementById('twoFA-window');
        this.accountWindow = document.getElementById('account-window');
        this.twoFaButton = document.getElementById('enable-button');
        this.twoFaImg = document.getElementById('twoFA-img');
        this.twoFaInput = document.getElementById('twoFA-input');

        this.attachEventListeners();
        /* display values */
        const profileImage = document.querySelector('.large-pp');
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const email = document.getElementById('email');
        const username = document.getElementById('username');


        this.cache = await this.getUserCache();
        if (!this.cache) {
            profileImage.src = './static/media/fallback-profile.png';
        } else {
            profileImage.src = this.cache.data.profile_img_url;
            firstName.value = this.cache.data.user.first_name;
            lastName.value = this.cache.data.user.last_name;
            email.value = this.cache.data.user.email;
            username.innerHTML = this.cache.data.user.username;
        }

        return () => {
            this.controller.abort();
        }
    }
}