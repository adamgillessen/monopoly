/**
 * Created by jeff on 09/02/2017.
 */

/**
 * Used to update lobby display's info
 * @param current
 * @param expects
 */
function updatePlayerNum(current, expects) {
    if (current >= 2) {
        $("#btn-start-now").show();
    }

    $("#waiting").show();
    $("#connect-to").hide();

    $("#current").text(current);
    $("#expect").text(expects);
}

/**
 * Simple hide and show components
 */
function hideLobbyShowBoard() {
    $("#lobby").hide();
    $("#game-area").show();
}

function initUI() {
    $("#game-area").hide();
    $("#waiting").hide();
    $("#btn-start-now").hide();
    $(".your_turn").hide();
    $("#prompt-buy").hide();
    $("#btn-end-turn").hide();
}

$(document).ready(function () {
    initUI();

    $("#btn-connect").click(function () {
        var ip = $("#input-IP").val();
        var port = $("#input-port").val();

        game.connector.connect(ip, port);
    });

    $("#btn-start-now").click(function () {
        sendMessage(generateMessage("start_game_now", null));
    });
});