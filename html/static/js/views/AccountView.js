import { navigateTo } from "../index.js";
import { getDefaultHeader, getUserCache, updateCache } from "../shared.js";
import AbstractView from "./AbstractView.js";

const POST_MFA_QR_API = 'https://transcendence.myprojekt.tech/api-mfa/enable';
const POST_MFA_VERIFY_API = 'https://transcendence.myprojekt.tech/api-mfa/verify';
const DELETE_MFA_API = 'https://transcendence.myprojekt.tech/api-mfa/verify';
const PUT_PLAYER_API = 'https://transcendence.myprojekt.tech/api/player';
const CACHE_KEY = 'player_data';

export default class extends AbstractView {
    constructor() {
        super();
        this.controller = new AbortController();
        this.qrRefreshIntervalId = null;
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
                        <button id="enable-button" class="small-button-red">Disable</button>
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
                <img class="twoFA-QR" src="" draggable="false" (dragstart)="false;" />
                <div class="small-text">And enter the 6-digit verification code:</div>
                <input class="twoFA-input" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" pattern="\d{6}" />
            </div>
        </div>
        `
    }

    refreshQR = async (refreshInterval = 60000) => {
        this.qrRefreshIntervalId = setInterval(async () => {
            try {
                const response = await fetch(POST_MFA_QR_API, {
                    method: 'POST',
                    headers: getDefaultHeader()
                });
    
                if (response.ok) {
                    const data = await response.json();
                    this.twoFAImg.src = data.mfa_qrimage_url
                } else {
                    clearInterval(this.qrRefreshIntervalId);
                    navigateTo(`/error?statuscode=${response.status}`)
                }
            } catch (error) {
                clearInterval(this.qrRefreshIntervalId);
                console.error('error', error);
            }
        }, refreshInterval);
    }

    updatePlayerEntry = async (status) => {
        this.cache.data.two_factor = status;
        updateCache(CACHE_KEY, this.cache);
        if (status) {
            try {
                const response = await fetch(`${PUT_PLAYER_API}/${this.cache.data.user.id}`, {
                    method: 'PUT',
                    headers: getDefaultHeader(),
                    body: JSON.stringify({
                        "two_factor": this.cache.data.two_factor
                    })
                });
                if (!response.ok) {
                    navigateTo(`/error?statuscode=${response.status}`)
                }
            } catch (error) {
                console.error('error', error);
            }
        }
    }

    attachEventListeners = async () => {

        this.handleTwoFaButton = async () => {
            if (this.twoFAButton.innerHTML === 'enable') {
                try {
                    const response = await fetch(POST_MFA_QR_API, {
                        method: 'POST',
                        headers: getDefaultHeader()
                    });
    
                    if (response.ok) {
                        const data = await response.json();
                        this.twoFAImg.src = data.mfa_qrimage_url
                    } else {
                        navigateTo(`/error?statuscode=${response.status}`)
                    }
                    this.refreshQR();
                } catch (error) {
                    console.error('error', error);
                }
                this.twoFactorWindow.classList.remove('hidden');
                this.accountWindow.classList.add('hidden');
                this.twoFAInput.focus();
            } else {
                this.updatePlayerEntry(false);
                this.setButtonStyle();  
            }
        };
        this.twoFAButton.addEventListener('click', this.handleTwoFaButton, {
            signal: this.controller.signal
        })

        this.handleMFA = async (event) => {
            const allowedKeys = ["Enter", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace"];

            if (!allowedKeys.includes(event.key)) {
                event.preventDefault();
                return;
            };
            if (event.key === 'Enter' && this.twoFAInput.value.length === 6) {
                try {
                    const raw = JSON.stringify({
                        "user_id": this.cache.data.user.id,
                        "token": this.twoFAInput.value
                    });
                    const response = await fetch(POST_MFA_VERIFY_API, {
                        method: 'POST',
                        headers: getDefaultHeader(),
                        body: raw
                    });

                    if (response.ok) {
                        this.twoFactorWindow.classList.add('hidden');
                        this.accountWindow.classList.remove('hidden');
                        /* update cache and player 2FA to true */
                        clearInterval(this.qrRefreshIntervalId);
                        this.qrRefreshIntervalId = null;
                        this.updatePlayerEntry(true);
                        this.setButtonStyle();
                    } else {

                    }
                } catch (error) {
                    console.error('error', error);
                }
            }
        }
        this.twoFAInput.addEventListener('keydown', this.handleMFA, {
            signal: this.controller.signal
        })
    }

    setButtonStyle() {
        if (this.cache.data.two_factor) {
            this.twoFAButton.innerHTML = 'disable';
            this.twoFAButton.classList.remove('small-button-green');
            this.twoFAButton.classList.add('small-button-red');
        } else {
            this.twoFAButton.innerHTML = 'enable';
            this.twoFAButton.classList.add('small-button-green');
            this.twoFAButton.classList.remove('small-button-red');
        }
    }

    afterRender = async () => {
        /* elements for 2fa */
        this.twoFactorWindow = document.getElementById('twoFA-window');
        this.accountWindow = document.getElementById('account-window');
        this.twoFAButton = document.getElementById('enable-button');
        this.twoFAImg = document.querySelector('.twoFA-QR');
        this.twoFAInput = document.querySelector('.twoFA-input');

        /* display values */
        const profileImage = document.querySelector('.large-pp');
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const email = document.getElementById('email');
        const username = document.getElementById('username');
        

        this.cache = await getUserCache();
        if (this.cache) {
            profileImage.src = this.cache.data.profile_img_url;
            firstName.value = this.cache.data.user.first_name;
            lastName.value = this.cache.data.user.last_name;
            email.value = this.cache.data.user.email;
            username.innerHTML = this.cache.data.user.username;
            this.setButtonStyle();   
        } else {
            profileImage.src = './static/media/fallback-profile.png';
        }

        await this.attachEventListeners();
        return () => {
            this.controller.abort();
            clearInterval(this.qrRefreshIntervalId);
        }
    }
}