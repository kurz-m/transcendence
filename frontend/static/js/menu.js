// import { navigateTo } from './index.js';
const jwtAPI = 'http://10.11.1.26:8000/api/auth/login';

const loginButton = document.getElementById('loginButton');
const dropdownMenu = document.getElementById('dropdownMenu');
// const menuButton = document.getElementById('menu-button');

async function checkLoginStatus() {
    const tokenCookie = document.cookie.match(/(^|;\s*)your_jwt_cookie_name=([^;]+)/);
    const jwtToken = tokenCookie ? tokenCookie[2] : null;

    console.log(tokenCookie);

    if (jwtToken) {
        const decodeToken = 0;
        loginButton.textContent = decodeToken.username;
        loginButton.addEventListener('click', toggleMenu);
    } else {
        loginButton.textContent = 'Login with 42';
        dropdownMenu.classList.add('hidden');

        loginButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(jwtAPI);
                if (response.ok) {
                    const data = await response.json();

                    checkLoginStatus();
                } else {
                    console.error('Authentication failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        })
    }
}

function toggleMenu() {
    dropdownMenu.classList.toggle('show');
}

checkLoginStatus();