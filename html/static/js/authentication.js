import { getCookie } from "./shared.js";
import AbstractView from "./views/AbstractView.js";

const jwtAPI = 'https://transcendence.myprojekt.de/api/auth/login/';
const jwtCallback = 'https://transcendence.myprojekt.de/api/auth/callback';
// const loginAPI = 'https://transcendence.myprojekt.de/api/auth/loggedin';

export async function handleAuthenticationCallback() {
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
            if (!response.ok) {
                console.error('Authentication failed:', response.statusText);
            }
        } else {
            console.error('Missing authorization code');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function loginCallback() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    let userProfile = null;

    const isLoggedIn = await AbstractView.prototype.checkLoginStatus();

    if (isLoggedIn) {
        document.getElementById('loginButton').textContent = getCookie('user');
        await updateUserProfile();
        dropdownMenu.classList.toggle('show');
    } else {
        try {
            const response = await fetch(jwtAPI);
            // console.log(response.data);
            if (response.ok) {
                const data = await response.json();
                window.location.href = data.location;

                checkLoginStatus();
            } else {
                console.error('Authentication failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // async function updateUserProfile() {
    //     if (!userProfile) {
    //         try {
    //             const response = await fetch(loginAPI);

    //             if (response.ok) {
    //                 userProfile = await response.json();
    //                 document.getElementById('loginButton').textContent = userProfile.username;
    //             } else {
    //                 console.error('Failed to fetch user profile:', response.status);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching user profile:', error);
    //         }
    //     }
    // }
}