import { navigateTo } from "./index.js";
import { getCookie, toggleDropdown, toggleLoginButtonStyle } from "./shared.js";

let isLoggedIn = false;
let username = null;

export const getLoggedIn = () => isLoggedIn;
export const setLoggedIn = bool => {
    isLoggedIn = bool;
}
export const getUsername = () => username;
export const setUsername = name => {
    username = name;
}


const loginAPI = 'https://transcendence.myprojekt.tech/api/auth/login';
const jwtCallback = 'https://transcendence.myprojekt.tech/api/auth/callback';
const checkLoginStatusAPI = 'https://transcendence.myprojekt.tech/api/auth/loggedin'
const logoutAPI = 'https://transcendence.myprojekt.tech/api/auth/logout';

const loginButton = document.getElementById('login-button');
const loginButtonField = document.getElementById('login-button-field');

export const handleAuthenticationCallback = async () => {
    const profileImage = document.getElementById('small-profile-pic');
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code')) {
            const callbackURI = `${jwtCallback}?${urlParams.toString()}`;
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
    navigateTo('/');
}

export const loginCallback = async () => {
    if (getLoggedIn()) {
        toggleDropdown();
    } else {
        try {
            const response = await fetch(loginAPI, {
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
        const response = await fetch(logoutAPI, {
            method: 'POST',
        });

        if (response.ok) {
            toggleLoginButtonStyle();
            toggleDropdown();
            loginButtonField.textContent = 'login with';
            loginButton.classList.add('logged-out');
            loginButton.classList.remove('logged-in');
            isLoggedIn = false;
            username = null;
        } else {
            console.error('Could not logout the user');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

export const checkLoginStatus = async () => {
    try {
        const response = await fetch(checkLoginStatusAPI)
        isLoggedIn = response.ok;

        if (isLoggedIn) {
            username = getCookie('user');
        }
    } catch (error) {
        console.error('error:', error);
    }
};
