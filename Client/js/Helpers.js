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

function setContextValue(name, value) {
    $("#context-" + name).text(value);
}

function getContextValue(name) {
    var DOM = $("#context-" + name);
    var tmp = DOM.text();
    DOM.text("");
    return tmp;
}

/**
 * Show details of a given cell to the detail-pane section in HTML
 * @param {int} id
 */
function showCellDetail(id) {
    var cell = game.model.selectCell(id);
    if (cell.type === "property") {
        $("#property").show();
        $("#action").hide();

        $("#pane-property-id").text(cell.id);
        $("#pane-property-name").text("TBD: Property");
        $("#pane-property-estate").text(cell.estate);
        $("#pane-property-price").text(cell.price);
        var owner = cell.owner;
        if (owner === -1) {
            $("#pane-property-owner").text("No owner");
        } else {
            $("#pane-property-owner").text(owner);
        }
    } else {
        $("#action").show();
        $("#property").hide();

        $("#pane-action-id").text(cell.id);
        $("#pane-action-decrip").text("Still empty");
    }
}

/**
 * Randomly generate a int from range [0, max]
 * @param {int} max: Max number allowed to be generated
 * @returns {int}
 */
function ranRange(max) {
    return parseInt(Math.random() * max);
}

function ranColor() {
    return "rgb(" + ranRange(255) + "," + ranRange(255) + "," + ranRange(255) + ")";
}
