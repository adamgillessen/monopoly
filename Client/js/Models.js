/**
 * Created by nooje on 2/8/2017.
 */

/**
 * Layer: Model
 * Store info of the entire board game
 * Includes info for every cell and every player
 * @constructor
 */
function Board() {
    /**
     * A dict holds all cells info
     * @type {{int:Property|Action}}
     */
    this.cells = {};
    // A dict holds all players info
    this.players = {};

    // Initialize model data
    Board.prototype.generateCells = function () {
        // I had no choice but to put this long text here...
        // Cant read it from a file
        var cell_attr = '{"0":{"action_id":0,"id":0,"type":"action"},"1":{"id":1,"owner":-1,"price":100,"property_id":0,"type":"property"},"10":{"action_id":4,"id":10,"type":"action"},"11":{"id":11,"owner":-1,"price":100,"property_id":6,"type":"property"},"12":{"action_id":5,"id":12,"type":"action"},"13":{"id":13,"owner":-1,"price":100,"property_id":7,"type":"property"},"14":{"id":14,"owner":-1,"price":100,"property_id":8,"type":"property"},"15":{"id":15,"owner":-1,"price":100,"property_id":9,"type":"property"},"16":{"id":16,"owner":-1,"price":100,"property_id":10,"type":"property"},"17":{"action_id":6,"id":17,"type":"action"},"18":{"id":18,"owner":-1,"price":100,"property_id":11,"type":"property"},"19":{"id":19,"owner":-1,"price":100,"property_id":12,"type":"property"},"2":{"action_id":1,"id":2,"type":"action"},"20":{"action_id":7,"id":20,"type":"action"},"21":{"id":21,"owner":-1,"price":100,"property_id":13,"type":"property"},"22":{"action_id":8,"id":22,"type":"action"},"23":{"id":23,"owner":-1,"price":100,"property_id":14,"type":"property"},"24":{"id":24,"owner":-1,"price":100,"property_id":15,"type":"property"},"25":{"id":25,"owner":-1,"price":100,"property_id":16,"type":"property"},"26":{"id":26,"owner":-1,"price":100,"property_id":17,"type":"property"},"27":{"id":27,"owner":-1,"price":100,"property_id":18,"type":"property"},"28":{"action_id":9,"id":28,"type":"action"},"29":{"id":29,"owner":-1,"price":100,"property_id":19,"type":"property"},"3":{"id":3,"owner":-1,"price":100,"property_id":1,"type":"property"},"30":{"action_id":10,"id":30,"type":"action"},"31":{"id":31,"owner":-1,"price":100,"property_id":20,"type":"property"},"32":{"id":32,"owner":-1,"price":100,"property_id":21,"type":"property"},"33":{"action_id":11,"id":33,"type":"action"},"34":{"id":34,"owner":-1,"price":100,"property_id":22,"type":"property"},"35":{"id":35,"owner":-1,"price":100,"property_id":23,"type":"property"},"36":{"action_id":12,"id":36,"type":"action"},"37":{"id":37,"owner":-1,"price":100,"property_id":24,"type":"property"},"38":{"action_id":13,"id":38,"type":"action"},"39":{"id":39,"owner":-1,"price":100,"property_id":25,"type":"property"},"4":{"action_id":2,"id":4,"type":"action"},"5":{"id":5,"owner":-1,"price":100,"property_id":2,"type":"property"},"6":{"id":6,"owner":-1,"price":100,"property_id":3,"type":"property"},"7":{"action_id":3,"id":7,"type":"action"},"8":{"id":8,"owner":-1,"price":100,"property_id":4,"type":"property"},"9":{"id":9,"owner":-1,"price":100,"property_id":5,"type":"property"}}';
        cell_attr = JSON.parse(cell_attr);

        for (var lop = 0; lop < 40; lop++) {
            if (cell_attr[lop].type == "property") {
                // is a property
                this.cells[lop] = new Property(lop, cell_attr[lop].property_id, cell_attr[lop].price);
            } else {
                this.cells[lop] = new Action(lop, cell_attr[lop].action_id);
            }
        }
    };

    Board.prototype.createPlayers = function (num) {
        for (var lop = 0; lop < num; lop++) {
            this.players[lop] = new Player(lop);
        }
    };

    Board.prototype.selectCell = function (id) {
        return this.cells[id];
    };

    /**
     * Return player by ID
     * @param {int} id
     * @returns {Player}
     */
    Board.prototype.selectPlayer = function (id) {
        return this.players[id];
    };

    /**
     * Return ID of cell where the player lands
     * @param {int} id
     */
    Board.prototype.playerAtByID = function (id) {
        return this.players[id].position;
    };

    Board.prototype.movePlayer = function (jsonObj) {
        // Update model
        var landedOn = this.selectPlayer(jsonObj["source"]).move(jsonObj["result"].reduce(function (a, b) {
            return a + b;
        }, 0));

        // Update view
        game.viewController.movePlayer(jsonObj["source"], landedOn, 0);

        // todo: remove console.log
        console.log("Landed on: cell-" + landedOn);
        if (this.cells[landedOn].type == "property") {
            console.log("Do you want to buy: " + this.selectCell(landedOn).property_id);
        } else {
            console.log("Action_id: " + this.selectCell(landedOn).action_id);
        }
    };
}

/**
 * Layer: Model
 * Property Class
 * @param {int} cell_id
 * @param {int} property_id
 * @constructor
 */
function Property(cell_id, property_id, price) {
    // An unique ID for every cell
    // Also represents the position on board
    this.id = cell_id;
    this.type = "property";

    // Property specific fields
    this.property_id = property_id;
    this.price = price;
    /*
     -1: Nobody
     [0, N]: Player ID
     */
    this.owner = -1;
}

/**
 * Layer: Model
 * Action Class
 * @param {int} cell_id
 * @param {int} action_id
 * @constructor
 */
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

    Player.prototype.move = function (step) {
        var from = this.position;

        this.position = this.position + step;
        if (this.position >= 40) {
            this.position -= 40;
        }

        return this.position;
    }
}

