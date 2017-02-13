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
        "board_sync": function (data) {
            //todo
        },
        "your_turn": function (data) {
            if (data["source"] === game.client_id) {
                game.viewController.yourTurn();
            }
        },
        "roll_result": function (data) {
            // todo: Show result
            if (data["source"] === game.client_id) {
                // todo: move player
            } else {
                // todo: update player
            }
        },
        "buy_ack": function (data) {
            // todo: Show result
        }
    };

    /**
     * Execute functions based on type of message received
     * @param jsonObj
     */
    Parser.prototype.receiveMsg = function (jsonObj) {
        this.tree[jsonObj["type"]](jsonObj);
    };

    /**
     * Turn JSON string into javascript-compatible object
     * @param raw_data
     */
    Parser.prototype.parse = function (raw_data) {
        var jsonObj = JSON.parse(raw_data);
        this.receiveMsg(jsonObj);
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
        sendMessage(getMsgFunc("player_join")());
    };

    window.onbeforeunload = function () {
        game.socket.onclose = function () {
        }; // disable onclose handler first
        game.socket.close();
    };
}

/**
 * send message to server
 * @param {string|object} msg
 */
function sendMessage(msg) {
    if (typeof msg == "string") {
        game.socket.send(msg);
    } else {
        game.socket.send(JSON.stringify(msg));
    }

}

// todo: write into a Class
/**
 * Return function that generates message obj
 * @param type
 * @returns {*}
 */
function getMsgFunc(type) {
    /**
     * Generate common part of message
     * @param {string} type
     * @param {Array} include
     * @returns {*}
     */
    getMsgFunc.generateHeader = function (type, include) {
        var obj = {};
        obj.type = type;

        for (var each in include) {
            switch (include[each]) {
                case "source":
                    obj.source = game.client_id;
                    break;
                default:
                    break;
            }
        }

        return obj;
    };

    getMsgFunc.message = {
        "player_join": function () {
            game.identification_number = ranRange(10000);

            var ret = getMsgFunc.generateHeader("player_join", []);
            ret.key = game.identification_number;

            return ret;
        },
        "roll": function () {
            return getMsgFunc.generateHeader("roll", ["source"]);
        },
        "end_turn": function () {
            return getMsgFunc.generateHeader("end_turn", ["source"]);
        },
        /**
         * @param {int} property
         * @returns {{type: string, source: int, property: int}}
         */
        "buy": function (property) {
            var ret = getMsgFunc.generateHeader("buy", ["source"]);
            ret.property = property;

            return ret;
        }
    };

    return getMsgFunc.message[type];
}