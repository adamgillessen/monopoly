/**
 * Created by jeff on 09/02/2017.
 */
"use strict";

/**
 * Used to update lobby display's info
 * @param {number} current
 * @param {number} expects
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
 * Simply hide and show components
 */
function hideLobbyShowBoard() {
    $("#lobby").hide();
    $("#game-area").show();

    // Show GO in detail pane
    selectSquareModel(0).showDetail();
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
        game.connector.sendMessage(generateMessage("start_game_now", null));
    });
});