/**
 * Created by jeff on 09/02/2017.
 */

function lobby() {
    console.log("I am called");
}

$(document).ready(function () {
    $("#game-area").hide();
    $("#waiting").hide();

    $("#connect-to button").click(function () {
        $("#waiting").show();
        $("#connect-to").hide();

        // Simulate server event
        showPlayerNum(1, 4);

        // Simulate server event
        // More players comes in
        // setTimeout(function () {
        //     showPlayerNum(2, 4)
        // }, 1000);

        // Simulate server event
        setTimeout(startRound, 500);
    });

    function showPlayerNum(current, expects) {
        $("#current").text(current);
        $("#expect").text(expects);
    }

    function startRound() {
        $("#lobby").hide();
        $("#game-area").show();
    }
});