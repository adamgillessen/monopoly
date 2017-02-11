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
    game_controller.identification_number = 123456;

    var msg = {};
    msg["type"] = "player_join";
    msg["key"] = game_controller.identification_number;

    return JSON.stringify(msg);
}

$(document).ready(function () {
    $("#game-area").hide();
    $("#waiting").hide();

    $("#btnConnect").click(function () {
        if (game_controller.socket != undefined) {
            game_controller.socket.close();
            game_controller.socket = undefined;
        }

        var ip = $("#input-IP").val();
        var port = $("#input-port").val();

        create_websocket(ip, port);

        // Simulate server event
        // showPlayerNum(1, 4);

        // Simulate server event
        // More players comes in
        // setTimeout(function () {
        //     showPlayerNum(2, 4)
        // }, 1000);

        // Simulate server event
        // setTimeout(startRound, 500);
    });
});