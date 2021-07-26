let currentUser = -1;
$(document).ready(function () {
    // nav bar links
    if (!localStorage.loggedUser) {
        $("#links").show();
        $('#profile').hide();
    }
    else {
        user = JSON.parse(localStorage.loggedUser)
        if (user.Type == 1 && window.location.pathname.split("/").pop() != 'adminpanel.html')
            window.location.href = 'adminpanel.html';
        SetProfilePicture("#profile-picture", user.Id)
        $("#links").hide();
        $("#profile").show();
    }
    flag = true;
});

// toggleModal simply calls the loadloginform and loadsignupform depends on the situation
const ToggleModal = (form) => {
    let modal = document.querySelector('#login-signup-modal');
    let body = document.querySelector('#body');
    if (form === 'close') {
        modal.classList.toggle('active');
        body.classList.toggle('active');
        return;
    }
    // if the modal is already on:
    if (modal.classList.contains('active')) {
        // if the same button was clicked:
        if (modal.children[0].id === 'signupPopup' && form === 'signup' ||
            modal.children[0].id === 'loginPopup' && form === 'login') {
            modal.classList.toggle('active');
            body.classList.toggle('active');
            return;
        }
        // otherwise, switch to the other form:
        else {
            SwitchFormTo(form);
            return;
        }
    }
    // if modal was not even activated:
    modal.classList.toggle('active');
    body.classList.toggle('active');
    form === 'login' ? LoadLoginForm(modal) : LoadSignupForm(modal);
}

// LoadLoginForm shows the login form on the users screen as popup
const LoadLoginForm = (modal, email = '') => {
    modal.innerHTML = `
    <div id="loginPopup" class="container modal">
        <div class="box">
            <div id="login">
                <form id="loginForm">
                    <p class="closePopUp" onclick="ToggleModal('close')">&times</p>
                    <h1>Login</h1>
                    <div id="emailPasswordInput">
                        <input type="text" id="loginEmailTB" placeholder="Email" required>
                        <input type="password" id="loginPasswordTB" placeholder="Password">
                    </div>
                    <h5 onclick="SwitchFormTo('signup', $('#loginEmailTB').val())">New Member?</h2>
                    <input id="emailSubmit" type="submit" value="Check Email" />
                </form>
            </div>
        </div>
    </div>`
    if(email) $('#loginEmailTB').val(email);
    $("#loginForm").submit(SubmitLogin);
    $("#loginPasswordTB").hide();
}

