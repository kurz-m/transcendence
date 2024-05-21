import AbstractView from "./views/AbstractView.js";

const jwtAPI = 'http://159.223.18.127:8000/api/auth/login/';
const jwtCallback = 'http://159.223.18.127:8000/api/auth/callback';

export async function handleAuthenticationCallback() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code')) {
            const callbackURI = jwtCallback + urlParams;
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
        await updateUserProfile();
        dropdownMenu.classList.toggle('show');
    } else {
        try {
            const response = await fetch(jwtAPI);
            console.log(response.data);
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

    async function updateUserProfile() {
        if (!userProfile) {
            try {
                const response = await fetch('api/player/whateverid', {
                    headers: {
                        'Authorization': `Bearer ${document.cookie.match(/(^|;\s*)access_token=([^;]+)/)[2]}`
                    }
                });

                if (response.ok) {
                    userProfile = await response.json();
                    document.getElementById('loginButton').textContent = userProfile.username;
                } else {
                    console.error('Failed to fetch user profile:', response.status);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        }
    }
}

// document.addEventListener('DOMContentLoaded', async () => {
//
//     async function updateDropdown() {
//
//         if (isLoggedIn) {
//             if (!userProfile) {
//                 userProfile = "User Name";
//                 dropdownButton.textContent = userProfile;
//             }
//             dropdownButton.addEventListener('click', () => {
//             });
//         } else {
//             dropdownButton.addEventListener('click', async (e) => {
//                 console.log("This is the initial call");
//                 e.preventDefault();
//             });
//         }
//     }
//
//     updateDropdown();
// });
