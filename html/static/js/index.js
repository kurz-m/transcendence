import Dashboard from "./views/DashboardView.js";
import Account from "./views/AccountView.js";
import PongGame from "./views/PongGameView.js";
import Friends from "./views/FriendsView.js";
import { checkLoginStatus, getLoggedIn, getUsername, handleAuthenticationCallback, loginCallback, logoutCallback } from "./authentication.js";
import { toggleDropdown, toggleLoginButtonStyle } from "./shared.js";
import PongMenuView from "./views/PongMenuView.js";
import PongSingleView from "./views/PongSingleView.js";
import PongTournamentView from "./views/PongTournamentView.js";
import MatchHistoryView from "./views/MatchHistoryView.js";
import { startPongGame } from "./PongGame.js";

let currentViewCleanup = null;

const router = async () => {
    const routes = [
        { path: "/", view: Dashboard },
        { path: "/friends", view: Friends },
        { path: "/match-history", view: MatchHistoryView },
        { path: "/account", view: Account },
        { path: "/pong-menu", view: PongMenuView },
        { path: "/pong-single", view: PongSingleView },
        { path: "/pong-tournament", view: PongTournamentView },
        { path: "/pong-game", view: PongGame, handler: startPongGame },
        { path: "/callback", handler: handleAuthenticationCallback },
        // { path: "/two-factor", handler: handleTwoFactorCallback },
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

const updateLoginState = () => {
    const loginButton = document.getElementById('login-button');
    const loginButtonText = document.getElementById('login-button-field');
    const profileImage = document.getElementById('small-profile-pic');
    
    if (getLoggedIn()) {
        const profileImageCached = localStorage.getItem('profile_image');
        if (!profileImageCached) {
            profileImage.src = './static/media/fallback-profile.png';
        } else {
            profileImage.src = profileImageCached;
        }
        loginButtonText.textContent = localStorage.getItem('username');
        loginButton.classList.remove('logged-out');
        loginButton.classList.add('logged-in');
        toggleLoginButtonStyle();
    } else {
        loginButtonText.textContent = 'login with';
    }
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