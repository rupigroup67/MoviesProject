// ----- Document Ready ----- \\ 
$(document).ready(function () {

    // global vars
    api_key = "api_key=a71c4522a55a11d862ff1054f7087e22";
    imagePath = 'https://image.tmdb.org/t/p/w300/';
    numberOfCards = 0;
    tvShowsObj = {
        'popular': null,
        'trending': null
    };
    expanded = false;
    AdvancedSearchList = [];
    APISearchList = [];
    windowWidth = window.screen.width;

    // init page
    $("#advancedSearchBar").hide();
    getRecommendedTVShows();
    getPopularTvShows();
    getTrendingTvShows();
    showWelcomeText();
    // loadAdvancedSearchOptions()

    initiateEventListeners();
    // make async wait function to collect recommended tv shows for the user
    // render the carousel with the output of get recommended tv shows
    // reseting the localStorage
    localStorage.removeItem("tvshow");
});

// ----- Functions ----- \\ 
const initiateEventListeners = () => {
    // change the text when trying to search by actors' names
    $('#searchByAdvanced').click(changeSearchText)

    // Defining the scroll bar listener (search input) 
    $(window).scroll(function (e) {
        let element = $('#search');
        let isPositionFixed = (element.css('position') == 'fixed');
        if ($(this).scrollTop() >= 152) {
            if (!isPositionFixed)
                element.css({ 'position': 'fixed', 'top': '5px' });
        }
        else if ($(this).scrollTop() < 152 && isPositionFixed) {
            element.css({ 'position': 'relative', 'top': '0px' });
        }
    });
    // adding listener to window size (number of tvshows displayed)
    window.addEventListener('resize', function (event) {
        if (event.target.outerWidth != windowWidth) {
            windowWidth = event.target.outerWidth;
            if (document.getElementById("popularContainer").style.flexWrap != 'wrap')
                renderTvShows("popular");
            if (document.getElementById("trendingContainer").style.flexWrap != 'wrap')
                renderTvShows("trending");
        }
    }, true);
    $(window).click(function () {
        document.getElementById("autoComplete").children[0].innerHTML = "";
    });
    // fills in the list of tv shows / actors by their names as a link
    $('#tvShowName').click(function (event) {
        autoCompleteSearch($('#tvShowName').val())
    });
}
// This function transfers the genres' id to names and creates a list out of it
// const loadAdvancedSearchOptions = () => {
//     console.log('loading genres')
//     checkboxesDiv = document.querySelector(".checkboxes");
//     checkboxesDiv.innerHTML = "";
//     Object.entries(genresDict).forEach(([key, value]) => {
//         checkboxesDiv.innerHTML += `
//         <label for="genre-${key}">
//             <input type="checkbox" id='genre-${key}' data-genreName="${value}" data-genreId="${key}"/>  ${value}
//         </label>`
//     });
// }

// Change the search bar placeholder between search actor or search tvshow
const changeSearchText = () => {
    if (document.querySelector('#searchByAdvanced').checked) {
        $("#tvShowName").attr("placeholder", "Search actors").val("").focus().blur();
    }
    else $("#tvShowName").attr("placeholder", "Search TV-Show").val("").focus().blur();
}
// const showCheckboxes = () => {
//     let checkboxes = document.querySelector(".genreCheckboxes");
//     if (!expanded) {
//         checkboxes.style.display = "flex";
//         expanded = true;
//     } else {
//         checkboxes.style.display = "none";
//         expanded = false;
//     }
// }

// By clicking on the adv. search button, this function accourse and slids up and down the search option.
const openAdvanceSearch = () => {
    if ($("#advancedSearchBar").is(":visible")) {
        $("#advancedSearchBar").slideUp('slow');
        return;
    }
    $("#advancedSearchBar").slideDown('slow');
}

