import { navigateTo } from "./index.js";
import { getCookie, getDefaultHeader, getPlayerData, getUserCache, toggleDropdown, toggleLoginButtonStyle } from "./shared.js";

let isLoggedIn = false;

export const getLoggedIn = () => {
    return sessionStorage.getItem('logged_in') === 'true';
}
export const setLoggedIn = bool => {
    sessionStorage.setItem('logged_in', bool.toString());
}
export const getUsername = () => localStorage.getItem('username');
export const setUsername = name => {
    localStorage.setItem('username', name);
}


const LOGIN_API = 'https://transcendence.myprojekt.tech/api/auth/login';
const JWT_CALLBACK_API = 'https://transcendence.myprojekt.tech/api/auth/callback';
const CHECK_LOGIN_STATUS_API = 'https://transcendence.myprojekt.tech/api/auth/loggedin'
const LOGOUT_API = 'https://transcendence.myprojekt.tech/api/auth/logout';

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
                headers: getDefaultHeader()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.two_factor === 'true') {
                    const params = new URLSearchParams();
                    params.append('user_id', data.user_id);
                    params.append('oauth_token', data.oauth_token);
                    navigateTo(`/two-factor?${params.toString()}`);
                    return;
                } else {
                    setLoggedIn(true);
                    loginButton.classList.remove('logged-out');
                    loginButton.classList.add('logged-in');
                    toggleLoginButtonStyle();
                    loginButtonField.textContent = getCookie('user');
                    localStorage.setItem('profile_image', data.profile_image_url);
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
    await getPlayerData();
    const cache = await getUserCache();
    if (!cache) {
        profileImage.src = './static/media/fallback-profile.png';
    } else {
        profileImage.src = cache.data.profile_img_url;
    }
    setUsername(getCookie('user'));
    navigateTo('/');
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
            toggleLoginButtonStyle(true);
            toggleDropdown();
            loginButtonField.textContent = 'login with';
            loginButton.classList.add('logged-out');
            loginButton.classList.remove('logged-in');
            localStorage.removeItem('player_data');
            localStorage.removeItem('username');
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
        setLoggedIn(response.ok);

        if (getLoggedIn()) {
            setUsername(getCookie('user'));
        }
    } catch (error) {
        setLoggedIn(false);
    }
};
