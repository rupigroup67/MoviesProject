$(document).ready(function () {
    addEntry();
});

// generes holds all generes as a dictonary
const genresDict = {
    10759: "Action & Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western"
}

// CreateCircle creates the rating feature inside the poster in each tvshow card
const CreateCircle = (precentage) => {
    tempPrecentage = Math.round(precentage / 3.2);
    let color;
    switch (tempPrecentage) {
        case 0:
            color = 'red';
            break;
        case 1:
            color = 'orange';
            break;
        case 2:
            color = 'yellow';
            break;
        case 3:
        case 4:
            color = 'green';
            break;
            console.log(color);

        default:
            break;
    }
    return `<div class="precentage">
           <div class="c100 p${precentage * 10} small ${color}">
                 <span class="tvshowrate">${precentage}</span>
             <div class="slice">
                 <div class="bar"></div>
                     <div class="fill"></div>
                 </div>
            </div>
         </div>`;
}

// showWelcomeText simply shows hi message at the homepage depends on the time + with the users name
const showWelcomeText = () => {
    if (!localStorage.loggedUser)
        document.querySelector("#nameWelcoming").innerHTML = `${TimeToText()}`;
    else
        document.querySelector("#nameWelcoming").innerHTML = `${TimeToText()}, ${user.Name}`;
}

// TimeToText converts the current time into text and returns greet
const TimeToText = () => {
    let myDate = new Date();
    let hrs = myDate.getHours();
    let greet;
    if (hrs < 12)
        greet = 'Good morning';
    else if (hrs >= 12 && hrs <= 17)
        greet = 'Good afternoon';
    else if (hrs >= 17 && hrs <= 24)
        greet = 'Good evening';
    return greet;
}

// addEnrty updates the firebase and adds an entry so the admin can have statistics about the website usage
const addEntry = () => {
    let userId = -1;
    if (localStorage.loggedUser) {
        userId = JSON.parse(localStorage.loggedUser).Id
        if (JSON.parse(localStorage.loggedUser).Type == 1)
            return;
    }

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy;

    ref = firebase.database().ref("Entries").child(today).child(userId);
    ref.push().set({
        'currentDate': new Date().toJSON(),
    })
}