// Collecting popular TV Shows from TheMovieDB API
const getPopularTvShows = async () => {
    $.ajax({
        url: 'https://api.themoviedb.org/3/tv/popular?api_key=a71c4522a55a11d862ff1054f7087e22&language=en-US&page=1',
        type: 'GET'
    }).then((shows) => {
        tvShowsObj.popular = removeEmptyTvShows(shows);
        renderTvShows("popular");
    }).catch((error) => {
        console.log(error);
    })
}
// Collecting trending TV Shows from TheMovieDB API
const getTrendingTvShows = () => {
    $.ajax({
        url: 'https://api.themoviedb.org/3/trending/tv/week?api_key=a71c4522a55a11d862ff1054f7087e22',
        type: 'GET'
    }).then((shows) => {
        tvShowsObj.trending = removeEmptyTvShows(shows);
        renderTvShows("trending");
    }).catch((error) => {
        console.log(error);
    })
}
// When user wants to search a tv show, this function pops up and redirects the user to the specific tv show page
const goToTvShowPage = (name) => {
    // if !advanced && Alength>0
    // if advanced && length>0

    //if there are any results to the search
    if (document.getElementById("autoComplete").children[0].children.length) {
        // check if it is advanced search
        if (document.querySelector('#searchByAdvanced').checked)
            window.location.href = 'actorPage.html?actorID=' + topActorResultsID;
        // not advanced search
        else
            window.location.href = 'tvshowpage.html?tvshowName=' + name;

    }
    else {
        alert('This name does not exists in the server. Please try again with another name.');
    }
}
// When rendering the tv shows (renderTvShows()) to the screen, this function eliminates those without any poster path img.
const removeEmptyTvShows = (tvShows) => {
    let filteredArray = [];
    tvShows.results.forEach(tvShow => {
        if (tvShow.poster_path != "" && tvShow.poster_path != null && tvShow.poster_path != undefined) {
            filteredArray.push(tvShow);
        }
    });
    tvShows.results = filteredArray;
    return tvShows;
}
// Render the tv shows to the screen.
const renderTvShows = (type) => {
    let div;
    let tempTvShow;
    if (type == "popular") {
        tempTvShow = tvShowsObj.popular;
        div = document.querySelector("#popularContainer");
    }
    else {
        tempTvShow = tvShowsObj.trending;
        div = document.querySelector("#trendingContainer");
    }
    div.innerHTML = "";
    // Calculate number of tvshows cards to display
    numberOfCards = ($(window).width() - 190) / 140;
    for (let i = 0; i < numberOfCards; i++) {
        // if(tempTvShow.results[i].poster_path == null) continue;
        div.innerHTML += `
        <div class="tvShowCard-${type} tvShowCard" data-tvshowid=${tempTvShow.results[i].id}>
            <div class="tvshowImgPopup-${tempTvShow.results[i].id}-${type} tvshowImgPopup-${type} tvshowImgPopup" data-tvshowid=${tempTvShow.results[i].id}>
                <img class="${type}-img-${tempTvShow.results[i].id}" data-tvshowid=${tempTvShow.results[i].id} onclick="window.location.href='tvshowpage.html?tvshowName=${encodeURIComponent(tempTvShow.results[i].name.replace(/'/g, ""))}'" src="${imagePath + tempTvShow.results[i].poster_path}" alt="">
                <div class="${type}-tvShow-${tempTvShow.results[i].id} popupInfo"></div>
            </div>
            ${CreateCircle(tempTvShow.results[i].vote_average)}
            <p class="tvShowCardTitle">${tempTvShow.results[i].name}</p>
            <p class="tvShowCardDate">${tempTvShow.results[i].first_air_date}</p>
        </div>
        `;
    }
    div.innerHTML += `<a><img class="viewMore" onclick="viewMore('${type}')" src="./images/right-arrow.png" title="View More" alt="View More"></a>`;
}
// This method fills up the list of actors or tv shows by the user's input inserted
const autoCompleteSearch = (text) => {
    ul = document.getElementById("autoComplete").children[0];
    ul.innerHTML = "";
    if (text.length > 2) {
        if (document.querySelector('#searchByAdvanced').checked) {
            let actorsList = [];
            $.ajax({
                url: `https://api.themoviedb.org/3/search/person?${api_key}&language=en-US&query=${text}&page=1&include_adult=false`,
                type: 'GET',
            }).then((data) => {
                let flag = false;

                for (let j = 0, i = 0; i < Math.min(5, data.results.length); i++) {
                    if (i + j >= data.results.length) break;
                    if (data.results[i + j].profile_path == null) {
                        j++;
                        continue;
                    }
                    // saves in a global var the id of actor who is at the top of search auto-complete
                    if (!flag) {
                        flag = true;
                        topActorResultsID = encodeURIComponent(data.results[0].id);
                    }
                    ul.innerHTML += `<hr><li
                    onclick="window.location.href='actorPage.html?actorID=${encodeURIComponent(data.results[i + j].id)}'">
                    <img src="${imagePath + data.results[i + j].profile_path}"/><p>${data.results[i + j].name}</p>
                    </li>`
                }

            }).catch((error) => {
                console.log(error);
            })


            // WILL NEED THIS LATER FOR FILTERING THE POPULAR AND TRENDING SHOWS!

            // let tempTvShows = [];
            // let tempGenres = [];
            // selectedGenres = document.querySelectorAll(`.checkboxes input:checked`);
            // selectedGenres.forEach(genre => {
            //     tempGenres.push(genre.getAttribute(`data-genreId`))
            // })
            // // loop throught the tv shows array
            // AdvancedSearchList.forEach(tvShow => {
            //     tvShow.genre_ids.forEach(tvShowGenre => {
            //         tempGenres.forEach(genre => {
            //             if(genre == tvShowGenre && tvShow.name.includes(text)){
            //                 tempTvShows.push(tvShow);
            //             }
            //         })
            //     })
            // })
            // // filtering duplicates 
            // tempTvShows = tempTvShows.filter((tvShow, index) => {
            //     return tempTvShows.indexOf(tvShow) === index;
            // });
            // for (let i = 0; i < Math.min(5, tempTvShows.length); i++) {
            //     ul.innerHTML += `<hr><li onclick="window.location.href='tvshowpage.html?tvshowName=${encodeURIComponent(tempTvShows[i].name.replace(/'/g, ""))}'">${tempTvShows[i].name}</li>`
            // }
            // if (tempTvShows.length == 0) AdvancedSearchList = [];
        }
        else {
            $.ajax({
                url: "https://api.themoviedb.org/3/search/tv?api_key=a71c4522a55a11d862ff1054f7087e22&query=" + text + "&page=1",
                type: 'GET',
            }).then((data) => {
                for (let j = 0, i = 0; i < Math.min(5, data.results.length); i++) {
                    if (i + j >= data.results.length) break;
                    if (data.results[i + j].poster_path == null) {
                        j++;
                        continue;
                    }
                    ul.innerHTML += `<hr><li
                    onclick="window.location.href='tvshowpage.html?tvshowName=${encodeURIComponent(data.results[i].name.replace(/'/g, ""))}'">
                    <img src="${imagePath + data.results[i + j].poster_path}"/><p>${data.results[i + j].name}</p>
                    </li>`
                }
            }).catch((error) => {
                console.log(error);
            })
        }
    }
    else {
        return;
    }
}
// Renders the suggested tv shows to the carousel when the user is logged in
const renderCarousel = (fitTVShows) => {
    let slides = document.querySelectorAll('.slides .slide');
    let url = ''
    for (let i = 0; i < fitTVShows.length; i++) {
        if (fitTVShows[i].stills != undefined && fitTVShows[i].stills.length > 0) {
            url = 'https://image.tmdb.org/t/p/original/' + getMaxResImg(fitTVShows[i].stills)
        };
        slides[i].innerHTML = `
        <div class='image-gradient'>
            <img src="${url}" alt="img">
        </div>
        <div class="languagesUsed">
            <div> 
                <h4>'${fitTVShows[i].name}'</h4>
                <div class="carousel-tvshow-info">
                    <h5>Number of seasons: ${fitTVShows[i].number_of_seasons}</h5>
                    ${CreateCircle(fitTVShows[i].vote_average)}
                </div>
            </div>
            <div class="imgsLang">
                <img onclick="window.location.href='tvshowpage.html?tvshowName=${encodeURIComponent(fitTVShows[i].name.replace(/'/g, ""))}'" src="https://image.tmdb.org/t/p/w300/${fitTVShows[i].poster_path}" alt="poster">
            </div>
        </div>
       `
    }
    $('.slider').show();
}
// This method insures the user can see the best resolution of an image inside the carousel.
// This helps the website keep its clean and fluent experience. 
const getMaxResImg = (imagesArray) => {
    if (imagesArray != undefined && imagesArray.length > 0) {
        let maxHeightImgIndex = 0;
        imagesArray.forEach((element, index) => {
            if (element.height >= imagesArray[maxHeightImgIndex].height) maxHeightImgIndex = index
        });
        return imagesArray[maxHeightImgIndex].file_path;
    }
}
// Gathers more tv shows according to the type of the list (popular or trending) when the user clicks on the "view more" button
const viewMore = (type) => {
    let div;
    let tvShows;
    if (type == "popular") {
        div = document.getElementById("popularContainer");
        tvShows = tvShowsObj.popular;
    }
    else {
        div = document.getElementById("trendingContainer");
        tvShows = tvShowsObj.trending;
    }
    if (div.style.flexWrap != 'wrap') {
        div.style.flexWrap = "wrap";
        div.style.justifyContent = "center";
    }
    else {
        addMoreTvShows(div);
        return;
    }
    div.innerHTML = "";
    addCardsToDiv(div, tvShowsObj[type].results)
    // add the viewMore img
    if (type != 'trending')
        div.innerHTML += `<a>
        <div class="bottomLocation" ><img onclick="viewMore('${type}')" src="./images/right-arrow.png" alt="View More"><p>View More</p></div>
        <div class="viewLess"><img  onclick="viewLess('${type}')" src="./images/right-arrow.png" alt="View More"><p>View Less</p></div>
        </a>`;

}
// addMoreTvShows renders the tv shows from "viewMore" function to the screen
const addMoreTvShows = (div, type) => {
    let page = ((document.getElementById("popularContainer").childElementCount - 1) / 20) + 1;
    $.ajax({
        url: `https://api.themoviedb.org/3/tv/popular?api_key=a71c4522a55a11d862ff1054f7087e22&language=en-US&page=${++page}`,
        type: 'GET'
    }).then((tvShows) => {
        let filteredTvShows = removeEmptyTvShows(tvShows);
        addCardsToDiv(div, filteredTvShows.results)
    }).catch((error) => {
        console.log(error);
    })
}
// This function creates the card of each tv show and adds a rating score circle showing its rating
const addCardsToDiv = (div, cardsArray) => {
    for (let i = 0; i < cardsArray.length; i++) {
        div.innerHTML += `
        <div class="tvShowCard">
        <img onclick="window.location.href='tvshowpage.html?tvshowName=${encodeURIComponent(cardsArray[i].name.replace(/'/g, ""))}'" src="${imagePath + cardsArray[i].poster_path}" alt="">
        ${CreateCircle(cardsArray[i].vote_average)}
        <p class="tvShowCardTitle">${cardsArray[i].name}</p>
        <p class="tvShowCardDate">${cardsArray[i].first_air_date}</p>
        </div>
        `;
    }
}
// Hides all the rendered tv shows from the list and keeps only the top tv shows needed.
const viewLess = (type) => {
    if (type == 'popular') {
        div = document.getElementById("popularContainer");
        div.style.flexWrap = "nowrap";
        div.style.justifyContent = "start";
        renderTvShows(type)
    }
}

