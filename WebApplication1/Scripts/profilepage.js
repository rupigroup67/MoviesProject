imagePath = "https://image.tmdb.org/t/p/w300/";

$(document).ready(function () {
    if (!localStorage.loggedUser)
        location.href = 'homepage.html';

    SetProfilePicture("#user-info-profile-pic", JSON.parse(localStorage.loggedUser).Id);
    loadUserInfo(JSON.parse(localStorage.loggedUser));
    getUserFavoriteTvShows();
    createEventListeners();

    // var autocomplete;
    // autocomplete = new google.maps.places.Autocomplete((document.getElementById("search_input")), {
    //     types: ['geocode'],
    // });
    // google.maps.event.addListener(autocomplete, 'place_changed', function () {
    //     var near_place = autocomplete.getPlace();
    //     document.getElementById('loc_lat').value = near_place.geometry.location.lat();
    //     document.getElementById('loc_long').value = near_place.geometry.location.lng();
    // });
});

// fill the users data from the localstorage
const loadUserInfo = async (user) => {
    $("#userName").val(user.Name);
    $("#userLastName").val(user.Surname);
    $("#userDOB").val(user.DateOfBirth);
    $("#userGender").val(user.Gender);
    $("#userPhoneNum").val(user.PhoneNumber);
    document.getElementById("search_input").value = user.Address
    $("#UserFavGenre").val(user.Genre);

    // fetch the user nickname from the firebase
    ref = firebase.database().ref("Pictures").child(user.Id);
    await ref.once("value", snapshot => {
        $("#userNickname").val(snapshot.val().Nickname);
    });
}

// init event listeners
const createEventListeners = () => {
    // event listener for phone number field
    document.querySelector('#userPhoneNum').oninvalid = (event) => {
        event.target.setCustomValidity('');
        if (!event.target.validity.valid) {
            event.target.setCustomValidity('This field has to match the format: 05XXXXXXXX');
        }
    }
    document.querySelector('#userPhoneNum').oninput = (event) => {
        event.target.setCustomValidity('');
    }
    document.getElementById("selectImg").onclick = function (e) {
        let input = document.createElement('input');
        input.type = 'file';
    
        // bind the input change to updateImg() fucntion
        input.onchange = e => {
            files = e.target.files;
            reader = new FileReader();
            reader.onload = function () {
                updateImg();
            }
            reader.readAsDataURL(files[0]);
        }
        input.click();
    }
}

// get the current user liked TV shows
const getUserFavoriteTvShows = () => {
    $.ajax({
        url: "../api/UserEpisodes?userID=" + JSON.parse(localStorage.loggedUser).Id,
        type: 'GET'
    }).then((favTvShows) => {
        if (favTvShows.length <= 0) {
            // delete the title if user had no liked tvshows
            document.querySelector(".suggestionsDiv .suggestionsTitle").innerHTML = "";
            document.getElementById("popularContainer").innerHTML = "";
        }
        else {
            document.querySelector(".suggestionsDiv .suggestionsTitle").innerHTML = "Liked Tv Shows";
            let cardsDiv = document.getElementById("popularContainer");
            cardsDiv.innerHTML = "";
            favTvShows.forEach(tvShow => {
                cardsDiv.innerHTML += `
                <div class="tvShowCard">
                    <img onclick="loadLikedEpisodes(this.getAttribute('data-tvID'))" data-tvID="${tvShow.Id}" src="${imagePath + tvShow.Poster_path}" alt="">
                    <p class="tvShowCardTitle">${tvShow.Name}</p>
                </div>`
            });
        }
    }).catch((error) => {
        console.log(error);
    })
}