// LoadSignupForm shows the signup form on the users screen as popup
const LoadSignupForm = (modal, email = '') => {
    modal.innerHTML =
        `<div id="signupPopup" class="container modal">
        <div class="box">
        <form id="signupForm">
        <p class="closePopUp" onclick="ToggleModal('close')">&times</p>
        <h1>Sign Up</h1>
        <div id="loader"></div>
        <p hidden id="please-wait">Please Wait...</p>
                <div class="fullName">
                    <input type="text" placeholder="First Name" id="firstTB" required>
                    <input type="text" id="lastTB" placeholder="Last Name" required>
                </div>
                <div>
                    <select name="Gender" class="genderSelect" required>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="transgender">Transgender</option>
                        <option value="two-spirit">Two-Spirit</option>
                        <option value="non-binary">Non-Binary</option>
                        <option value="genderqueer">Genderqueer</option>
                        <option value="gender-expression">Gender Expression</option>
                        <option value="gender-fluid">Gender Fluid</option>
                        <option value="gender-neutral">Gender Neutral</option>
                        <option value="other">Other...</option>
                    </select>
                    <div class="asterisk"></div>
                </div>
                <div>
                    <input class="required" "type="text" id="emailTB" pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                        placeholder="example@example.com" required>
                </div>
                <div>
                    <input type="password" id="passwordTB" pattern=".{8,}" placeholder="Password" required>
                </div>
                <div id="confirmPassword">
                    <input type="password" name="confirm_password" id="confirm_password" required
                        placeholder="Confrim Password" />
                    <span id='message'></span>
                </div>
                <div>
                    <input type="tel" id="phoneTB" pattern="[0][5][0-9]{8}" placeholder="Phone Number" required>
                </div>
                <div>
                    <input type="date" id="dobTB" placeholder="Day/Month/Year birth-date" required min="1950-01-01"
                        max="2009-01-01">
                </div>
                <div>
                    <input type="text" id="search_input" placeholder="Address" required>
                    <input type="hidden" id="loc_lat" />
                    <input type="hidden" id="loc_long" />
                </div>
                <div>
                    <select name="Genre" class="genreSelect">
                        <option value="">Select Genre</option>
                        <option value="action">Action</option>
                        <option value="comedy">Comedy</option>
                        <option value="fairytales">Fairytales</option>
                        <option value="mystery">Mystery</option>
                        <option value="science fiction">Science Fiction</option>
                        <option value="horror">Horror</option>
                        <option value="thriller">Thriller</option>
                        <option value="other">Other...</option>
                    </select>
                </div>
                <div class="profile-img">
                <p>Add Profile Picture</p>
                <img data-upload="0" id="uploadImg" src="https://image.flaticon.com/icons/png/512/3514/3514917.png" alt="">
                <img id="uploadCheckMark" src="https://img.icons8.com/flat-round/64/000000/checkmark.png"/>
                <div class="progress-container">
                     <div class="progress"></div>
                </div>
                </div>
                <input id="submitBTN" type="submit" value="Submit" />
                <h5 onclick="SwitchFormTo('login', $('#emailTB').val() )">Already A Member?</h5>
            </form>
        </div>
    </div>`;
    if(email) $('#emailTB').val(email);
    // // google maps auto completion
    // var autocomplete;
    // autocomplete = new google.maps.places.Autocomplete((document.getElementById("search_input")), {
    //     types: ['geocode'],
    // });
    // google.maps.event.addListener(autocomplete, 'place_changed', function () {
    //     var near_place = autocomplete.getPlace();
    //     document.getElementById('loc_lat').value = near_place.geometry.location.lat();
    //     document.getElementById('loc_long').value = near_place.geometry.location.lng();
    // });
    // make sure the two password inputs are the same and correct
    $('#passwordTB, #confirm_password').on('keyup', function () {
        if ($('#passwordTB').val() == $('#confirm_password').val()) {
            $('#message').html('');
            document.getElementById("confirm_password").setCustomValidity("");
        } else {
            $('#message').html('Passwords do not match');
            document.getElementById("confirm_password").setCustomValidity("Passwords Don't Match");
        }
    });
    addEventListeners()
    // submit the sign-up form
    $("#signupForm").submit(SubmitSignup);
}

// init all event listeners
const addEventListeners = () => {
    document.getElementById("uploadImg").onclick = function (e) {
        let input = document.createElement('input');
        input.type = 'file';

        input.onchange = e => {
            files = e.target.files;
            reader = new FileReader();
            // reader.onload = function () {
            // }
            console.log(files[0]);
            if ((files[0].type == "image/png" || files[0].type == 'image/jpg' || files[0].type == 'image/jpeg') && files[0].size < 500000) {
                document.getElementById("uploadImg").setAttribute("data-upload", "1")
                $("#uploadCheckMark").show()
                reader.readAsDataURL(files[0]);
            }
            else{
                alert("Please upload image with type of png / jpg / jpeg and the size of it is less than 0.5MB")
                reader = new FileReader();
            }
        }
        input.click();
    }
    // event listener for password field
    document.querySelector('#passwordTB').oninvalid = (event) => {
        event.target.setCustomValidity('');
        if (!event.target.validity.valid) {
            event.target.setCustomValidity('This field has to match the format: at least 8 caracters');
        }
    }
    document.querySelector('#passwordTB').oninput = (event) => {
        event.target.setCustomValidity('');
    }
    // event listener for email field
    document.querySelector('#emailTB').oninvalid = (event) => {
        event.target.setCustomValidity('');
        if (!event.target.validity.valid) {
            event.target.setCustomValidity('This field has to match the format: example@example.com');
        }
    }
    document.querySelector('#emailTB').oninput = (event) => {
        event.target.setCustomValidity('');
    }
    // event listener for phone number field
    document.querySelector('#phoneTB').oninvalid = (event) => {
        event.target.setCustomValidity('');
        if (!event.target.validity.valid) {
            event.target.setCustomValidity('This field has to match the format: 05XXXXXXXX');
        }
    }
    document.querySelector('#phoneTB').oninput = (event) => {
        event.target.setCustomValidity('');
    }
}

// swtichFormTo simply transfers information from login to signup as convenient purposes
const SwitchFormTo = (to, email = '') => {
    let modal = document.querySelector('#login-signup-modal');
    if (to === 'login') LoadLoginForm(modal, email);
    else LoadSignupForm(modal, email);
}

// CheckEmail checks if the user wrote a existing email address
function CheckEmail() {
    ajaxCall("GET", "../api/Users?email=" + $("#loginEmailTB").val(), "", CheckEmailSuccessCB, CheckEmailErrorCB);
}

