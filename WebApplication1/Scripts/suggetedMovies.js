DMDbAPIkey = "api_key=a71c4522a55a11d862ff1054f7087e22";
test = null;

// getRecommendedTVShows() function is responsible for gathering the top 3 viewed tv shows by the specific user
// and collect recommended tv shows for the same specific tv shows
// it later on calls printTVShows() to determine which tv shows are recommended for the user.
const getRecommendedTVShows = async () => {
    // if the user is not logged in, this function will not work.
    if (localStorage.loggedUser == undefined) return;
    // allTvShows is an object that stores all the arrays of the movies
    let allTvShows = [];
    let userTopViewed = [];
    // create an array of popularTvShows in case there are not enough tv shows to offer!
    let popularTvShows = [];
    let amount = 5;
    // get the top 3 tv shows from user
    userTopViewed = await fetch(`../api/UserEpisodes/getMostViewedTVShows?userId=${JSON.parse(localStorage.loggedUser).Id}&amount=${amount}`)
        .then(response => response.json())
        .catch('couldnt get user recommended');
    // loop through the array and get all the recommended tv show for each of them
    for (const tvShowId of userTopViewed) {
        let tempArray = await fetch(`https://api.themoviedb.org/3/tv/${tvShowId}/recommendations?${api_key}`)
            .then(response => response.json())
            .then(response => response.results)
            .catch('couldnt get tvRecommended');
        allTvShows = allTvShows.concat(tempArray);
    
    }
    do{
        let page = 1;
        if (allTvShows.length < 100) {
            popularTvShows = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=a71c4522a55a11d862ff1054f7087e22&language=en-US&page=${page++}`)
                .then(response => response.json())
                .then(response => response.results)
                .catch('could get top tv shows');
            allTvShows = allTvShows.concat(popularTvShows);
        }
        allTvShows = await removeLikedTvShows(allTvShows)
    }
    while(allTvShows.length < 100)
    return getRecommendedTVShowsData(generateRecommendedTVShows(allTvShows));
}

// removeLikedtvShows simply removes tv shows that the user has liked from the recommended list
const removeLikedTvShows = async (tvShows) => {
    let filteredList = [];
    let likedTvShows = await fetch(`../api/UserEpisodes?userID=${JSON.parse(localStorage.loggedUser).Id}`)
        .then(response => response.json())
        .then(response => {
            for (let i = 0; i < response.length; i++) {
                response[i] = response[i].Id;
            }
            return response;
        })
        .catch(err => console.log(err));
    tvShows.forEach(tvShow => {
        if(!likedTvShows.includes(tvShow.id)){
            filteredList.push(tvShow);
        }
    });
    return filteredList
}
// generateRecommendedTVShows function is responsible for collecting the recommended tv shows from the different arrays it gets, and create a new list
// which contains the suggested tv show with the heighest odds the user might like them, based on his own watch-list
const generateRecommendedTVShows = (allTvShows) => {
    // seenValues is an object that checks how many times each tv show gets recommended in each array
    let seenValues = {};

    allTvShows.forEach(tvshow => {
        // if got recommended before, add +1, otherwise keep it as 0
        seenValues[tvshow.id] = 1 + (seenValues[tvshow.id] || 0);
    });

    // map through allTvShows object and creating an array out of it (for sorting purposes)
    let fitTvShows = Object.keys(seenValues).map(key => {
        return [key, seenValues[key]];
    });
    // sort the array by the heighest recommendations number
    fitTvShows.sort(function (first, second) {
        return second[1] - first[1];
    });
    // get the top 5 recommended tv shows for the user
    return fitTvShows.slice(0, 5);
}

// then sends the data to the carousel
const getRecommendedTVShowsData = async (fitTvShows) => {
    for (let i = 0; i < fitTvShows.length; i++) {
        fitTvShows[i] = await fetch(`https://api.themoviedb.org/3/tv/${fitTvShows[i][0]}?${DMDbAPIkey}&language=en-US`)
            .then(response => response.json())
            .then(response => response)
            .catch('couldnt get user recommended');
    }
    test = fitTvShows;
    for (let i = 0; i < fitTvShows.length; i++) {
        let response = await fetch(`https://api.themoviedb.org/3/tv/${fitTvShows[i].id}/season/${fitTvShows[i].number_of_seasons == 1 ? 1 : fitTvShows[i].number_of_seasons - 1}/episode/1/images?${DMDbAPIkey}`)
            .then(response => response.json())
            .then(response => response)
            .catch('couldnt get user recommended');
        Object.assign(fitTvShows[i], response)
    }
    renderCarousel(fitTvShows);
}