export const getCookie = (name) => {
    const value = `; ${document.cookie}`; 
    const parts = value.split(`; ${name}=`);
  
    return parts.length === 2 ? parts.pop().split(';').shift() : null; 
};

export const toggleDropdown = () => {
    const dropdownID = document.getElementById('account-dropdown-id');
    const loginButton = document.getElementById('login-button');

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