// CheckEmailSuccessCB displays form to the user to login
function CheckEmailSuccessCB(index) {
    $("#loginPasswordTB").show();
    $("#loginPasswordTB").prop('required', true);
    $("#loginPasswordTB").css('transform', 'translateY(0px)');
    $("#loginPasswordTB").css('opacity', '1');
    $("#emailSubmit").val('Log in');
    currentUserIndex = index;
}

// CheckEmailErrorCB called when the user enters wrong email address
function CheckEmailErrorCB(err) {
    alert(`Wrong Email, Check your logging information!`);
    console.log(err)
}

// LoginUser function called when the user try to login with his email address and password
// the function creates an ajax call to the backend API, and checks the password 
function LoginUser(email, password) {
    ajaxCall("GET", `../api/Users?email=${email}&password=${password}`, "", LoginUserSuccessCB, LoginUserErrorCB);
}

// LoginUserSUccessCB been called from LoginUser when the users has filled the login information correctly
function LoginUserSuccessCB(data) {
    localStorage.setItem('loggedUser', JSON.stringify(data));
    location.reload();
}

// LoginUserErrorCB been called when either the user filled wrong password / the account hasn't been fully activated!
// it alerts to the user the situation so he knows what he did wrong
function LoginUserErrorCB(err) {
    alert(err.responseJSON);
    console.log(err)
}

// SubmitLogin return False to the UA and continues
function SubmitLogin() {
    if ($("#emailSubmit").val() === 'Check Email') {
        CheckEmail();
    } else if ($("#emailSubmit").val() === 'Log in') {
        LoginUser($("#loginEmailTB").val(), $("#loginPasswordTB").val());
    }
    return false;
}

// logs out the user from the website -> cleans the localstorage and refresh
const Logout = () => {
    localStorage.removeItem("loggedUser");
    location.reload();
}

// add user to the DB, creates Ajax call to the backend API with the new user object
function AddUser() {
    let user = {
        id: -1,
        name: $("#firstTB").val().trim(),
        surname: $("#lastTB").val().trim(),
        email: $("#emailTB").val().trim(),
        password: $("#passwordTB").val(),
        phoneNumber: $("#phoneTB").val(),
        gender: $(".genderSelect").val(),
        dateOfBirth: $("#dobTB").val(),
        genre: $(".genreSelect").val(),
        address: $("#search_input").val().trim(),
    }
    ajaxCall("POST", "../api/Users", JSON.stringify(user), AddUserSuccessCB, AddUserErrorCB);
}

const AddUserSuccessCB = async (newUserId) => {
    // here we need to send the img to the firebase
    // then call the login user method as below!
    let myPromise = new Promise(function (myResolve, myReject) {
        if (document.getElementById("uploadImg").getAttribute("data-upload") == "1")
            uploadImg(newUserId, myResolve, myReject, true);
        else {
            uploadImg(newUserId, myResolve, myReject, true, false);
        }
    });

    myPromise.then(
        function () {
            // LoginUser($("#emailTB").val(), $("#passwordTB").val());
            // tell the user to check his email and confirm his account!
            alert("We have sent an email with a confirmation link to your email address. In order to complete the sign-up process, please click the confirmation link.")
            // then refresh the current website 
            location.href = 'homepage.html';
        },
        function (error) { alert(error) }
    );
}

// hides the wait animation and asks the user to fill again the fields and try again
function AddUserErrorCB(err) {
    document.getElementById("submitBTN").disabled = false;
    hideLoadingAnimation();
    alert(err.responseJSON)
}

// SubmitSignup return False to the UA and continues
function SubmitSignup() {
    document.getElementById("submitBTN").disabled = true;
    showLoadingAnimation();
    AddUser();
    return false;
}

// changeProgress used for UX, when the user signup and upload his own profile picture
const changeProgress = (progress) => {
    document.querySelector(".progress").style.width = `${progress}%`;
}

// showLoadingAnimation - easy as it sounds (show animation when the user try to signup)
const showLoadingAnimation = () =>{
    // hide all inputs
    $("#signupForm").children().hide(); 
    //show the animation
    $("#loader").show()
    $("#please-wait").show()
}

// hideLoadingAnimation hides the animation in case the user filled something wrong!
const hideLoadingAnimation = () =>{
    // hide animation
    // show the inputs
    $("#signupForm").children().show(); 
    $("#loader").hide()
    $("#please-wait").hide()
}


