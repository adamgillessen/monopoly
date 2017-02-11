/**
 * Created by nooje on 2/8/2017.
 */

/**
 * Model
 * @constructor
 */
function Board() {
    // A list holds all cells info
    this.cells = {};
    // A list holds all players info
    this.players = {};

    // Simulate server
    this.randomlyGenerateCells = function () {
        var list_properties = [1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39];

        var property_id = 0;
        var action_id = 0;

        for (var lop = 0; lop < 40; lop++) {
            if (list_properties.indexOf(lop) > -1) {
                // is a property
                this.cells[lop] = new Property(lop, property_id++);
            } else {
                this.cells[lop] = new Action(lop, action_id++);
            }
        }
    };

    this.add_all_players = function (num) {
        createPlayers(num);

        for (var lop = 0; lop < num; lop++) {
            this.players[lop] = new Player(lop);
        }
    };

    /**
     *
     * @param {int} id
     * @returns {Player}
     */
    this.selectPlayer = function (id) {
        return this.players[id];
    };

    /**
     * Return ID of cell where the player lands
     * @param {int} id
     */
    this.playerAt = function (id) {
        return this.players[id].position;
    }
}

/**
 * Model
 * @param cell_id
 * @param property_id
 * @constructor
 */
function Property(cell_id, property_id) {
    // An unique ID for every cell
    // Also represents the position on board
    this.id = cell_id;
    this.type = "property";

    // Property specific fields
    this.property_id = property_id;
    this.price = 100;
    /*
     -1: Nobody
     [0, N]: Player ID
     */
    this.owner = -1;
}

function Action(cell_id, action_id) {
    // An unique ID for every cell
    // Also represents the position on board
    this.id = cell_id;
    this.type = "action";

    // Action specific fields
    this.action_id = action_id;
}


/**
 * Player Class
 * Model, stores data only
 * @param {int} id
 * @constructor
 */
function Player(id) {
    this.id = id;
    this.position = 0;
    this.money = 1500;
    this.is_in_jail = false;

    this.moveTo = function (new_id) {

    };

    this.move = function (step) {
        var from = this.position;

        this.position = this.position + step;
        if (this.position >= 40) {
            this.position -= 40;
        }

        // For method chaining
        return this;
    }
}

function BoardViewController() {
    this.showCellNames = function () {
        $(".cell").each(function () {
            $(this).text("Hospital");
        })
    };
}

// Main
$(document).ready(function () {
    // Randomly set color for each cell
    $(".cell").each(function () {
        $(this).css("background-color", ranColor());
    });

    $("#btnRoll").click(function () {
        board.selectPlayer(0).move(3);
        movePlayer(board.playerAt(0), 0, 0);
    });

    var board = new Board();
    board.randomlyGenerateCells();
    board.add_all_players(4);

    new BoardViewController().showCellNames();

    // console.log(board.selectPlayer(1));
});