// render the liked episodes of desired TV show into the div as cards
const loadLikedEpisodes = (tvShowId) => {
    console.log(tvShowId);
    $.ajax({
        url: "../api/UserEpisodes?tvshowID=" + tvShowId + "&userID=" + JSON.parse(localStorage.loggedUser).Id,
        type: 'GET'
    }).then((episodes) => {
        let HTMLString = "";
        document.getElementById("likedEpisodes").innerHTML = "";
        episodes.forEach(episode => {
            console.log(episode.Id);
            HTMLString += `<div class="episode">`;
            if (episode.EpisodeImg)
                HTMLString += `<div class="episodeInfo"><img src="${episode.EpisodeImg}"/> `;
            else HTMLString += `<div class="episodeInfo imgless">`;
            HTMLString += `<h3>${episode.EpisodeName}</h3>
                <p class="episode-overview">${episode.EpisodeAirDate}</p>
                <p class="episode-datetime">${episode.EpisodeDesc}</p>
                </div>
            <img id="${episode.Id}" data-tvShowID="${tvShowId}" class="like" onclick="removeEpisode(this.id, this.getAttribute('data-tvShowID'))" src="https://img.icons8.com/wired/64/000000/delete-forever.png" />
        </div>`;
            document.getElementById("likedEpisodes").innerHTML = HTMLString;
        });
    }).catch((error) => {
        console.log(error);
    })
}

// removes liked episode from the users liked episodes (unlikes them)
const removeEpisode = (episodeID, tvShowID) => {
    $.ajax({
        url: "../api/UserEpisodes?episodeID=" + episodeID + "&userID=" + JSON.parse(localStorage.loggedUser).Id + "&tvShowID=" + tvShowID,
        type: 'DELETE'
    }).then((flag) => {
        // if tvshow has no episode user likes
        // remove the tvshow card
        // then empty the div of liked episodes
        // and rerender the cards (tvshow cards)
        if (document.querySelector("#likedEpisodes").childNodes.length === 1) {
            document.getElementById("likedEpisodes").innerHTML = "";
            getUserFavoriteTvShows();
        }
        else
            loadLikedEpisodes(tvShowID)
    }).catch((error) => {
        console.log(error);
    })
}

// edit profile changes all inputs to enabled and displays save changes button
const editProfile = () => {
    $("#save-hanges-btn").show();
    $("#selectImg").show();
    $("#edit-profile-btn").hide();

    let inputs = document.querySelectorAll(".user-info");
    inputs.forEach(input => {
        input.disabled = false;
        input.style.backgroundColor = "rgba(255, 255, 255, 0.185)";
    })
    // nickname input
    document.querySelector(".user-info-nickname").disabled = false;
    document.querySelector(".user-info-nickname").style.backgroundColor = "rgba(255, 255, 255, 0.185)"
}

// saveChanges function saves all changes that has been made on the user information
const saveChanges = () => {
    $("#save-hanges-btn").hide();
    $("#edit-profile-btn").show();
    $("#selectImg").hide();

    let inputs = document.querySelectorAll(".user-info");
    let updatedUser = {
        Email: user.Email,
        Active: true,
        Id: user.Id,
        Address: document.getElementById("search_input").value
    }
    inputs.forEach(input => {
        input.style.backgroundColor = "transparent";
        if (input.getAttribute("data-field")) {
            updatedUser[input.getAttribute("data-field")] = input.value.trim();
            input.disabled = true;
        }
    })
    document.getElementById("search_input").disabled = true;
    document.querySelector(".user-info-nickname").style.backgroundColor = "transparent";
    document.querySelector(".user-info-nickname").disabled = true;


    // ajax call and send the updated user
    $.ajax({
        url: "../api/../api/Users",
        type: 'PUT',
        data: updatedUser
    }).then((data) => {
        alert("Profile information has been updated successfully")
        if (updatedUser.Genre == "") {
            updatedUser.Genre = "none";
            document.getElementById("UserFavGenre").value = 'none'
        }
        ref = firebase.database().ref("Pictures").child(user.Id);
        ref.update({ 'Nickname': document.querySelector(".user-info-nickname").value });
        localStorage.loggedUser = JSON.stringify(updatedUser);
    }).catch((error) => {
        console.log(error);
    })
}

