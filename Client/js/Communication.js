/**
 * Created by jeff on 07/02/2017.
 * WebSocket demo
 */
"use strict";

function Connector() {
    this.webSocket = undefined;
    /**
     * Identify this client during player_join phase
     * @type {number}
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
    if (parseMessage._parseTree === undefined) {
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
                var listProperties = data["cells"];
                var listPlayers = data["players"];
                var lop;
                var current;

                // Clear property list
                game.model.propertiesOwnedByThisPlayer = [];

                // Update property's owner
                for (lop in listProperties) {
                    // Skip un-necessary property of object
                    if (!listProperties.hasOwnProperty(lop)) {
                        continue;
                    }

                    current = listProperties[lop];

                    // This is not a property or UTIL or TRANS
                    if (!selectSquareModel(current["id"]).isBaseProperty()) {
                        continue;
                    }

                    // Update owner
                    selectSquareModel(current["id"]).setOwner(current.owner);

                    if (game.isThisClient(current.owner)) {
                        game.model.propertiesOwnedByThisPlayer.push(current["id"]);
                    }
                }

                // Update player's money and position
                for (lop in listPlayers) {
                    if (!listPlayers.hasOwnProperty(lop)) {
                        continue;
                    }

                    current = listPlayers[lop];
                    // Update money
                    selectPlayerModel(current["id"]).setMoney(current["money"]);

                    // Update position
                    selectPlayerModel(current["id"]).setPosition(current["position"]);

                    // Is in jail?
                    selectPlayerModel(current["id"]).setJail(current["is_in_jail"]);

                    // Has get out of jail card?
                    selectPlayerModel(current["id"]).setCard(current["has_card"]);
                }
            },
            "your_turn": function (data) {
                var turnOfID = data["source"];
                game.currentTurn = turnOfID;

                if (game.isMyTurn()) {
                    if (getThisPlayerModel().inJail) {
                        log("You are in jail", 5);
                    }

                    if (game.doubleRoll) {
                        game.doubleRoll = false;
                        log("You rolled double\nKeep rolling!", turnOfID);
                    } else {
                        log("Your turn!", turnOfID);
                    }

                    ViewController.yourTurn();
                } else {
                    log(sprintf("Player %d's turn!", turnOfID), turnOfID);
                }
            },
            "roll_result": function (data) {
                var source = data["source"];
                var result = data["result"];

                if (game.isMyTurn() && getThisPlayerModel().inJail) {
                    if (result[0] !== result[1]) {
                        log(sprintf("You rolled (%d %d), you're still in Jail", result[0], result[1]), source);
                        ViewController.preEndTurn();
                        return;
                    } else {
                        log(sprintf("You're FREE!", result[0], result[1]), source);
                        getThisPlayerModel().setJail(false);
                    }
                }

                // Update model
                var landedOn = game.model.movePlayer(source, result);

                if (result[0] + result[1] !== 0) {
                    // Log result to chat window
                    if (game.isMyTurn()) {
                        log(sprintf("You rolled (%d %d), landed on %d", result[0], result[1], landedOn), source);
                    } else {
                        log(sprintf("Player %d rolled (%d %d), landed on %d", source, result[0], result[1], landedOn), source);
                    }
                }

                // Do nothing if its not your turn
                if (!game.isMyTurn()) {
                    return;
                }

                // Rolled double?
                if (result[0] === result[1] && result[0] + result[1] !== 0) {
                    game.doubleRoll = true;
                }

                // What type of square player lands on?
                if (!selectSquareModel(landedOn).isBaseProperty()) {
                    // Lands on Action square
                    ViewController.preEndTurn();
                } else {
                    // Lands on Property square

                    // Who owns this property?
                    switch (selectSquareModel(landedOn).owner) {
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
                            // Pay tax
                            ViewController.preEndTurn();
                            break;
                    }
                }
            },
            "buy_ack": function (data) {
                var source = data["source"];
                var property = data["property"];

                var price = selectSquareModel(property).price;

                // Change money value first
                selectPlayerModel(source).changeMoney(-selectSquareModel(property).price);
                // Change property owner, too
                selectSquareModel(property).setOwner(source);


                if (game.isThisClient(source)) {
                    log(sprintf("You have bought Property %d for £%d", property, price), source);
                } else {
                    log(sprintf("Player %d has bought Property %d for £%d", source, property, price), source);
                }
            },
            "auction_start": function (data) {
                var source = data["source"];
                var property = data["property"];
                var list = data["competitor"];
                var basePrice = data["base_price"];

                if (source === -1) {
                    log("Two or more players have placed the same bid, Auction starts over again", 5);
                } else if (game.isThisClient(source)) {
                    log(sprintf("You have started an Auction on Property %d!", property), source);
                } else {
                    log(sprintf("Player %d has started an Auction on Property %d!", source, property), source);
                }

                log("Base price is " + basePrice, 5);

                if (list.indexOf(game.clientID) >= 0) {
                    // You should bid
                    log("Place your bid!", 5);
                } else {
                    // Just watch
                    log("Please wait while others placing bids", 5);
                }

                // Change button
                ViewController.promptAuctionWindow(data);
            },
            "auction_bid_ack": function (data) {
                var source = data["source"];

                if (!game.isThisClient(source)) {
                    log("Player " + source + " has placed his bid", source);
                }
            },
            "auction_finished": function (data) {
                var winner = data["winner"];
                var property = data["property"];
                var price = data["price"];

                if (game.isThisClient(winner)) {
                    log(sprintf("You have bought Property %d for £%d", property, price), winner);
                } else {
                    log(sprintf("Player %s has bought Property %d for £%d", winner, property, price), winner);
                }

                // Change price and property's owner
                selectPlayerModel(winner).changeMoney(-price);
                selectSquareModel(property).setOwner(winner);

                game.endAuction(data);
            },
            "chat_sync": function (data) {
                var source = data.source;
                var text = data.text;

                if (game.isThisClient(source)) {
                    log("You:\n" + text, source);
                } else {
                    var template = "Player %d:\n%s";
                    log(sprintf(template, source, text), source);
                }
            },
            "player_lose": function (data) {
                var player = data["player"];

                if (game.isThisClient(player)) {
                    // todo: player lose, do something
                    alert("GAME OVER!\nYou lose!");
                }
            },
            "textual_update": function (data) {
                log(data["text"], 5);
            },
            "build_ack": function (data) {
                var source = data["source"];
                var property = data["property"];
                var currentRent = data["current_rent"];

                if (game.isThisClient(source)) {
                    log("You have built a house on Property " + property, source);
                } else {
                    log(sprintf("Player %d has built a house on Property %d", source, property), source);
                }

                selectSquareModel(property).setRent(currentRent);
                selectSquareModel(property).build();
            }
        };
    }


    if (typeof data === "string") {
        data = JSON.parse(data);
    }

    try {
        (parseMessage._parseTree[data["type"]])(data);
    } catch (e) {
        console.log(e);
        console.log(data);
    }
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
        },
        /**
         * Build house message
         * @param {object} parameter
         */
        "build_house": function (parameter) {
            var ret = _generateHeader("build_house", ["source"]);
            ret.property = parameter.property;

            return ret;
        }
    };

    return generateMessage._messageTree[type](parameter);
}
