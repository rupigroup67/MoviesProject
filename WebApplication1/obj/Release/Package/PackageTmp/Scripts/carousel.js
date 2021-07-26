// Gathering vars
const nextBtn = document.querySelector("#rightBTN");
const prevBtn = document.querySelector("#leftBTN");
const slider = document.querySelector('.slider');

// Data
let interval = 5000; // set the interval for 5 seconds as a default.
let counter = 0; // start the carousel from the first tv show
let animate;

$(document).ready(function () {
    moveToNextSlide();
    animateSlider();
    // When the user hovers on the coursel, it stops auto rotating as long as the mouse hovers it.
    slider.addEventListener("mouseenter", () => {
        clearInterval(animate);
        nextBtn.style.opacity = 1;
        prevBtn.style.opacity = 1;
    });
    // when mose leaves the carousel, it automaticly keeps on swiping to the next suggested tv show.
    slider.addEventListener("mouseleave", () => {
        animateSlider();
        nextBtn.style.opacity = 0;
        prevBtn.style.opacity = 0;
    });
    
});

// This function creates the animation for the slide, and makes it flows to the left each interation
const animateSlider = () => {
    animate = setInterval( () => {
        moveToNextSlide();
    }, interval);
}
// Automaticly, moveToNextSlide happens when interval passes. Also, if the user clicks on "next" button, it calls moveToNextSlide as well.
const moveToNextSlide = () => {
    if(counter >= document.querySelectorAll('.slide').length){
        counter = 0;
    }
    document.querySelector('#radio' + ++counter).checked = true;
}
// If user wants to see the previous tv show in the carousel, he can click on the "prevous" button and toggle moveToPrevSlide function to go back.
const moveToPrevSlide = () => {
    if(--counter <= 0){
        counter = document.querySelectorAll('.slide').length;
    }
    document.querySelector('#radio' + counter).checked = true;
}


