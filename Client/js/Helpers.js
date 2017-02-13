/**
 * Created by jeff on 09/02/2017.
 */

/**
 * Return jQuery object selected by given id
 * @param {int} id
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
