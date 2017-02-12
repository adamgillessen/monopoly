/**
 * Created by jeff on 07/02/2017.
 * WebSocket demo
 */

/**
 * Parser Class
 * Parse message received from server
 * @constructor
 */
function Parser() {
    this.tree = {
        "player_join_ack": function (data) {
            if (data["key"] === game.identification_number) {
                game.client_id = data['your_id'];

                showPlayerNum(data["current_player"], data["expects"]);
                if (data["start_game"]) {
                    startRound();
                }
            }
        }
    };

    Parser.prototype.parse = function (raw_data) {
        var data = JSON.parse(raw_data);

        this.tree[data["type"]](data);
    };
}

/**
 * Create a WebSocket connected to given IP:port
 * @param {string} ip
 * @param {string} port
 */
function createWebSocket(ip, port) {
    game.socket = new WebSocket(sprintf("ws://%s:%s", ip, port));
    game.socket.onmessage = function (e) {
        game.parser.parse(e.data);
    };

    game.socket.onopen = function () {
        game.socket.send(generatePlayerJoinMsg());
    };

    window.onbeforeunload = function() {
        game.socket.onclose = function () {}; // disable onclose handler first
        game.socket.close()
    };
}