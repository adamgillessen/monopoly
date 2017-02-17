/**
 * Created by jeff on 13/02/2017.
 */
"use strict";

function simulateServerEvent(obj) {
    parseMessage(obj);
}

function getTargetID() {
    return parseInt($("#input-id").val());
}

$(document).ready(function () {
    $("#btn-player-join-ack").click(function () {
        simulateServerEvent({
            type: "player_join_ack",
            key: -2,
            your_id: getTargetID(),
            current_player: 1,
            expects: 4,
            game_start: false
        });
        simulateServerEvent({
            type: "player_join_ack",
            key: -3,
            your_id: getTargetID() + 1,
            current_player: 2,
            expects: 4,
            game_start: true
        });
    });

    $("#btn-your-turn").click(function () {
        // game.viewController.yourTurn();
        simulateServerEvent({
            type: "your_turn",
            source: getTargetID()
        });
    });

    $("#btn-roll-result").click(function () {
        simulateServerEvent({
            type: "roll_result",
            source: getTargetID(),
            result: [2, 4]
        });
    });

    $("#btn-buy-ack").click(function () {
        simulateServerEvent({
            type: "buy_ack",
            source: getTargetID(),
            property: 6
        });
    });
});