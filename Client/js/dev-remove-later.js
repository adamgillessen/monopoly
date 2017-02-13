/**
 * Created by jeff on 13/02/2017.
 */

function simulateServerEvent(obj) {
    game.parser.receiveMsg(obj);
}

$(document).ready(function () {
    // todo: dev code, remove
    $("#btnCheat-pypassServer").click(function () {
        simulateServerEvent({
            type: "player_join_ack",
            key: -1,
            your_id: 1,
            current_player: 3,
            expects: 4,
            game_start: true
        });
    });

    $("#btnMyTurn").click(function () {
        game.viewController.yourTurn();
    });


});