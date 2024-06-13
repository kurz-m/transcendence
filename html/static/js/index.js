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
import ErrorView from "./views/ErrorView.js";
import TwoFactorView from "./views/TwoFactorView.js";

let currentViewCleanup = null;
let isOnline = navigator.onLine;
let reloadIconTimeout;

setInterval(() => {
    const newStatus = navigator.onLine;
    if (newStatus !== isOnline) {
        let toastBox = document.getElementById('toastBox');
        isOnline = newStatus;
        if (!isOnline) {
            /* TODO: show popup when offline */
            let toast = document.createElement('div');
            toast.classList.add('toast');
            toast.classList.add('toast-warning');
            toast.classList.add('error');
            toast.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                </svg>
                Oops! Looks like you are offline.<br />Reconnect for full functionality.
            `;
            toastBox.appendChild(toast);
            setTimeout(() => {
                toast.remove();
            }, 6000);
        } else {
            let toast = document.createElement('div');
            toast.classList.add('toast');
            toast.classList.add('toast-success');
            toast.classList.add('success');
            toast.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                Back online! Don't Panic.
            `;
            toastBox.appendChild(toast);
            setTimeout(() => {
                toast.remove();
            }, 6000);
            clearTimeout(reloadIconTimeout);
            reloadIconTimeout = setTimeout(() => {
                const bootstrapIconsLink = document.querySelector('link[href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"]');
                if (bootstrapIconsLink) {
                  const newLink = bootstrapIconsLink.cloneNode();
                  bootstrapIconsLink.parentNode.replaceChild(newLink, bootstrapIconsLink);
                }
            }, 1000);
        }
    }
}, 5000);

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
        navigateTo('/error?statuscode=404');
        return;
    }

    if (match.route.public === false && !getLoggedIn()) {
        navigateTo('/error?statuscode=403');
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
    const loader = document.querySelector('.loader');

    setTimeout(() => {
        loader.classList.add('loader-hidden');
    }, 500);
    /* Used of offline handling of the website */
    if (navigator.onLine) {
        handleNavBar();
        await checkLoginStatus();
        updateLoginState();
    }

    document.body.addEventListener('click', e => {
        const link = e.target.closest('[data-link]');
        if (link) {
            e.preventDefault();
            navigateTo(link.href);
        }
    });

    router();
})