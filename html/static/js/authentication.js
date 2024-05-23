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


export const handleAuthenticationCallback = async () => {
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
                document.getElementById('login-button-field').textContent = getCookie('user');
            } else {
                console.error('Authentication failed:', response.statusText);
            }
        } else {
            console.error('Missing authorization code');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
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
                // maybe change to data.detail
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
            document.getElementById('login-button-field').textContent = 'login with';
            isLoggedIn = false;
            username = null;
            window.location.href('/');
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