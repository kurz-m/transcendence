import AbstractView from "./views/AbstractView.js";
import Dashboard from "./views/Dashboard.js";
import Account from "./views/Account.js";
import Pong from "./views/Pong.js";
import Friends from "./views/Friends.js";
import { checkLoginStatus, getLoggedIn, getUsername, handleAuthenticationCallback, loginCallback } from "./authentication.js";

export const navigateTo = url => {
    history.pushState(null, null, url);
    router();
}

const router = async () => {
    const routes = [
        { path: "/", view: Dashboard },
        { path: "/account", view: Account },
        { path: "/pong", view: Pong },
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
}

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", async () => {

    const loginButton = document.getElementById('loginButton');
    await checkLoginStatus();
    if (getLoggedIn()) {
        loginButton.textContent = getUsername();
    } else {
        loginButton.textContent = 'Login with 42';
    }

    loginButton.addEventListener('click', loginCallback);
    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    router();
})
