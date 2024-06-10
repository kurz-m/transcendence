import { setLoggedIn } from "../authentication.js";
import { navigateTo } from "../index.js";
import { getDefaultHeader } from "../shared.js";
import AbstractView from "./AbstractView.js";

const POST_MFA_LOGIN_API = 'https://transcendence.myprojekt.tech/api/auth/mfalogin'

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Two Factor");
        this.controller = new AbortController();
        document.getElementById('login-button').classList.add('hidden');
    }

    getHtml = async () => {
        return `
        <div id="twoFA-login" class="window">
            <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;" />
                </button>
                <div class="title">2FA - Login</div>
                <a href="/" class="icon-button" data-link>
                    <img class="icon" src="./static/media/home.svg" alt="Home" draggable="false" (dragstart)="false;" />
                </a>
            </div>
            <div class="content">
                <div class="small-text">To login, please enter the 6-digit verification code from your authenticator app:</div>
                <div class="input-segment twoFA-input-style">
                    <input class="twoFA-input" type="text" maxlength="6" pattern="\d{6}" />
                    <button id="verify-button" class="small-button-green">Verify</button>
                </div>
                <div id="error" class="small-text"></div>
            </div>
        </div>
        `;
    }

    sendVerifyCode = async () => {
        if (this.twoFAInput.value.length === 6) {
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
                const data = await response.json();
                if (response.ok) {
                    setLoggedIn(true);
                    navigateTo('/');
                    return
                } else {
                    /* TODO: handle error */
                    this.error.innerHTML = data[0];
                }
            } catch (error) {
                console.error('error', error);
            }
        }
    }

    attachEventListeners = async () => {
        this.handleSendVerifyCode = () => {
            this.sendVerifyCode().catch(error => {
                console.error('error sending verify code:', error);
            });
        }
        this.verifyButton.addEventListener('click', this.handleSendVerifyCode, {
            signal: this.controller.signal
        });

        this.handleSendVerifyCodeOnEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendVerifyCode().catch(error => {
                    console.error('error sending verify code:', error);
                });
            }
        }
        this.twoFAInput.addEventListener('keydown', this.handleSendVerifyCodeOnEnter, {
            signal: this.controller.signal
        })
        this.handleNumerics = () => {
            this.error.innerHTML = '';
            this.twoFAInput.value = this.twoFAInput.value.replace(/[^0-9]/g, '');
        }
        this.twoFAInput.addEventListener('input', this.handleNumerics, {
            signal: this.controller.signal
        });
    }

    afterRender = async () => {
        this.verifyButton = document.getElementById('verify-button');
        this.twoFAInput = document.querySelector('.twoFA-input');
        this.error = document.getElementById('error');
        this.twoFAInput.focus();

        await this.attachEventListeners();

        return () => {
            this.controller.abort();
        }
    }
}