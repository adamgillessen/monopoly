/**
 * Created by jeff on 13/02/2017.
 */

function simulateServerEvent(obj) {
    parseMessage(obj);
}

$(document).ready(function () {
    $("#btnCheat-pypassServer").click(function () {
        simulateServerEvent({
            type: "player_join_ack",
            key: -2,
            your_id: 0,
            current_player: 1,
            expects: 4,
            game_start: true
        });
    });

    $("#btnYourTurn").click(function () {
        game.viewController.yourTurn();
    });

    $("#btnRollResult").click(function () {
        simulateServerEvent({
            "type": "roll_result",
            "source": 0,
            "result": [3, 4]
        });
    });
});