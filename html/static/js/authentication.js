import { navigateTo } from "./index.js";
import { getCookie, getDefaultHeader, toggleDropdown, toggleLoginButtonStyle } from "./shared.js";

let isLoggedIn = false;

export const getLoggedIn = () => isLoggedIn;
export const setLoggedIn = bool => {
    isLoggedIn = bool;
}
export const getUsername = () => localStorage.getItem('username');
export const setUsername = name => {
    localStorage.setItem('username', name);
}


const LOGIN_API = 'https://transcendence.myprojekt.tech/api/auth/login';
const JWT_CALLBACK_API = 'https://transcendence.myprojekt.tech/api/auth/callback';
const CHECK_LOGIN_STATUS_API = 'https://transcendence.myprojekt.tech/api/auth/loggedin'
const LOGOUT_API = 'https://transcendence.myprojekt.tech/api/auth/logout';
const PLAYER_DATA_API = 'https://transcendence.myprojekt.tech/api/player';

const CACHE_KEY = 'player_data'

const loginButton = document.getElementById('login-button');
const loginButtonField = document.getElementById('login-button-field');

export const handleAuthenticationCallback = async () => {
    const profileImage = document.getElementById('small-profile-pic');
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code')) {
            const callbackURI = `${JWT_CALLBACK_API}?${urlParams.toString()}`;
            const response = await fetch(callbackURI, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                isLoggedIn = true;
                loginButton.classList.remove('logged-out');
                loginButton.classList.add('logged-in');
                toggleLoginButtonStyle();
                loginButtonField.textContent = getCookie('user');
                localStorage.setItem('profile_image', data.profile_image_url);

                if (!data.profile_image_url) {
                    profileImage.src = './static/media/fallback-profile.png';
                } else {
                    profileImage.src = data.profile_image_url;
                }
            } else {
                console.error('Authentication failed:', response.statusText);
            }
        } else {
            console.error('Missing authorization code');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    try {
        const response = await fetch(PLAYER_DATA_API, {
            method: 'GET',
            headers: getDefaultHeader()
        });
    
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            const { user, profile_image_uri, two_factor } = data.results[0];
            const extractedData = { user, profile_img_url, two_factor };
            updateCache(CACHE_KEY, extractedData);
        }
    } catch (error) {
        console.error('error', error);
    }
    setUsername(getCookie('user'));
    navigateTo('/');
}

const updateCache = (cacheKey, data) => {
    localStorage.setItem(cacheKey, JSON.stringify({
        data: data,
        timestamp: Date.now()
    }));
}

export const loginCallback = async () => {
    if (getLoggedIn()) {
        toggleDropdown();
    } else {
        try {
            const response = await fetch(LOGIN_API, {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                window.location.href = data.location;
            } else {
                console.error('Authentication failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }

    }
}

export const logoutCallback = async () => {
    try {
        const response = await fetch(LOGOUT_API, {
            method: 'POST',
        });
        
        if (response.ok) {
            toggleLoginButtonStyle();
            toggleDropdown();
            loginButtonField.textContent = 'login with';
            loginButton.classList.add('logged-out');
            loginButton.classList.remove('logged-in');
            localStorage.removeItem('username');
            localStorage.removeItem('profile_image');
            setLoggedIn(false);
        } else {
            console.error('Could not logout the user');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
    navigateTo('/');
}

export const checkLoginStatus = async () => {
    try {
        const response = await fetch(CHECK_LOGIN_STATUS_API)
        isLoggedIn = response.ok;
        
        if (isLoggedIn) {
            setUsername(getCookie('user'));
        }
    } catch (error) {
        isLoggedIn = false;
    }
};
