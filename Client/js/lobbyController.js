/**
 * Created by jeff on 09/02/2017.
 */

function showPlayerNum(current, expects) {
    $("#waiting").show();
    $("#connect-to").hide();

    $("#current").text(current);
    $("#expect").text(expects);
}

function startRound() {
    $("#lobby").hide();
    $("#game-area").show();
}

function generatePlayerJoinMsg() {
    // todo:Random this!
    game.identification_number = 123456;

    var msg = {};
    msg["type"] = "player_join";
    msg["key"] = game.identification_number;

    return JSON.stringify(msg);
}

$(document).ready(function () {
    $("#game-area").hide();
    $("#waiting").hide();

    // todo: dev code, remove
    $("#btnCheat-pypassServer").click(function () {
        startRound();
    });

    $("#btnConnect").click(function () {
        if (game.socket != undefined) {
            game.socket.close();
            game.socket = undefined;
        }

        var ip = $("#input-IP").val();
        var port = $("#input-port").val();

        createWebSocket(ip, port);
    });
});