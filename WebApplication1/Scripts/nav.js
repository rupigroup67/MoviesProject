const loadVars = () => {
    // Vars:
    profilePicture = document.querySelector('#profile-picture');
    profileDropDown = document.querySelector('#profile-dropdown');
    profile = document.querySelector('#profile');

    // Event Listeners:
    profilePicture.addEventListener('click', toggleLinks);
}
const toggleLinks = () => {
    profileDropDown.classList.toggle('active');
}

