const menuButton = document.getElementById('menu-button');
const dropdownMenu = document.getElementById('dropdown-menu');

function toggleMenu() {
    console.log("I was clicked");
    dropdownMenu.classList.toggle('show');
}

menuButton.addEventListener('click', toggleMenu);

document.addEventListener('click', (event) => {
    if (!dropdownMenu.contains(event.target) && !menuButton.contains(event.target)) {
        dropdownMenu.classList.remove('show');
    }
});
