/**
 * Created by nooje on 2/8/2017.
 */
"use strict";

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

    /**
     * A dict holds all players info
     * @type {{0: Player, 1: Player, 2: Player, 3: Player}}
     */
    this.players = {};
}


/**
 * Initialize data from fixed JSON string
 */
Board.prototype.initCells = function () {
    // I had no choice but to put this long text here...
    // Source: "Client/data/model.json"
    var cellsData = '{"0":{"action_id":0,"id":0,"type":"action"},"1":{"estate":0,"id":1,"price":60,"property_id":0,"type":"property"},"10":{"action_id":4,"id":10,"type":"action"},"11":{"estate":2,"id":11,"price":140,"property_id":5,"type":"property"},"12":{"estate":-1,"id":12,"price":200,"property_id":22,"type":"property"},"13":{"estate":2,"id":13,"price":140,"property_id":6,"type":"property"},"14":{"estate":2,"id":14,"price":160,"property_id":7,"type":"property"},"15":{"estate":-1,"id":15,"price":150,"property_id":25,"type":"property"},"16":{"estate":3,"id":16,"price":180,"property_id":8,"type":"property"},"17":{"action_id":5,"id":17,"type":"action"},"18":{"estate":3,"id":18,"price":180,"property_id":9,"type":"property"},"19":{"estate":3,"id":19,"price":200,"property_id":10,"type":"property"},"2":{"action_id":1,"id":2,"type":"action"},"20":{"action_id":6,"id":20,"type":"action"},"21":{"estate":4,"id":21,"price":220,"property_id":11,"type":"property"},"22":{"action_id":7,"id":22,"type":"action"},"23":{"estate":4,"id":23,"price":220,"property_id":12,"type":"property"},"24":{"estate":4,"id":24,"price":240,"property_id":13,"type":"property"},"25":{"estate":-1,"id":25,"price":150,"property_id":26,"type":"property"},"26":{"estate":5,"id":26,"price":260,"property_id":14,"type":"property"},"27":{"estate":5,"id":27,"price":260,"property_id":15,"type":"property"},"28":{"estate":-1,"id":28,"price":200,"property_id":23,"type":"property"},"29":{"estate":5,"id":29,"price":280,"property_id":16,"type":"property"},"3":{"estate":0,"id":3,"price":60,"property_id":1,"type":"property"},"30":{"action_id":8,"id":30,"type":"action"},"31":{"estate":6,"id":31,"price":300,"property_id":17,"type":"property"},"32":{"estate":6,"id":32,"price":300,"property_id":18,"type":"property"},"33":{"action_id":9,"id":33,"type":"action"},"34":{"estate":6,"id":34,"price":320,"property_id":19,"type":"property"},"35":{"estate":-1,"id":35,"price":150,"property_id":27,"type":"property"},"36":{"action_id":10,"id":36,"type":"action"},"37":{"estate":7,"id":37,"price":350,"property_id":20,"type":"property"},"38":{"action_id":11,"id":38,"type":"action"},"39":{"estate":7,"id":39,"price":400,"property_id":21,"type":"property"},"4":{"action_id":2,"id":4,"type":"action"},"40":{"action_id":12,"id":40,"type":"action"},"5":{"estate":-1,"id":5,"price":150,"property_id":24,"type":"property"},"6":{"estate":1,"id":6,"price":100,"property_id":2,"type":"property"},"7":{"action_id":3,"id":7,"type":"action"},"8":{"estate":1,"id":8,"price":100,"property_id":3,"type":"property"},"9":{"estate":1,"id":9,"price":120,"property_id":4,"type":"property"}}';

    cellsData = JSON.parse(cellsData);

    for (var lop = 0; lop < 40; lop++) {
        if (cellsData[lop].type === "property") {
            // is a property
            this.cells[lop] = new Property(lop, cellsData[lop].property_id, cellsData[lop].estate, cellsData[lop].price);
        } else {
            this.cells[lop] = new Action(lop, cellsData[lop].action_id);
        }
    }
};

