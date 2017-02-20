/**
 * Created by jeff on 09/02/2017.
 */
"use strict";

/**
 * Used to update lobby display's info
 * @param current
 * @param expects
 */
function updatePlayerNum(current, expects) {
    if (current >= 2) {
        showButtons([BUTTONS.start_game_now]);
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

    // Show GO
    showCellDetail(0);
    // Show buttons
    showButtons([]);
}

function initUI() {
    $("#game-area").hide();
    $("#lobby").show();
    $("#waiting").hide();
    showButtons([BUTTONS.connect]);
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