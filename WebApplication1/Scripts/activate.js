// This file has functions which been called when the user wants to activate his new account
// get the user id from the params
let urlParams = new URLSearchParams(window.location.search);
let userEmail = urlParams.get('userEmail');
// ajax call to Users controller with the user unique email
$.ajax({
    url: `../api/Users/activateAccount?userEmail=${userEmail}`,
    type: 'PUT',
}).then(() => {
    // notify the user his account has been activated
    alert("Your account has been activated!")
    // close his tab
    window.close();
}).catch((error) => {
    alert("Something went wrong! please try to click again on the link provided on your email")
    console.log(error);
})