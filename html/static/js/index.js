import Dashboard from "./views/DashboardView.js";
import Account from "./views/AccountView.js";
import PongGame from "./views/PongGameView.js";
import Friends from "./views/FriendsView.js";
import { checkLoginStatus, getLoggedIn, getUsername, handleAuthenticationCallback, loginCallback, logoutCallback } from "./authentication.js";
import { toggleLoginButtonStyle } from "./shared.js";
import { pongGame } from "./pong.js";

export const navigateTo = url => {
    history.pushState(null, null, url);
    router();
}

const router = async () => {
    const routes = [
        { path: "/", view: Dashboard },
        { path: "/account", view: Account },
        { path: "/pong", view: PongGame, handler: pongGame },
        { path: "/friends", view: Friends },
        { path: "/callback", handler: handleAuthenticationCallback },
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (match.route.path === "/callback") {
        await handleAuthenticationCallback();
        navigateTo('/');
        return;
    }

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    const view = new match.route.view();

    document.querySelector("#app").innerHTML = await view.getHtml();

    if (match.route.path === '/pong') {
        pongGame();
    }
}

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById('login-button');
    const loginButtonText = document.getElementById('login-button-field');
    const logoutButton = document.getElementById('logout-button');

    await checkLoginStatus();
    if (getLoggedIn()) {
        loginButtonText.textContent = getUsername();
        loginButton.classList.remove('logged-out');
        loginButton.classList.add('logged-in');
        toggleLoginButtonStyle();
    } else {
        loginButtonText.textContent = 'login with';
    }

    loginButton.addEventListener('click', loginCallback);
    logoutButton.addEventListener('click', logoutCallback);

    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    router();
})
