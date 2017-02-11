/**
 * Created by jeff on 07/02/2017.
 * WebSocket demo
 */

/**
 * Global variables
 */
var parser = new Parser();

/**
 * Parser Class
 * Parse message received from server
 * @constructor
 */
function Parser() {
    this.tree = {
        "player_join_ack": function (data) {
            if (data["key"] === game_controller.identification_number) {
                game_controller.client_id = data['your_id'];

                showPlayerNum(data["current_player"], data["expects"]);
                if (data["start_game"]) {
                    startRound();
                }
            }
        }
    };

    this.parse = function (raw_data) {
        var data = JSON.parse(raw_data);

        this.tree[data["type"]](data);
    };
}

function create_websocket(ip, port) {
    game_controller.socket = new WebSocket(sprintf("ws://%s:%s", ip, port));
    game_controller.socket.onmessage = function (e) {
        parser.parse(e.data);
    };

    game_controller.socket.onopen = function () {
        game_controller.socket.send(generatePlayerJoinMsg());
    };

    window.onbeforeunload = function() {
        game_controller.socket.onclose = function () {}; // disable onclose handler first
        game_controller.socket.close()
    };
}

$(document).ready(function () {

});