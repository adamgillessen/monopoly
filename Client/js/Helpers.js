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
 * @param {int} source: Who generated this message ?
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

    var name = $("#cell-" + id + " span").text();
    var cell = game.model.selectCell(id);

    if (cell.type === "property") {
        $("#property").show();
        $("#action").hide();

        $("#property-banner").removeClass();
        $("#property-banner").addClass("cell-" + id);

        $("#property-id").text(cell.id);
        $("#property-name").text(name);

        if (cell.estate === -1) {
            $("#property-estate").text(" --- ");
        } else {
            $("#property-estate").text("Estate: " + cell.estate);
        }

        $("#property-price").text(cell.price);

        var owner = cell.owner;
        if (owner === -1) {
            $("#property-owner").text("ON SALE");
        } else {
            $("#property-owner").text("Owner: Player " + owner);
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
