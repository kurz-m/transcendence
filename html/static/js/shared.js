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
            headers: getDefaultHeader()
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