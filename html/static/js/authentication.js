import { getCookie } from "./shared.js";
import AbstractView from "./views/AbstractView.js";

let isLoggedIn = false;
let username = null;

export const getLoggedIn = () => isLoggedIn;
export const setLoggedIn = (bool) => {
    isLoggedIn = bool;
}
export const getUsername = () => username;
export const setUsername = (name) => {
    username = name;
}


const jwtAPI = 'https://transcendence.myprojekt.tech/api/auth/login';
const jwtCallback = 'https://transcendence.myprojekt.tech/api/auth/callback';
const loginAPI = 'https://transcendence.myprojekt.tech/api/auth/loggedin'


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
                document.getElementById('loginButton').textContent = getCookie('user');
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
    const dropdownMenu = document.getElementById('dropdownMenu');
    let userProfile = null;

    const isLoggedIn = await AbstractView.prototype.checkLoginStatus();

    if (isLoggedIn) {
        document.getElementById('loginButton').textContent = getUsername();
        dropdownMenu.classList.toggle('show');
    } else {
        try {
            const response = await fetch(jwtAPI);
            // console.log(response.data);
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

export const checkLoginStatus = async () => {
    try {
        const response = await fetch(loginAPI)
        isLoggedIn = response.ok;

        if (isLoggedIn) {
            username = getCookie('user');
        }
    } catch (error) {
        console.error('error:', error);
    }
};