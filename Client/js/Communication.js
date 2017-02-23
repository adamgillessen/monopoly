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
}

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
        };
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
};


/**
 * Parse message that received from server and excute codes accordingly
 * @param {Object|string} data: could be JSON object or JSON string
 */
function parseMessage(data) {
    parseMessage._parseTree = {
        "player_join_ack": function (data) {
            var key = data["key"];
            var yourID = data['your_id'];
            var currentPlayer = data["current_player"];
            var expects = data["expects"];
            var hasGameStarted = data["game_start"];

            if (key === game.connector.key) {
                game.clientID = yourID;
            }

            updatePlayerNum(currentPlayer, expects);
            if (hasGameStarted) {
                // Init model first !
                game.initGame(currentPlayer);

                // Then change View
                // Because we are using data from game.model
                hideLobbyShowBoard();
            }
        },
        "board_sync": function (data) {
            if ("text" in data) {
                log(data["text"], 5);
            }

            var listProperties = data["cells"];
            var listPlayers = data["players"];
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
            var turnOfID = data["source"];
            game.currentTurn = turnOfID;

            if (game.isMyTurn()) {
                log("You turn!", turnOfID);
                ViewController.yourTurn();
            } else {
                log(sprintf("Player %d's turn!", turnOfID), turnOfID);
            }
        },
        "roll_result": function (data) {
            var source = data["source"];
            var result = data["result"];

            // Log roll result to log-area
            if (game.isMyTurn()) {
                log("You just rolled " + result, source);
            } else {
                log(sprintf("Player %d rolled ", source) + result, source);
            }

            // Update model
            var landedOn = game.model.movePlayer(source, result);

            if (game.isMyTurn()) {
                log(sprintf("You landed on %d", landedOn), source);
            } else {
                log(sprintf("Player %d landed on %d", source, landedOn), source);
            }

            if (!game.isMyTurn()) {
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
            var source = data["source"];
            var property = data["property"];

            var price = game.model.selectCell(property).price;

            if (game.isSource(source)) {
                log(sprintf("You have bought Property %d for %d", property, price), source);
            } else {
                log(sprintf("Player %d has bough Property %d for %d", source, property, price), source);
            }
        },
        "auction_start": function (data) {
            var source = data["source"];
            var property = data["property"];
            var list = data["competitor"];

            if (game.isSource(source)) {
                log(sprintf("You have started an Auction on Property %d!", property), source);
            } else {
                log(sprintf("Player %d has started an Auction on Property %d!", source, property), source);
            }

            log("Place your bid!", 5);

            // Change button
            ViewController.promptAuctionWindow(data);
        },
        "auction_bid_ack": function (data) {
            var source = data["source"];

            if (!game.isSource(source)) {
                log("Player " + source + " has placed his bid", source);
            }
        },
        "auction_finished": function (data) {
            var winner = data["winner"];
            var property = data["property"];
            var price = data["price"];

            if (game.isSource(winner)) {
                log(sprintf("You have bought Property %d for %d", property, price), 5);
            } else {
                log(sprintf("Player %s has bought Property %d for %d", winner, property, price), 5);
            }

            game.model.selectPlayer(winner).changeMoney(-price);
            game.model.selectCell(property).changeOwner(winner);

            game.endAuction(data);
        },
        "chat_sync": function (data) {
            var source = data.source;
            var text = data.text;

            log(text, source);
        }
    };

    if (typeof data === "string") {
        data = JSON.parse(data);
    }
    (parseMessage._parseTree[data["type"]])(data);
}

/**
 * Generate some common fields of a message
 * Like "type" and "source"
 * @param {string} type
 * @param {Array|null} include
 * @returns {{}}
 */
function _generateHeader(type, include) {
    var obj = {
        type: type
    };

    if (include === null || include === undefined) {
        return obj;
    }

    for (var each in include) {
        if (!include.hasOwnProperty(each)) {
            continue;
        }

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
 * Generate messages, given type and parameter to be included in the message
 * @param {string} type
 * @param {Object|Array|null} parameter: Array of parameter to be added to message, or null for no addtional parameter
 * @returns {*} message object
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
        },
        "auction": function (parameter) {
            var ret = _generateHeader("auction", ["source"]);
            ret.property = parameter.property;

            return ret;
        },
        "auction_bid": function (parameter) {
            var ret = _generateHeader("auction_bid", ["source"]);
            ret.price = parameter.price;

            return ret;
        },
        "chat": function (parameter) {
            var ret = _generateHeader("chat", ["source"]);
            ret.text = parameter.text;

            return ret;
        }
    };

    return generateMessage._messageTree[type](parameter);
}
