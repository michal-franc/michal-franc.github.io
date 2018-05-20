// leadpages_input_data variables come from the template.json "variables" section
var leadpages_input_data = {};

// CUSTOM JQUERY FUNCTIONALITY
$(function () {

    // Set the date we're counting down to
    var countDownDate = new Date("November 24, 2017 18:00:00").getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        document.getElementById("days").innerHTML = days;
        document.getElementById("hours").innerHTML = hours;
        document.getElementById("minutes").innerHTML = minutes;
        document.getElementById("seconds").innerHTML = seconds;
    }, 1000);

    function hostTitleCenter() {
        if ( $( '.header_host' ).is( ':hidden' ) ) {
                $( '.header_title' ).css('text-align', 'center');
        }
        else {
            if ( $( '.header_host' ).length > 0 ) {
                $( '.header_title' ).css( 'text-align', '' );
            } 
            else {
                $( '.header_title' ).css('text-align', 'center');
            }
        }
    }

    /* Either run the DOM update functions once for a published page or continuously for within the builder. */
    if ( typeof window.top.App === 'undefined' ) {
        // Published page
        $(window).on('load', function(){
            hostTitleCenter();
        });
    } else {
        // within the builder
        setInterval( function(){
            hostTitleCenter();
        }, 250);
    }



});
