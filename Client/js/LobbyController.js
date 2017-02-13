/**
 * Created by jeff on 09/02/2017.
 */

function updatePlayerNum(current, expects) {
    $("#waiting").show();
    $("#connect-to").hide();

    $("#current").text(current);
    $("#expect").text(expects);
}

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
});