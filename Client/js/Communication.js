/**
 * Created by jeff on 07/02/2017.
 * WebSocket demo
 */
"use strict";

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
        if (this.webSocket !== undefined) {
            this.webSocket.close();
            this.webSocket = undefined;
        }

        this.webSocket = new WebSocket(sprintf("ws://%s:%s", ip, port));

        this.webSocket.onmessage = function (e) {
            parseMessage(e.data);
        };

        this.webSocket.onopen = function (me) {
            return function () {
                me.sendMessage(generateMessage("player_join", null));
            }
        }(this);

        window.onbeforeunload = function (me) {
            return function () {
                // Clear onclose function
                me.webSocket.onclose = function () {
                };
                me.webSocket.close();
            };
        }(this);
    };

    /**
     * Send message to server
     * msg could be JSON string or JSON object
     * @param {string|Object} msg
     */
    Connector.prototype.sendMessage = function (msg) {
        if (typeof msg === "string") {
            this.webSocket.send(msg);
        } else {
            this.webSocket.send(JSON.stringify(msg));
        }
    }
}

/**
 * Parse message that received from server
 * data could be JSON object or JSON string
 * @param {Object|string} data
 */
function parseMessage(data) {
    parseMessage._parseTree = {
        "player_join_ack": function (data) {
            if (data["key"] === game.connector.key) {
                game.clientID = data['your_id'];
            }

            updatePlayerNum(data["current_player"], data["expects"]);
            if (data["game_start"]) {
                // Init first !
                game.initGame(parseInt(data["current_player"]));
                // Then change View
                // Because we are using data from game.model
                hideLobbyShowBoard();
            }
        },
        "board_sync": function (data) {
            // todo: show board sync text
            console.log(data);

            var listProperties = data["cells"];
            var lop = 0;
            var current = undefined;
            // Update property's owner
            for (lop in listProperties) {
                // Skip un-necessary property of object
                if (!listProperties.hasOwnProperty(lop)) {
                    continue;
                }

                current = listProperties[lop];

                // This is not a property
                if (game.model.selectCell(current["id"]).type !== "property") {
                    continue;
                }

                // Update owner
                game.model.selectCell(current["id"]).owner = current.owner;
            }

            var listPlayers = data["players"];

            // Update player's money and position
            for (lop in listPlayers) {
                if (!listPlayers.hasOwnProperty(lop)) {
                    continue;
                }

                current = listPlayers[lop];
                // Update money
                game.model.selectPlayer(current["id"]).setMoney(current["money"]);

                // Update position
                game.model.selectPlayer(current["id"]).moveTo(current["position"]);
            }
        },
        "your_turn": function (data) {
            if (game.isMyTurn(data["source"])) {
                ViewController.yourTurn();
            }
        },
        "roll_result": function (data) {
            // todo: show roll result

            // Update model
            var landedOn = game.model.movePlayer(data["source"], data["result"]);

            if (!game.isMyTurn(data["source"])) {
                return;
            }

            // What type of square player lands on?
            if (game.model.selectCell(landedOn).type === "action") {
                // Lands on Action square
                // todo: lands on Action square

                ViewController.preEndTurn();
            } else {
                // Lands on Property square

                // Who owns this property?
                switch (game.model.selectCell(landedOn).owner) {
                    case -1:
                        // Nobody
                        // Prompt buy options
                        ViewController.promptBuyWindow(landedOn);
                        break;
                    case game.clientID:
                        // Me
                        // Do nothing, Proceed to EOT
                        ViewController.preEndTurn();
                        break;
                    default:
                        // Others
                        // Do nothing, Proceed to EOT
                        ViewController.preEndTurn();
                        break;
                }
            }
        },
        "buy_ack": function (data) {
            // todo: show buy ack
        }
    };

    if (typeof data === "string") {
        data = JSON.parse(data);
    }
    (parseMessage._parseTree[data["type"]])(data);
}

/**
 * Generate some common field of a message
 * @param {string} type
 * @param {Array|null} include
 * @returns {{}}
 * @private
 */
function _generateHeader(type, include) {
    var obj = {};
    obj.type = type;

    if (include === null) {
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
}

/**
 *
 * @param {string} type
 * @param {Object|Array|null} parameter: Array of parameter to be added to message, or null for no addtional parameter
 * @returns {*}
 */
function generateMessage(type, parameter) {
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
}
