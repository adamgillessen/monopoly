/**
 * Created by jeff on 09/02/2017.
 */
"use strict";

/**
 * Return jQuery object selected by given id
 * @param {int} id: No.0 to No.3
 * @returns {*|jQuery|HTMLElement}
 */
function selectCell(id) {
    return $("#cell-" + id);
}

/**
 * Return jQuery object selected by given id
 * @param {int} id
 * @returns {*|jQuery|HTMLElement}
 */
function selectPlayer(id) {
    return $("#player-" + id);
}

function selectCellModel(id) {
    return game.model.selectCell(id);
}

function selectPlayerModel(id) {
    return game.model.selectPlayer(id);
}

/**
 * Set value in HTML
 * @param {string} name
 * @param {string | Number} value
 */
function setContextValue(name, value) {
    $("#context-" + name).text(value);
}

/**
 * Get value from HTML, and clear the HTML
 * @param {string} name
 * @returns {string}
 */
function getContextValue(name) {
    var DOM = $("#context-" + name);
    var tmp = DOM.text();
    DOM.text("");
    return tmp;
}

function updateScroll() {
    var element = document.getElementById("log-area");
    element.scrollTop = element.scrollHeight;
}

/**
 * Log things to log-area in HTML
 * @param {string} obj
 * @param {int} source: Who generated this message ? If a message has a source field, pass it to this parameter
 */
function log(obj, source) {
    if (obj === null || obj === undefined || typeof obj !== "string") {
        console.log("Invalid log parameter", obj);
        return;
    }

    // Split strings by "\n"
    var arrStrings = obj.split(/\n/);

    var templateDivParent = '<div class="log %s"></div>';
    var classTable = {
        1: "player1",
        2: "player2",
        3: "player3",
        4: "player4",
        5: "server"
    };
    var divCurrentLog = $(sprintf(templateDivParent, classTable[source]));

    var lop = 0;
    for (; lop < arrStrings.length; lop++) {
        $(sprintf('<div class="each-line">%s</div>', arrStrings[lop])).appendTo(divCurrentLog);
    }

    divCurrentLog.appendTo("#log-area");

    updateScroll();
}

/**
 * Show details of a given cell to the detail-pane section in HTML
 * @param {int} id
 */
function showCellDetail(id) {
    ViewController.currentSelectedSquare = id;

    var name = ViewController.tableName[id];
    var cell = game.model.selectCell(id);

    if (cell.type === "property") {
        $("#property").show();
        $("#action").hide();
        $("#property-controls").hide();

        $("#property-banner").removeClass();
        $("#property-banner").addClass("cell-" + id);

        $("#property-id").text(cell.id);
        $("#property-name").text(name);

        if (cell.estate === -1) {
            $("#property-estate").text(" --- ");
        } else {
            $("#property-estate").text("Estate: " + cell.estate);
        }

        $("#property-price").text("£" + cell.price);

        var owner = cell.owner;
        if (owner === -1) {
            $("#property-owner").text("ON SALE");
        } else {
            if (game.isSource(owner)) {
                $("#property-owner").text("Owner: You");
                $("#property-controls").show();
            } else {
                $("#property-owner").text("Owner: Player " + owner);
                $("#property-controls").hide();
            }
        }
    } else {
        $("#action").show();
        $("#property").hide();

        $("#action-banner").removeClass();
        $("#action-banner").addClass("cell-" + id);

        $("#action-id").text(cell.id);
        $("#action-description").text(name);
    }
}

var BUTTONS = {
    connect: "#btn-connect",
    start_game_now: "#btn-start-now",
    roll: "#btn-roll",
    end_turn: "#btn-end-turn",
    buy_options: "#prompt-buy"
};

/**
 * Show given button
 * @param {[BUTTONS]} buttons
 */
function showButtons(buttons) {
    // Hide all buttons first
    for (var key in BUTTONS) {
        if (BUTTONS.hasOwnProperty(key)) {
            $(BUTTONS[key]).hide();
        }
    }

    if (buttons === null || buttons === undefined) {
        return;
    }

    // Show given ones
    var lop = 0;
    for (; lop < buttons.length; lop++) {
        $(buttons[lop]).show();
    }
}

/**
 * Function to be executed when the button in the chat window is clicked
 */
function chatButtonClicked() {
    var stringVal = $("#input-chat").val();
    if (stringVal === null || stringVal === undefined || stringVal.length === 0) {
        return;
    }
    // Clear input field
    $("#input-chat").val("");

    if (game.state === GAME_STATE.AUCTION && game.auctionHandler.state === AUCTION_STATE.YOU_BID) {
        try {
            var price = parseInt(stringVal);
        } catch (err) {
            log("Please enter valid integer!", 5);
        }

        var bid = game.auctionHandler.bid(price);

        log("You have placed bid: " + bid, game.clientID);
    } else {
        // Send Chat
        game.connector.sendMessage(generateMessage("chat", {
            text: stringVal
        }));
    }
}

/**
 * Add element to Inventory pane in HTML
 *
 * @param {int} id: ID of property, if ID === 41, it means "Get out of Jail free" card
 */
function addToInventory(id) {
    function addEachToInventory(id) {
        var templateProperty = '<div class="owned">' +
            '<div class="square cell-%d">%d</div>' +
            '<div class="placename">%s</div>' +
            '</div>';
        // todo
        // Get out of jail card

        var current = $(sprintf(templateProperty, id, id, ViewController.tableName[id]));
        current.appendTo('#inventory');

        // Click item in Inventory Pane
        current.click(function () {
            var id = $(this).children(".square").text();
            showCellDetail(id);
        });
    }

    game.model.propertiesOwnedByThisPlayer.push(id);
    game.model.propertiesOwnedByThisPlayer.sort(function (a, b) {
        return a > b;
    });

    // Clear all
    $(".owned").remove();

    for (var lop = 0; lop < game.model.propertiesOwnedByThisPlayer.length; lop++) {
        addEachToInventory(game.model.propertiesOwnedByThisPlayer[lop]);
    }
}

/**
 * Randomly generate a int from range [0, max]
 * @param {int} max: Max number allowed to be generated
 * @returns {int} integer in range [0, max)
 */
function ranRange(max) {
    return parseInt(Math.random() * max);
}

/**
 * Random color
 * @return {string} "rgb(x, y, z)"
 */
function ranColor() {
    return "rgb(" + ranRange(255) + "," + ranRange(255) + "," + ranRange(255) + ")";
}
