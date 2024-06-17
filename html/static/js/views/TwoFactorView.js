import { setLoggedIn } from "../authentication.js";
import { navigateTo } from "../index.js";
import { getDefaultHeader, toastErrorMessage } from "../shared.js";
import AbstractView from "./AbstractView.js";

const POST_MFA_LOGIN_API = 'https://transcendence.myprojekt.tech/api/auth/mfalogin'

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Two Factor");
        this.controller = new AbortController();
        document.getElementById('login-button').classList.add('make-opaque');
    }

    getHtml = async () => {
        return `
        <div id="twoFA-login" class="window">
            <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <i class="bi bi-caret-left-fill"></i>
                </button>
                <div class="title">2FA - Login</div>
                <a href="/" class="icon-button" (dragstart)="false;" draggable="false" data-link>
                    <i class="bi bi-house-fill"></i>
                </a>
            </div>
            <div class="content">
                <div class="small-text">To login, please enter the 6-digit verification code from your authenticator app:</div>
                <div class="input-segment twoFA-input-style">
                    <input class="twoFA-input" type="text" maxlength="6" pattern="\d{6}" />
                    <button id="verify-button" class="small-button-red">Verify</button>
                </div>
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
                    body: raw,
                    signal: AbortSignal.timeout(5000)
                });
                const data = await response.json();
                if (response.ok) {
                    setLoggedIn(true);
                    navigateTo('/');
                    return
                } else {
                    toastErrorMessage(data.detail);
                }
            } catch (error) {
                if (error.name === 'TimeoutError') {
                    toastErrorMessage('Timeout during sending of 2FA code.');
                }
                // console.error('error', error);
            }
        }
    }

    attachEventListeners = async () => {
        this.handleSendVerifyCode = () => {
            this.sendVerifyCode().catch(error => {
                // console.error('error sending verify code:', error);
            });
            this.twoFAInput.focus();
        }
        this.verifyButton.addEventListener('click', this.handleSendVerifyCode, {
            signal: this.controller.signal
        });

        this.handleSendVerifyCodeOnEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendVerifyCode().catch(error => {
                    // console.error('error sending verify code:', error);
                });
            }
        }
        this.twoFAInput.addEventListener('keydown', this.handleSendVerifyCodeOnEnter, {
            signal: this.controller.signal
        })
        this.handleNumerics = () => {
            this.twoFAInput.value = this.twoFAInput.value.replace(/[^0-9]/g, '');

            const isValid = this.twoFAInput.value.length === 6;

            if (isValid) {
                this.verifyButton.classList.add('small-button-green');
                this.verifyButton.classList.remove('small-button-red');
            } else {    
                this.verifyButton.classList.add('small-button-red');
                this.verifyButton.classList.remove('small-button-green');
            }
        }
        this.twoFAInput.addEventListener('input', this.handleNumerics, {
            signal: this.controller.signal
        });
    }

    afterRender = async () => {
        this.verifyButton = document.getElementById('verify-button');
        this.twoFAInput = document.querySelector('.twoFA-input');
        this.twoFAInput.focus();

        await this.attachEventListeners();

        return () => {
            this.controller.abort();
        }
    }
}