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
            // todo: remove -1 part
            if (data["key"] === game.identification_number || data["key"] === -1) {
                game.client_id = data['your_id'];
            }

            updatePlayerNum(data["current_player"], data["expects"]);
            if (data["game_start"]) {
                startRound();
            }
        },
        "your_turn": function (data) {
            if (data["player"] === game.client_id) {
                game.viewController.yourTurn();
            }
        }
    };

    Parser.prototype.call = function (jsonObj) {
        console.log(jsonObj);
        console.log(game.identification_number);
        this.tree[jsonObj["type"]](jsonObj);
    };

    Parser.prototype.parse = function (raw_data) {
        var jsonObj = JSON.parse(raw_data);
        this.call(jsonObj);
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
        game.socket.send(generateMsg("player_join"));
    };

    window.onbeforeunload = function () {
        game.socket.onclose = function () {
        }; // disable onclose handler first
        game.socket.close();
    };
}

function sendMessage(msg) {
    console.log("Sending: \n" + msg);
    game.socket.send(msg);
}

function generateMsg(type) {
    generateMsg.message = {
        "player_join": function () {
            // todo: random this
            game.identification_number = 1234;

            return {
                type: "player_join",
                key: game.identification_number
            };
        },
        "roll": function () {
            console.log(game.client_id);
            return {
                type: "roll",
                client: game.client_id
            };
        }
    };

    return JSON.stringify(generateMsg.message[type]());
}