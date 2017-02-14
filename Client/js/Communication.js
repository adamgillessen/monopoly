/**
 * Created by jeff on 07/02/2017.
 * WebSocket demo
 */


function Connector() {
    this.webSocket = undefined;
    /**
     * Identify this client during player_join phase
     * @type {int}
     */
    this.key = undefined;

    /**
     * Connect to server by creating new WebSocket
     * @param {string} ip
     * @param {string} port
     */
    Connector.prototype.connect = function (ip, port) {
        if (this.webSocket != undefined) {
            this.webSocket.close();
            this.webSocket = undefined;
        }

        this.webSocket = new WebSocket(sprintf("ws://%s:%s", ip, port));

        this.webSocket.onmessage = function (e) {
            parseMessage(e.data);
        };

        this.webSocket.onopen = function () {
            sendMessage(generateMessage("player_join", null));
        };

        window.onbeforeunload = function (me) {
            return function () {
                // Clear onclose function
                me.webSocket.onclose = function () {
                };
                me.webSocket.close();
            };
        }(this);
    };
}

/**
 * Parse message that received from server
 * data could be JSON object or JSON string
 * @param {Object|string} data
 */
parseMessage = function (data) {
    parseMessage._parseTree = {
        "player_join_ack": function (data) {
            // Add player to board's model
            game.model.addPlayer(data["your_id"]);

            // todo: remove -2 part
            if (data["key"] === game.connector.key || data["key"] == -2) {
                game.clientID = data['your_id'];
            }

            updatePlayerNum(data["current_player"], data["expects"]);
            if (data["game_start"]) {
                hideLobbyShowBoard();
                game.initGame(parseInt(data["current_player"]));
            }
        },
        "board_sync": function (data) {
            //todo
        },
        "your_turn": function (data) {
            if (data["source"] === game.clientID) {
                game.viewController.yourTurn();
            }
        },
        "roll_result": function (data) {
            // todo: show roll result
            console.log(">>>>>\nRolled", (data["result"][0] + data["result"][1]));

            var landedOn = game.model.movePlayer(data);
            game.viewController.movePlayer(data["source"], landedOn);

            // todo
            if (game.model.selectCell(landedOn).type == "property") {
                game.viewController.promptBuyWindow(landedOn);
            } else {
                console.log(">>>>>\nLanded on action");
            }
        },
        "buy_ack": function (data) {
            // todo
            // Change balance of player
            game.model.selectPlayer(data["source"]).changeMoney(-game.model.selectCell(data["property"]).price);

            // Change owner of property
            game.model.selectCell(data["source"]).owner = data["source"];

            //console
            console.log(">>>>\nPlayer ", data["source"], " bought ", data["property"]);
        }
    };

    if (typeof data == "string") {
        data = JSON.parse(data);
    }
    // console
    console.log("Recv\n", data);
    (parseMessage._parseTree[data["type"]])(data);
};

/**
 * Send message to server
 * msg could be JSON string or JSON object
 * @param {string|Object} msg
 */
sendMessage = function (msg) {
    // console
    console.log("Sent\n", msg);

    if (typeof msg == "string") {
        game.connector.webSocket.send(msg);
    } else {
        game.connector.webSocket.send(JSON.stringify(msg));
    }
};

/**
 * Generate some common field of a message
 * @param {string} type
 * @param {Array|null} include
 * @returns {{}}
 * @private
 */
_generateHeader = function (type, include) {
    var obj = {};
    obj.type = type;

    if (include == null) {
        return obj;
    }

    for (var each in include) {
        switch (include[each]) {
            case "source":
                obj.source = game.clientID;
                break;
            default:
                break;
        }
    }

    return obj;
};

/**
 *
 * @param {string} type
 * @param {Object|Array|null} parameter: Array of parameter to be added to message, or null for no addtional parameter
 * @returns {*}
 */
generateMessage = function (type, parameter) {
    generateMessage._messageTree = {
        "start_game_now": function () {
            return _generateHeader("start_game_now", null);
        },
        "player_join": function () {
            game.connector.key = ranRange(10000);

            var ret = _generateHeader("player_join", null);
            ret.key = game.connector.key;

            return ret;
        },
        "roll": function () {
            return _generateHeader("roll", ["source"]);
        },
        "end_turn": function () {
            return _generateHeader("end_turn", ["source"]);
        },
        /**
         * @param {Object} parameter
         * @returns {{type: string, source: int, property: int}|*}
         */
        "buy": function (parameter) {
            var ret = _generateHeader("buy", ["source"]);
            ret.property = parameter.property;

            return ret;
        }
    };

    return generateMessage._messageTree[type](parameter);
};
