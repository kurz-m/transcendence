import Dashboard from "./views/DashboardView.js";
import Account from "./views/AccountView.js";
import PongGame from "./views/PongGameView.js";
import { checkLoginStatus, getLoggedIn, handleAuthenticationCallback, loginCallback, logoutCallback } from "./authentication.js";
import { toggleDropdown, toggleLoginButtonStyle, updateLoginState } from "./shared.js";
import PongMenuView from "./views/PongMenuView.js";
import PongSingleView from "./views/PongSingleView.js";
import PongTournamentView from "./views/PongTournamentView.js";
import MatchHistoryView from "./views/MatchHistoryView.js";
import { startPongGame } from "./PongGame.js";
import { startTournament } from "./Tournament.js";
import TestView from "./views/TestView.js";
import ErrorView from "./views/ErrorView.js";
import TwoFactorView from "./views/TwoFactorView.js";

let currentViewCleanup = null;

const router = async () => {
    const routes = [
        { path: "/", view: Dashboard, public: true },
        { path: "/match-history", view: MatchHistoryView, public: false },
        { path: "/account", view: Account, public: false },
        { path: "/pong-menu", view: PongMenuView, public: true },
        { path: "/pong-single", view: PongSingleView, public: true },
        { path: "/pong-tournament", view: PongTournamentView, handler: startTournament, public: true },
        { path: "/pong-game", view: PongGame, handler: startPongGame, public: true },
        { path: "/callback", handler: handleAuthenticationCallback, public: true },
        { path: "/test", view: TestView, public: false },
        { path: "/error", view: ErrorView, public: true },
        { path: "/two-factor", view: TwoFactorView, public: true },
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    if (match.route.public === false && !getLoggedIn()) {
        navigateTo('/');
        return;
    }

    if (match.route.view) {
        if (currentViewCleanup) {
            currentViewCleanup();
            currentViewCleanup = null;
        }

        const view = new match.route.view();
        document.querySelector("#app").innerHTML = await view.getHtml();

        if (view.afterRender) {
            currentViewCleanup = await view.afterRender();
        }
    }
    if (match.route.handler) {
        match.route.handler();
    }
}

export const navigateTo = url => {
    history.pushState(null, null, url);
    router();
}



const handleNavBar = () => {
    const loginButton = document.getElementById('login-button');
    const dropdownId = document.getElementById('account-dropdown-id');

    dropdownId.addEventListener('click', e => {
        const target = e.target;

        if (target.closest('#login-button')) {
            e.stopPropagation();
            loginCallback();
        } else if (target.id === 'logout-button') {
            e.stopPropagation();
            logoutCallback();
        }
    });

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (loginButton.classList.contains('profile-button') && target != loginButton) {
            toggleDropdown();
        }
    });
}

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", async () => {
    handleNavBar();
    await checkLoginStatus();
    updateLoginState();

    document.body.addEventListener('click', e => {
        const link = e.target.closest('[data-link]');
        if (link) {
            e.preventDefault();
            navigateTo(link.href);
        }
    });

    router();
})

window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');

    setTimeout(() => {
        loader.classList.add('loader-hidden');
    }, 500);
})
