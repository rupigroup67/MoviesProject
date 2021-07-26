DMDbAPIkey = "api_key=a71c4522a55a11d862ff1054f7087e22";
imagePath = "https://image.tmdb.org/t/p/w300/";

const loadActor = async () => {
    let urlParams = new URLSearchParams(window.location.search);
    // get the actor id from params
    let actorID = urlParams.get('actorID');

    // Fetch personal information about an actor
    await fetch(`https://api.themoviedb.org/3/person/${actorID}?${DMDbAPIkey}&language=en-US`)
        .then(response => response.json())
        .then(response => {
            if(response.success == false){
                alert("Desired actor wasn't found, redirecting to home page")
                window.location.href = 'homepage.html';
            }
            // insert the information regarding the actor to the webpage
            $('.actorImg img').attr('src', imagePath + response.profile_path)
            $(".actorBio").html(response.biography);
            $(".actorPersonalData").html(`
            <p class="infoTitleQuestion">Name:</p>
            <p class="infoAsnwer">${response.name}</p>
            <p class="infoTitleQuestion">Place of birth:</p>
            <p class="infoAsnwer">${response.place_of_birth  == null ? "unknown" : response.place_of_birth}</p>
            <p class="infoTitleQuestion">Birth date:</p>
            <p class="infoAsnwer">${response.birthday == null ? "unknown" : response.birthday}</p>
            <p class="infoTitleQuestion">Gender:</p>
            <p class="infoAsnwer">${response.gender == 1 ? 'Female' : 'Male'}</p>
            <p class="infoTitleQuestion">Popularity:</p>
            <p class="infoAsnwer">${response.popularity}</p>
            `)
        })
        .catch(error => {
            alert("Desired actor wasn't found, redirecting to home page")
            window.location.href = 'homepage.html';
        });

    // Fetch TV Shows the actor took place in
    await fetch(`https://api.themoviedb.org/3/person/${actorID}/tv_credits?${DMDbAPIkey}&language=en-US`)
        .then(response => response.json())
        .then(response => {
            // console.log(response.cast[0].poster_path)
            if(response.cast.length > 0)
            {
                $(".actorTVShows").append(`<h4>TV Shows:</h4><div class="tvShowsList"></div>`)
                for (let index = 0; index < response.cast.length; index++) {
                    if(!response.cast[index].poster_path) continue;
                    $('.tvShowsList').append(`
                        <img
                        class="showImg"
                        onclick="window.location.href='tvshowpage.html?tvshowName=${encodeURIComponent(response.cast[index].original_name.replace(/'/g, ""))}'"
                        src="${imagePath + response.cast[index].poster_path}"/>
                    `)
                    
                }
            }
    });

    // Fetch Movies the actor took place in
    await fetch(`https://api.themoviedb.org/3/person/${actorID}/movie_credits?${DMDbAPIkey}&language=en-US`)
        .then(response => response.json())
        .then(response => {
            if(response.cast.length > 0)
            {
                $(".actorMovies").append(`<h4>Movies:</h4><div class="moviesList"></div>`)
                for (let index = 0; index < response.cast.length; index++) {
                    if(!response.cast[index].poster_path) continue;
                    $('.moviesList').append(`
                        <img class="showImg" 
                        src="${imagePath + response.cast[index].poster_path}"/>
                    `)
                    
                }
            }
    });
}

