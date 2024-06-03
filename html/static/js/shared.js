export const getCookie = (name) => {
    const value = `; ${document.cookie}`; 
    const parts = value.split(`; ${name}=`);
  
    return parts.length === 2 ? parts.pop().split(';').shift() : null; 
};

export const toggleDropdown = () => {
    const dropdownID = document.getElementById('account-dropdown-id');
    const loginButton = document.getElementById('login-button');
    const dropdownContent = document.getElementById('dropdown-content-id');

    dropdownContent.classList.toggle('show');
    dropdownID.classList.toggle('show');
    loginButton.classList.toggle('logged-in');
    loginButton.classList.toggle('profile-button');
};

export const toggleLoginButtonStyle = () => {
    const profilePicture = document.getElementById('small-profile-pic');
    const loginIcon = document.getElementById('login-icon-id');

    profilePicture.classList.toggle('show');
    loginIcon.classList.toggle('hidden');
}

export const hideGamePauseMenu = () => {
    const pauseMenu = document.getElementById('pause-window');
    pauseMenu.classList.add("hidden");
}

export const showGamePauseMenu = () => {
    const pauseMenu = document.getElementById('pause-window');
    pauseMenu.classList.remove("hidden");
}

export const getDefaultHeader = () => {
    let header = new Headers();
    header.append('Content-Type', 'application/json');
    header.append('Date', new Date().toUTCString());
    header.append('User-Agent', 'Transcendence Pong Game Website');

    return header;
}