/**
 * Add player to model
 * @param {int} id: id of player
 */
Board.prototype.addPlayer = function (id) {
    if (id in this.players) {
        return;
    }
    this.players[id] = new Player(id);
};

/**
 * Initalize players, create new Player() and set money
 * @param num
 */
Board.prototype.initPlayer = function (num) {
    for (var lop = 1; lop <= num; lop++) {
        this.addPlayer(lop);
        this.selectPlayer(lop).setMoney(2000);
    }
};

/**
 * Return square by id
 * @param {int} id
 * @return {Property | Action}
 */
Board.prototype.selectCell = function (id) {
    return this.cells[id];
};

/**
 * Return player by id
 * @param {int} id
 * @returns {Player}
 */
Board.prototype.selectPlayer = function (id) {
    return this.players[id];
};

/**
 * Return ID of square where the player lands
 * @param {int} id
 */
Board.prototype.playerAtByID = function (id) {
    return this.players[id].position;
};

/**
 * Move player given roll_result
 * @param {int} source
 * @param {[int, int]} result
 */
Board.prototype.movePlayer = function (source, result) {
    // Update model
    return this.selectPlayer(source).moveByStep(result.reduce(function (a, b) {
        return a + b;
    }, 0));
};

/**
 * Layer: Model
 * Property Class
 * @param {int} cell_id
 * @param {int} property_id
 * @param {int} estate,
 * @param {int} price
 * @constructor
 */
function Property(cell_id, property_id, estate, price) {
    // An unique ID for every cell
    // Also represents the position on board
    this.id = cell_id;
    this.type = "property";

    // Property specific fields
    this.estate = estate;
    this.price = price;
    /*
     -1: Nobody
     [0, N]: Player ID
     */
    this.owner = -1;
}
/**
 * Call back to on owner change event
 * @param {int} owner
 */
Property.onOwnerChange = function (id, owner) {
};

Property.prototype.changeOwner = function (owner) {
    this.owner = owner;

    Property.onOwnerChange(this.id, owner);
};

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
}


/**
 * Player Class
 * Model, stores data only
 * @param {int} id: should always starts from 0, or error might occur
 * @constructor
 */
function Player(id) {
    this.id = id;
    this.position = 0;
    this.money = undefined;
    this.is_in_jail = false;
}

/**
 * Callback on money change
 * @param id
 * @param money
 */
Player.onMoneyChange = function (id, money) {
};

/**
 * Callback on position change
 * @param id
 * @param from
 * @param to
 */
Player.onPositionChange = function (id, from, to) {
};

/**
 * Callback on pass GO
 * @param id
 */
Player.onGoPassed = function (id) {
};

/**
 * Does this player has enough money to buy the given property ?
 * @param {int} propertyIndex: range from 0 - 39
 */
Player.prototype.canBuyProperty = function (propertyIndex) {
    return (this.money >= game.model.selectCell(propertyIndex).price) &&
        (game.model.selectCell(propertyIndex).owner === -1);
};

/**
 * Modify this player's balance by given amount of money
 * Can be negative or positive value
 * @param {int} amount
 * @return {int} money left
 */
Player.prototype.changeMoney = function (amount) {
    this.money += amount;

    // Only call if its THIS player
    if (this.id === game.clientID) {
        Player.onMoneyChange(this.id, this.money);
    }

    return this.money;
};

/**
 * Set Money
 * @param {int} money
 * @return {int} money left
 */
Player.prototype.setMoney = function (money) {
    this.money = money;

    // Only call if its THIS player
    if (this.id === game.clientID) {
        Player.onMoneyChange(this.id, money);
    }

    return this.money;
};

Player.prototype.moveTo = function (destination) {
    Player.onPositionChange(this.id, this.position, destination);

    this.position = destination;

    return this.position;
};

Player.prototype.moveByStep = function (step) {
    var from = this.position;

    this.position = this.position + step;
    if (this.position >= 40) {
        this.position -= 40;

        Player.onGoPassed(this.id);
    }

    Player.onPositionChange(this.id, from, this.position);
    return this.position;
};

