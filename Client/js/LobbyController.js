/**
 * Created by jeff on 09/02/2017.
 */

/**
 * Used to update lobby display's info
 * @param current
 * @param expects
 */
function updatePlayerNum(current, expects) {
    $("#waiting").show();
    $("#connect-to").hide();

    $("#current").text(current);
    $("#expect").text(expects);
}

/**
 * Simple hide and show components
 */
function startRound() {
    $("#lobby").hide();
    $("#game-area").show();
}

$(document).ready(function () {
    $("#game-area").hide();
    $("#control-pane").hide();
    $("#waiting").hide();

    $("#btnConnect").click(function () {
        if (game.socket !== undefined) {
            game.socket.close();
            game.socket = undefined;
        }

        var ip = $("#input-IP").val();
        var port = $("#input-port").val();

        createWebSocket(ip, port);
    });

    $("#btnJumpstart").click(function () {
        sendMessage(getMsgFunc("start_game_now")());
    });
});