import { getLoggedIn } from "./authentication.js";

const PLAYER_DATA_API = 'https://transcendence.myprojekt.tech/api/player';
const CACHE_KEY = 'player_data'

let navbarToggle = false;

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    return parts.length === 2 ? parts.pop().split(';').shift() : null;
};

export const toggleDropdown = () => {
    const dropdownID = document.getElementById('account-dropdown-id');
    const loginButton = document.getElementById('login-button');
    const dropdownContent = document.getElementById('dropdown-content-id');

    dropdownContent.classList.toggle('show');
    dropdownID.classList.toggle('show');
    loginButton.classList.toggle('logged-in');
    loginButton.classList.toggle('profile-button');
};

export const toggleLoginButtonStyle = (logout) => {
    if (!navbarToggle || logout) {
        navbarToggle = true;
        const profilePicture = document.getElementById('small-profile-pic');
        const loginIcon = document.getElementById('login-icon-id');
        profilePicture.classList.toggle('show');
        loginIcon.classList.toggle('hidden');
    }
}

export const getDefaultHeader = () => {
    let header = new Headers();
    header.append('Content-Type', 'application/json');
    header.append('Date', new Date().toUTCString());
    header.append('User-Agent', 'Transcendence Pong Game Website');

    return header;
}

export const updateLoginState = () => {
    const loginButton = document.getElementById('login-button');
    const loginButtonText = document.getElementById('login-button-field');
    const profileImage = document.getElementById('small-profile-pic');

    if (getLoggedIn()) {
        const cache = JSON.parse(localStorage.getItem('player_data'));
        if (!cache.data.profile_img_url) {
            profileImage.src = './static/media/fallback-profile.png';
        } else {
            profileImage.src = cache.data.profile_img_url;
        }
        loginButtonText.textContent = localStorage.getItem('username');
        loginButton.classList.remove('logged-out');
        loginButton.classList.add('logged-in');
        toggleLoginButtonStyle();
    }
}

export const getUserCache = async () => {
    const data = localStorage.getItem('player_data');
    return JSON.parse(data);
}

export const updateCache = (cacheKey, data) => {
    localStorage.setItem(cacheKey, JSON.stringify({
        data: data,
        timestamp: Date.now()
    }));
}

export const getPlayerData = async () => {
    try {
        const response = await fetch(PLAYER_DATA_API, {
            method: 'GET',
            headers: getDefaultHeader(),
            signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
            const data = await response.json();
            const { user, profile_img_url, two_factor } = data.results[0];
            const extractedData = { user, profile_img_url, two_factor };
            updateCache(CACHE_KEY, extractedData);
        }
    } catch (error) {
        console.error('error', error);
    }
}

export const toastErrorMessage = (msg) => {
    let toastBox = document.getElementById('toastBox');
    let toast = document.createElement('div');
    toast.classList.add('toast');
    toast.classList.add('toast-warning');
    toast.classList.add('error');
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi-exclamation-triangle-fill" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
        </svg>
        ${msg}
    `;
    toastBox.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 6000);
}