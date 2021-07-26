
// global vars

// ----- Document Ready ----- \\
$(document).ready(function () {
    // Data:
    lastRender = -1;
    season = null;
    tvShow = null;
    counter = 0;
    YouTubeAPIkey = "AIzaSyCrIsw8B9VONSszrepeqwcCPHRFLLg9PRA";
    DMDbAPIkey = "api_key=a71c4522a55a11d862ff1054f7087e22";
    imagePath = "https://image.tmdb.org/t/p/w300/";
    url = "https://api.themoviedb.org/";
    renderBackgroundColor()
    fetchTvInfo();
});
// This function creates the background color change for each tv show
const renderBackgroundColor = () => {
    const image = document.querySelector('#background-color-detector');
    image.onload = () => {
        const { R, G, B } = getAverageColor(image, 4);
        document.querySelector('body').style.background = `linear-gradient(to top, rgb(${R - 20}, ${G - 20}, ${B - 20}), rgb(${R + 20}, ${G + 20}, ${B + 20}))`;
        document.querySelector("#tvshowchat").style.background = `rgb(${R - 20}, ${G - 20}, ${B - 20})`;
        document.querySelector('#tvshowchat').style.background = `linear-gradient(45deg, rgb(${R}, ${G}, ${B}), rgb(${R + 50}, ${G + 50}, ${B + 50}))`;
    }
}
// Gather parameters from the URL to search for a specific tv show
const fetchTvInfo = async () => {
    let urlParams = new URLSearchParams(window.location.search);
    let tvShowName = urlParams.get('tvshowName');
    // fetch the tvshow id with the tvshowname 
    tvShow = await fetch(`https://api.themoviedb.org/3/search/tv?${DMDbAPIkey}&language=en-US&page=1&query=${tvShowName}&include_adult=false`)
        .then(response => response.json())
        .then(response => response)
        .catch('couldnt get user recommended');
    if (tvShow.results[0] == undefined) {
        alert("Desired TV show wasn't found, redirecting to home page")
        window.location.href = 'homepage.html';
    }
    tvShow = await fetch(`https://api.themoviedb.org/3/tv/${tvShow.results[0].id}?${DMDbAPIkey}&language=en-US`)
        .then(response => response.json())
        .then(response => response)
        .catch("error!");
    getTV();
}
// getTV function collects all the data from fetchTvInfo() and renders it to the screen
const getTV = () => {
    // change page title
    document.title = tvShow.name;
    // render show more button

    // load toggle profile burger
    loadVars();
    // get and render tvshow messages
    // GetTvShowMessages(tvShow.id);
    if (localStorage.loggedUser) {
        // show reviews div
        document.querySelector(".reviews-div").style.display = "block";
        initChatListeners();
        $("#tvshowchat").css("display", "flex");
    }
    // Render all tv show information into the divs
    renderTvShowInfo()
    // Render drop down list
    renderDropDownList();
    // Load first season's episodes
    findSeasonsNumberErrorCB(1);
    // Fill in the select dropdown livst
    searchTvShow(tvShow.name, 1);
    // enter event listener
    getReviewsList(tvShow.id);
    reviewsRef = firebase.database().ref("Reviews");
    reviewsRef.child(tvShow.id).child('reviews').on("child_added", snapshot => {
        updateReviews(snapshot.val());
    })
    if (document.querySelector(".tvshow-desc").offsetHeight >= 75) {
        showMoreDesc();
    }
}
// Renders all seasons to the seasons' DDL
const renderDropDownList = () => {
    for (let i = 0; i < tvShow.number_of_seasons; i++) {
        $('#select-season').append(`<option value=${i + 1}>Season ${i + 1}</option>`);
    }
}
// Renders the information about the tv show on the top of the page
const renderTvShowInfo = () => {
    $('#background-color-detector').attr('src', imagePath + tvShow.poster_path);
    $('#tvshowname').text(tvShow.name)
    $('#chatTitle h3').text("'" + tvShow.name + "' Chat")
    $('#tvshowdesc').html(`<p><b>Description:</b></p>` + tvShow.overview);
    $('#tvshowairdate').text(tvShow.first_air_date);
    $('#tvshownumofseasons').text(tvShow.number_of_seasons);
    $('#tvshowgenre').text(getGenre(tvShow.genres));
    $('#tvshowrate').empty();
    $('#tvshowrate').append(CreateCircle(tvShow.vote_average));
}
// Convert tv show's genre from id (gotten from TheMovieDB API) to name, so the user can understand its meaning
const getGenre = (genresObj) => {
    let genres = "";
    for (let index = 0; index < genresObj.length; index++) {
        genres += genresDict[genresObj[index].id];
        if ((index + 1) != genresObj.length)
            genres += ", ";
    }
    return genres;
}
// This method uses YouTube's search API to generate iframe that shows the trailer of the tv show.
// if trailer was not found, hides the div so it doesn't take place in the website.
const searchTvShow = (searchTerm, maxResults) => {
    player = $('#player');
    // YouTube Trailer!
    $.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&key=
    ${YouTubeAPIkey}&q=${searchTerm} tv show trailer&type=video&maxResults=${maxResults}`)
        .then((data) => {
            player.attr("src", `https://www.youtube.com/embed/${data.items[0].id.videoId}`);
        })
        .catch((error) => {
            document.querySelector(".cover").style.display = "none";
        })
        .then(() => {
            method = "3/search/tv?";
            let moreParams = "&language=en-US&page=1&include_adult=false&";
            let query = "query=" + encodeURIComponent(searchTerm);
            let apiCall = url + method + DMDbAPIkey + moreParams + query;

            $.ajax({
                url: apiCall,
                type: 'GET'
            })
                .catch((error) => {
                    console.log(error);
                })
        })
}
// Gather information about selected season and renders it to the screen
const findSeasonsNumberErrorCB = (seasonNumber) => {
    let tvId = tvShow.id;
    let method = "3/tv/";
    let apiCall = '';
    // if (error > 0 && error < 999) {
    apiCall = url + method + tvId + `/season/${seasonNumber}?` + DMDbAPIkey;
    $.ajax({
        url: apiCall,
        type: 'GET'
    }).then((season) => {
        this.season = season;
        $('#episodesListPH').empty();
        $('.castDiv').empty();
        season.episodes.forEach((episode, index) => {
            if (episode.overview != "") {
                $('#episodesListPH').append(
                    `<div class="episodeInsert">
                            <p class="episode_number"><span>episode</span>${episode.episode_number}</p>
                            <img class="episode_image" src=${imagePath + episode.still_path}>
                            <div class="episode-title-desc">
                                <h4>${episode.name}</h4>
                                <p>${episode.overview}</p>
                            </div>
                            <div id="epid-${episode.id}" data-episodeID="${episode.id}" class="liked-dislike-btnDiv"></div>
                        </div>`
                )
            }
            if (localStorage.loggedUser) {
                $(`#epid-${episode.id}`).append(`<img id=addremovebtn-${episode.id} onclick="addToWatchList(this)" data-episodeNum="${index}" data-episodeID="${episode.id}" title="Add to watch list" src="./images/wish-list.png"/>`);
                markLovedEpisodes();
            }
        });
        getActorsList(tvShow.id);
    }).catch((error) => {
        console.log(error);
    })
}
// Get the reviews users previously added to a specific tv show
const getReviewsList = (tvshowId) => {
    if (localStorage.loggedUser)
        $('.reviewsList').append(`
        <div class="addReview review">
            <img class="backgroundQuotes" src="./images/quote.png"/>
            <img onclick="addReview(this)" class="plusButton" src="./images/plus--v2.png"/>
            <div class="newReviewDetails">
                <div class="author">
                    <h4 class="author">${JSON.parse(localStorage.loggedUser).Name} ${JSON.parse(localStorage.loggedUser).Surname}</h4>
                    <hr>
                </div>
                
                <div class="personsReview">
                    <textarea oninput="allowSendReview(this.value)" maxlength="150" class="newReviewContent"></textarea>
                    <p>Score: <input oninput="checkValue(this)" type="number" min="0" max="5" />/5</p>
                </div>
                <button disabled onclick="sendReview()" class="sendReview">Send</button>
            </div>
        </div>`);
}
// Makes sure the user doesn't insert incorrect score to his review (from 0 to 5)
const checkValue = (input) => {
    if (input.value.length > 1)
        input.value = input.value.slice(0, 1);
    if (input.value > 5)
        input.value = 5;
}
// Plays with the css to allow user to send review and hide it when neccessary
const allowSendReview = (text) => {
    if (text.length > 0)
        $('.newReviewDetails button').prop('disabled', false);
    else
        $('.newReviewDetails button').prop('disabled', true);
}
// Create a review object and send it to the firebase live server to store it there under "Reviews" section.
// "Reviews" section creates a new sub-section for each tv show inside it.
const sendReview = async () => {
    let review = {
        author: `${JSON.parse(localStorage.loggedUser).Name} ${JSON.parse(localStorage.loggedUser).Surname}`,
        text: `${$('.newReviewDetails textarea').val().trim()}`,
        score: `${$('.newReviewDetails input').val()}`
    }
    reviewsRef.child(tvShow.id).child('reviews').push().set(review);
    reverseReview();
}
// Allows the user to type his own review by clicking on the "+"" img.
const addReview = (img) => {
    $('.newReviewDetails').css('display', 'block');
    img.style.display = 'none';
}
// After sending a review, it reverses the first card back to it's native "+" img and empties the inputs.
const reverseReview = () => {
    $('.newReviewDetails').css('display', 'none');
    $('.plusButton').css('display', 'block');
    $('.newReviewDetails textarea').val('');
    $('.newReviewDetails input').val('');
    $('.plusButton').prop('disabled', true);
}
// Gather information about the actors and create a list out of it.
// This function shows only actors with imgs. The rest will now show in this section.
// By clicking on an actor's img, it automaticly redirects the user to the actor's information page, showing his participance in tv shows and movies
const getActorsList = async (tvshowId) => {
    await fetch(`https://api.themoviedb.org/3/tv/${tvshowId}/credits?${DMDbAPIkey}&language=en-US`)
        .then(response => response.json())
        .then(response => {
            let counter = 0;
            for (let j = 0, i = 0; i < Math.min(7, response.cast.length); i++) {
                if (!response.cast[i + j]) break;
                if (response.cast[i + j].profile_path == null) {
                    j++;
                    continue;
                }
                $('.castDiv').append(`
                    <div class="personCard-${counter++} personCard">
                        <div class="imgCard">
                            <img
                            onclick="window.location.href='actorPage.html?actorID=${encodeURIComponent(response.cast[i + j].id)}'" 
                            src="${imagePath + response.cast[i + j].profile_path}">
                        </div>
                        <div class="personalInfoCard">
                            <p class="infoTitleQuestion">Name:</p>
                            <p class="infoAsnwer">${response.cast[i + j].name}</p>
                            <p class="infoTitleQuestion">Character's name:</p>
                            <p class="infoAsnwer">${response.cast[i + j].character}</p>
                            <p class="infoTitleQuestion">Gender:</p>
                            <p class="infoAsnwer">${response.cast[i + j].gender == 1 ? 'Female' : 'Male'}</p>
                            <p class="infoTitleQuestion">Popularity:</p>
                            <p class="infoAsnwer">${response.cast[i + j].popularity}</p>
                        </div>
                    </div>
                `)
            }
        })
        .catch('could get top tv shows');
    addHoverListeners(document.querySelector('.castDiv').children.length)
}
// Create an event listener when hovering each actor
const addHoverListeners = (length) => {
    for (let index = 0; index < length; index++) {
        document.querySelector(`.personCard-${index}`).addEventListener("mouseover", () => hoverAnimation(`${index}`), false);
        document.querySelector(`.personCard-${index}`).addEventListener("mouseout", () => hoverAnimation(`${index}`), false);
    }
}
// Create an animation when hovering each actor
const hoverAnimation = (index) => {
    $(`.personCard-${index}`).toggleClass('active');
    $(`.personCard-${index} .personalInfoCard`).toggleClass('active');
    $(`.personCard-${index} .infoText`).toggleClass('active');
    $(`.personCard-${index} .imgCard`).toggleClass('active');
}
// When the user likes an episode, he can click on the "like" button and add it to his watch list.
// Clicking on the img again, will revert the function and remove the episode from his list.
const markLovedEpisodes = () => {
    if (!localStorage.loggedUser) return;
    $.ajax({
        url: '../api/UserEpisodes?tvshowID=' + tvShow.id + "&userID=" + JSON.parse(localStorage.loggedUser).Id + "&seasonNumber=" + season.season_number,
        type: 'GET',
    }).then((likedEpisodes) => {
        likedEpisodes.forEach(ep => {
            let img = $("#addremovebtn-" + ep.Id);
            img.attr("onclick", "removeFromWatchList(this)");
            img.attr("src", "./images/wish-list-added.png");
            img.attr("title", "Already in your watch-list");
        })
    })
        .catch((error) => {
            console.log("fail to add  ERROR: " + error);
        })

}
// Add the marked episode to the user's watch-list
const addToWatchList = (btn) => {
    episodeNumber = btn.getAttribute("data-episodeNum");
    let tempEpisode = {
        seasonNumber: season.episodes[episodeNumber].season_number,
        episodeName: season.episodes[episodeNumber].name,
        episodeImg: imagePath + season.episodes[episodeNumber].still_path,
        episodeDesc: season.episodes[episodeNumber].overview,
        episodeAirDate: season.episodes[episodeNumber].air_date,
        id: season.episodes[episodeNumber].id
    };
    let tempTvShow = {
        id: tvShow.id,
        first_air_date: tvShow.first_air_date,
        name: tvShow.name,
        origin_country: tvShow.origin_country[0],
        original_language: tvShow.original_language,
        overview: tvShow.overview,
        popularity: tvShow.popularity,
        poster_path: tvShow.poster_path,
    }
    let tempUser = JSON.parse(localStorage.loggedUser);
    data = {
        e: tempEpisode,
        u: tempUser,
        tvs: tempTvShow,
    }
    $.ajax({
        url: '../api/UserEpisodes/',
        type: 'POST',
        data: data
    }).then((data) => {
        let img = $("#addremovebtn-" + tempEpisode.id);
        img.attr("onclick", "removeFromWatchList(this)");
        img.attr("src", "./images/wish-list-added.png");
        img.attr("title", "Already in your watch-list");
    })
        .catch((error) => {
            console.log("fail to add " + error);
        })
}
// Remove the marked episode from the user's watch-list
const removeFromWatchList = (btn) => {
    $.ajax({
        url: "../api/UserEpisodes?episodeID=" + btn.getAttribute("data-episodeid") + "&userID=" + JSON.parse(localStorage.loggedUser).Id + "&tvShowID=" + tvShow.id,
        type: 'DELETE'
    }).then(() => {
        let img = $("#addremovebtn-" + btn.getAttribute("data-episodeid"));
        img.attr("onclick", "addToWatchList(this)");
        img.attr("src", "./images/wish-list.png");
        img.attr("title", "Add to watch list");
    })
        .catch((error) => {
            console.log(error);
        })
}
// This method gets the most used color inside each tv show's poster-path and returns its RGB.
// If the RGB is too bright, make it a little bit darker.
const getAverageColor = (imageElement, ratio) => {
    const canvas = document.createElement("canvas");
    let height = canvas.height = imageElement.naturalHeight;
    let width = canvas.width = imageElement.naturalWidth;

    const context = canvas.getContext("2d");
    context.drawImage(imageElement, 0, 0);
    let data, length;
    let i = -4, count = 0;

    try {
        data = context.getImageData(0, 0, width, height);
        length = data.data.length;
    } catch (error) {
        console.log(error);
        return { R: 0, G: 0, B: 0 };
    }
    let R, G, B;
    R = G = B = 0;

    while ((i += ratio * 4) < length) {
        ++count;
        R += data.data[i];
        G += data.data[i + 1];
        B += data.data[i + 2];
    }
    R = ~~(R / count);
    G = ~~(G / count);
    B = ~~(B / count);
    if (R > 200 && G > 220 && B > 220) {
        R = R - 100;
        G = G - 100;
        B = B - 100;
    }
    return { R, G, B };
}
// Show more or hide the description of the tv show. 
// This allows the user to manage his view, in case he doesn't want to see a huge text box.
const showMoreDesc = () => {
    if ($("#showMoreDesc").text() == "Show More...") {
        $("#showMoreDesc").show();
        $("#showMoreDesc").text("Show Less...");
        document.getElementById("tvshowdesc").style.maxHeight = "none";
    }
    else {
        $("#showMoreDesc").show();
        $("#showMoreDesc").text("Show More...");
        document.getElementById("tvshowdesc").style.maxHeight = "75px";

    }

}
// "Downloads" the reviews from firebase realtime database to show it to the user.
// This function gathers information about a specific tv show and doesn't show all reviews.
const updateReviews = (value) => {
    if (value.text == '')
        return;
    document.querySelector(".reviews-div").style.display = "block";
    $('.reviewsList').append(`
        <div class="review">
            <img class="backgroundQuotes" src="./images/quote.png"/>
            <div class="reviewDetails">
                <div class="author">
                    <h4 class="author">${value.author}</h4>
                    <hr>
                </div>
                <div class="personsReview">
                    <p class="reviewContent">"${value.text}"</p>
                    <div class="score">${fillStars(value.score)}</div>
                </div>
            </div>
        </div>`);
}
// This function extends updateReviews() to show the rate of each review. If it doesn't have any, hide all stars.
const fillStars = (score) => {
    let HTMLString = ``
    if (score != '')
        for (let i = 0; i < 5; i++) {
            if (i < score)
                HTMLString += `<img src="./images/star--v2.png"/>`;
            else
                HTMLString += `<img src="./images/star--v1.png"/>`
        }
    return HTMLString;
}