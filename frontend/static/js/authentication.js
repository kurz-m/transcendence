import AbstractView from "./views/AbstractView.js";

const jwtAPI = 'http://159.223.18.127:8000/api/auth/login/';
const jwtCallback = 'http://159.223.18.127:8000/api/auth/callback';

// const loginButton = document.getElementById('loginButton');
// const dropdownMenu = document.getElementById('dropdownMenu');

// export async function checkLoginStatus() {
//     const tokenCookie = document.cookie.match(/(^|;\s*)your_jwt_cookie_name=([^;]+)/);
//     const jwtToken = tokenCookie ? tokenCookie[2] : null;
    
//     console.log(tokenCookie);
    
//     if (jwtToken) {
//         const decodeToken = 0;
//         loginButton.textContent = decodeToken.username;
//         loginButton.addEventListener('click', toggleMenu);
//     } else {
//         loginButton.textContent = 'Login with 42';
//         dropdownMenu.classList.add('hidden');
        
//         loginButton.addEventListener('click', async (e) => {
//             e.preventDefault();
//             try {
//                 const response = await fetch(jwtAPI);
//                 console.log(response.data);
//                 if (response.ok) {
//                     const data = await response.json();
//                     window.location.href = data.location;
                    
//                     checkLoginStatus();
//                 } else {
//                     console.error('Authentication failed:', response.statusText);
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//         })
//     }
// }

// function toggleMenu() {
//     dropdownMenu.classList.toggle('show');
// }

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

document.addEventListener('DOMContentLoaded', async () => {
    const dropdownButton = document.getElementById('loginButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    let userProfile = null;

    async function updateDropdown() {
        const isLoggedIn = await AbstractView.prototype.checkLoginStatus();

        if (isLoggedIn) {
            if (!userProfile) {
                userProfile = "User Name";
                dropdownButton.textContent = userProfile;
            }
            dropdownButton.addEventListener('click', () => {
                dropdownMenu.classList.toggle('show');
            });
        } else {
            dropdownButton.addEventListener('click', async (e) => {
                console.log("This is the initial call");
                e.preventDefault();
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
            });
        }
    }

    updateDropdown();
});