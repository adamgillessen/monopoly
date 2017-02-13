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
 * Randomly generate a int in [0, max]
 * @param {int} max: Max number allowed to be generated
 * @returns {Number}
 */
function ranRange(max) {
    return parseInt(Math.random() * max);
}

function ranColor() {
    return "rgb(" + ranRange(255) + "," + ranRange(255) + "," + ranRange(255) + ")";
}

function createPlayers(num) {
    var template = '<div id="player-%d" class="player">%d</div>';

    for (var lop = 0; lop < num; lop++) {
        selectCell(0).append($(sprintf(template, lop, lop)));
    }

    $(".player").each(function () {
        $(this).css("background-color", function () {
            return "rgb(" + ranRange(255) + "," + ranRange(255) + "," + ranRange(255) + ")";
        });
    });
}

/**
 *
 * @param {int|undefined} from: id of cell from
 * @param {int} to: id of cell to
 * @param {int} player: player id
 */
function movePlayer(to, player, from) {
    selectPlayer(player).detach().appendTo(selectCell(to));
}