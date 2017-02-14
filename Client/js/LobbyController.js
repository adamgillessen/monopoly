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
        $("#btnJumpstart").show();
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

$(document).ready(function () {
    $("#game-area").hide();
    $("#waiting").hide();
    $("#btnJumpstart").hide();
    $(".your_turn").hide();

    $("#btnConnect").click(function () {
        var ip = $("#input-IP").val();
        var port = $("#input-port").val();

        game.connector.connect(ip, port);
    });

    $("#btnJumpstart").click(function () {
        sendMessage(generateMessage("start_game_now", null));
    });
});