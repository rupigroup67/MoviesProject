// ----- Local Vars ----- \\
let ImageName;
let files = [];
let reader;
let defaultProfilePic = "https://firebasestorage.googleapis.com/v0/b/moviesproject-d0e3c.appspot.com/o/ProfileImages%2FdefaultProfilePic.png?alt=media&token=d2772310-c741-48f0-ad28-8bfdf7b61656";

// ----- Functions ----- \\
// uploadImg function been called when new user signup and wants to upload a profile picture 

const uploadImg = async (userId = user.Id, myResolve, myReject, flag = false, hasUploadedImg = true) => {
    // first check if the file type is correct, then check if the size is less than half MB
    if (hasUploadedImg && (files[0].type == "image/png" || files[0].type == 'image/jpg' || files[0].type == 'image/jpeg') && files[0].size < 500000) {
        let uploadTask = firebase.storage().ref('ProfileImages/' + userId + '.png').put(files[0]);
        document.querySelector(".progress-container").style.display = 'block';
        document.querySelector("#uploadCheckMark").style.display = 'none';
        document.querySelector("#uploadImg").style.display = 'none';
        document.querySelector(".profile-img").style.flexDirection = "column";
        document.querySelector(".profile-img p").innerHTML = "Uploading... Please Wait"

        uploadTask.on('state_changed', function (snapshot) {
            changeProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        },
            function (err) {
                alert("Error in saving the image");
            },
            function () {
                uploadTask.snapshot.ref.getDownloadURL().then(function (url) {
                    firebase.database().ref('Pictures/' + userId).set({
                        Name: userId,
                        Link: url,
                        Nickname: $('#firstTB').val() + ' ' + $('#lastTB').val()
                    })
                        .then(function onSuccess(res) {
                            if (flag)
                                myResolve()
                        })
                        .catch(function onError(err) { alert(err) })

                });
                // get the img and render it into the profile pic div
            });
    }
    // if the user hasn't matched the requirements -> upload default profile picture and give him nickname (defualt is fullname)
    else {
        let task = firebase.database().ref('Pictures/' + userId);
        task.set({
            Name: userId,
            Link: defaultProfilePic,
            Nickname: $('#firstTB').val() + ' ' + $('#lastTB').val()
        })
            .then(function onSuccess(res) {
                if (flag)
                    myResolve()
            })
            .catch(err => console.log(err))
    }
}

// old user wants to change his profile picture
const updateImg = async (userId = user.Id, myResolve, myReject, flag = false, hasUploadedImg = true) => {
    if (hasUploadedImg && (files[0].type == "image/png" || files[0].type == 'image/jpg' || files[0].type == 'image/jpeg') && files[0].size < 500000) {
        let uploadTask = firebase.storage().ref('ProfileImages/' + userId + '.png').put(files[0]);

        uploadTask.on('state_changed', function (snapshot) {
        },
            function (err) {
                alert("Error in saving the image");
            },
            function () {
                uploadTask.snapshot.ref.getDownloadURL().then(function (url) {
                    firebase.database().ref('Pictures/' + userId).set({
                        Name: userId,
                        Link: url,
                        Nickname: $('#firstTB').val() + ' ' + $('#lastTB').val()
                    })
                        .then(function onSuccess(res) {
                            if (flag)
                                myResolve()
                        })
                        .catch(function onError(err) { alert(err) })

                });
                // get the img and render it into the profile pic div
            });
    }
    else {
        alert("Please upload picture with max size of 500KB and type png/jpg/jpeg")
        let task = firebase.database().ref('Pictures/' + userId);
        task.set({
            Name: userId,
            Link: defaultProfilePic,
            Nickname: $('#firstTB').val() + ' ' + $('#lastTB').val()
        })
            .then(function onSuccess(res) {
                if (flag)
                    myResolve()
            })
            .catch(err => console.log(err))
    }
}

// SetProfilePicture fetches the user information and renders in into the correct divs
const SetProfilePicture = (divid, user_id = JSON.parse(localStorage.loggedUser.Id)) => {
    userHasSuspended();
    firebase.database().ref('Pictures/' + user_id).on('value', snapshot => {
        // if there is no ref with userid and his img => use the default img
        if (snapshot.val() == null) {
            firebase.database().ref('Pictures/' + user_id).update({
                'Link': defaultProfilePic,
                'Name': `${user.Id}`,
                'Nickname': `${user.Name + " " + user.Surname}`
            });
        }
        else
            $(divid).attr("src", snapshot.val().Link);

    })
}

// checks if the user has been suspended due to harmful messages, if so notify him with timeleft and disconnect him
const userHasSuspended = () => {
    firebase.database().ref('Pictures/' + user.Id).once('value', snapshot => {
        if (new Date(snapshot.val().Suspend) > new Date()) {
            let suspend = new Date(snapshot.val().Suspend);
            let now = new Date();
            let timeleft = suspend - now;
            timeleft = Math.floor(timeleft / 60000);
            alert("Account has been temporary suspended, time left: " + timeleft + " minutes");
            localStorage.clear()
            window.location.href = "homepage.html";
        }
    })
}
