import { checkLoginStatus, setLoggedIn } from "../authentication.js";
import { navigateTo, updateLoginState } from "../index.js";
import { getDefaultHeader } from "../shared.js";
import AbstractView from "./AbstractView.js";

const POST_MFA_LOGIN_API = 'https://transcendence.myprojekt.tech/api/auth/mfalogin'

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Two Factor");
        this.controller = new AbortController();
    }

    getHtml = async () => {
        return `
        <div id="twoFA-login" class="window">
            <div class="topbar">
                <button class="icon-button">
                    <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;" />
                </button>
                <div class="title">2FA - Login</div>
                <button class="icon-button">
                    <img class="icon" src="./static/media/home.svg" alt="Home" draggable="false" (dragstart)="false;" />
                </button>
            </div>
            <div class="content">
                <div class="small-text">To login, please enter the 6-digit verification code from your authenticator app:</div>
                <input class="twoFA-input" type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="6" pattern="\d{6}" />
            </div>
        </div>
        `;
    }

    attachEventListeners = async () => {
        this.handleSendVerifyCode = async (event) => {
            const allowedKeys = ["Enter", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace"];

            if (!allowedKeys.includes(event.key)) {
                event.preventDefault();
                return;
            };
            if (event.key === 'Enter' && this.twoFAInput.value.length === 6) {
                try {
                    const urlParams = new URLSearchParams(location.search);
                    const raw = JSON.stringify({
                        "token": this.twoFAInput.value,
                        "user_id": urlParams.get('user_id'),
                        "oauth_token": urlParams.get('oauth_token'),
                    });
                    const response = await fetch(POST_MFA_LOGIN_API, {
                        method: 'POST',
                        headers: getDefaultHeader(),
                        body: raw
                    });

                    if (response.ok) {
                        setLoggedIn(true);
                        navigateTo('/');
                        return
                    } else {
                        /* TODO: handle error */
                    }
                } catch (error) {
                    console.error('error', error);
                }
            }
        }
        this.twoFAInput.addEventListener('keydown', this.handleSendVerifyCode, {
            signal: this.controller.signal
        })
    }

    afterRender = async () => {
        this.twoFAInput = document.querySelector('.twoFA-input');
        this.twoFAInput.focus();

        await this.attachEventListeners();

        return () => {
            this.controller.abort();
        }
    }
}