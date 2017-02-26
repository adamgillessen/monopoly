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
     * A dict holds all squares info
     * @type {{int:Property|Action}}
     */
    this.squares = {};

    /**
     * Contains properties in each estate
     * @type {{number:[number]}}
     */
    this.propertyEstate = {};

    /**
     * A dict holds all players info
     * @type {{0: Player, 1: Player, 2: Player, 3: Player}}
     */
    this.players = {};

    /**
     * Array of properties owned by this player
     * @type {Array}
     */
    this.propertiesOwnedByThisPlayer = [];
}


/**
 * Initialize data from fixed JSON string
 */
Board.prototype.initCells = function () {
    // I had no choice but to put this long text here...
    // Source: "Client/data/model.json"
    var cellsData = '{"0":{"id":0,"type":"action"},"1":{"id":1,"type":"property","price":60,"rent":10,"estate":0},"2":{"id":2,"type":"action"},"3":{"id":3,"type":"property","price":60,"rent":20,"estate":0},"4":{"id":4,"type":"action"},"5":{"id":5,"type":"property","price":150,"rent":-1,"estate":-1},"6":{"id":6,"type":"property","price":100,"rent":30,"estate":1},"7":{"id":7,"type":"action"},"8":{"id":8,"type":"property","price":100,"rent":30,"estate":1},"9":{"id":9,"type":"property","price":120,"rent":40,"estate":1},"10":{"id":10,"type":"action"},"11":{"id":11,"type":"property","price":140,"rent":50,"estate":2},"12":{"id":12,"type":"property","price":200,"rent":-1,"estate":-1},"13":{"id":13,"type":"property","price":140,"rent":50,"estate":2},"14":{"id":14,"type":"property","price":160,"rent":60,"estate":2},"15":{"id":15,"type":"property","price":150,"rent":-1,"estate":-1},"16":{"id":16,"type":"property","price":180,"rent":70,"estate":3},"17":{"id":17,"type":"action"},"18":{"id":18,"type":"property","price":180,"rent":70,"estate":3},"19":{"id":19,"type":"property","price":200,"rent":80,"estate":3},"20":{"id":20,"type":"action"},"21":{"id":21,"type":"property","price":220,"rent":90,"estate":4},"22":{"id":22,"type":"action"},"23":{"id":23,"type":"property","price":220,"rent":90,"estate":4},"24":{"id":24,"type":"property","price":240,"rent":100,"estate":4},"25":{"id":25,"type":"property","price":150,"rent":-1,"estate":-1},"26":{"id":26,"type":"property","price":260,"rent":110,"estate":5},"27":{"id":27,"type":"property","price":260,"rent":110,"estate":5},"28":{"id":28,"type":"property","price":200,"rent":-1,"estate":-1},"29":{"id":29,"type":"property","price":280,"rent":120,"estate":5},"30":{"id":30,"type":"action"},"31":{"id":31,"type":"property","price":300,"rent":130,"estate":6},"32":{"id":32,"type":"property","price":300,"rent":130,"estate":6},"33":{"id":33,"type":"action"},"34":{"id":34,"type":"property","price":320,"rent":150,"estate":6},"35":{"id":35,"type":"property","price":150,"rent":-1,"estate":-1},"36":{"id":36,"type":"action"},"37":{"id":37,"type":"property","price":350,"rent":175,"estate":7},"38":{"id":38,"type":"action"},"39":{"id":39,"type":"property","price":400,"rent":200,"estate":7}}';
    cellsData = JSON.parse(cellsData);

    for (var lop = 0; lop < 40; lop++) {
        if (cellsData[lop].type === "property") {
            // is a property
            this.squares[lop] = new Property(lop, cellsData[lop].estate, cellsData[lop].price, cellsData[lop].rent);

            var estate = cellsData[lop].estate;
            if (cellsData[lop].estate !== -1) {
                if (this.propertyEstate[estate] === undefined) {
                    this.propertyEstate[estate] = [];
                }
                this.propertyEstate[estate].push(lop);
            }

        } else {
            this.squares[lop] = new Action(lop);
        }
    }
};

/**
 * Add player to model
 * @param {number} id: id of player
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
 * @param {number} id
 * @return {Property | Action}
 */
Board.prototype.selectCell = function (id) {
    return this.squares[id];
};

/**
 * Return player by id
 * @param {number} id
 * @returns {Player}
 */
Board.prototype.selectPlayer = function (id) {
    return this.players[id];
};

/**
 * Return ID of square where the player lands
 * @param {number} id
 */
Board.prototype.playerAtByID = function (id) {
    return this.players[id].position;
};

/**
 * Check if this client can build a house on given property
 * Return true if all properties in the same estate is owned by this player
 * @param {number} propertyID
 * @return {Boolean}
 */
Board.prototype.canBuildHouse = function (propertyID) {
    var estate = this.squares[propertyID].estate;

    var lop = 0;
    for (; lop < game.model.propertyEstate[estate].length; lop++) {
        // If not all owned by this player
        // Return false
        if (!game.isSource(this.squares[game.model.propertyEstate[estate][lop]].owner)) {
            return false;
        }

        // todo:Check if is evenly built
    }

    return true;
};

/**
 * Move player given roll_result
 * @param {number} source
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
 * @param {number} cell_id
 * @param {number} estate
 * @param {number} price
 * @param {number} rent
 * @constructor
 */
function Property(cell_id, estate, price, rent) {
    // An unique ID for every cell
    // Also represents the position on board
    this.id = cell_id;
    this.type = "property";

    // Property specific fields
    this.estate = estate;
    this.price = price;

    /**
     * Progress of build
     * @type {number}
     */
    this.buildProgress = 0;

    /**
     * Base rent
     * @type {number}
     */
    this.rent = rent;

    /**
     * Rent info that actually being displayed to players
     * Because rent could change if you build house on a property
     * @type {number}
     */
    this.displayRent = this.rent;

    /**
     * Who owns this property
     * -1: Nobody
     * 1 -> 4: Player 1 to 4
     * @type {number}
     */
    this.owner = -1;
}
/**
 * Call back to on owner change event
 * @param {number} id
 * @param {number} owner
 */
Property.onOwnerChange = function (id, owner) {
};

/**
 * Callback on build progress change
 * @param {number} id
 * @param {number} newProgress
 */
Property.onBuildProgressChange = function (id, newProgress) {
};

/**
 * Change
 * @param owner
 */
Property.prototype.changeOwner = function (owner) {
    this.owner = owner;

    Property.onOwnerChange(this.id, owner);
};

/**
 * Layer: Model
 * Action Class
 * @param {number} cell_id
 * @constructor
 */
function Action(cell_id) {
    // An unique ID for every cell
    // Also represents the position on board
    this.id = cell_id;
    this.type = "action";
}


/**
 * Player Class
 * Model, stores data only
 * @param {number} id: should always starts from 0, or error might occur
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
 * @param {number} propertyIndex: range from 0 - 39
 */
Player.prototype.canBuyProperty = function (propertyIndex) {
    return (this.hasEnoughMoneyThan(selectCellModel(propertyIndex).price)) && (selectCellModel(propertyIndex).owner === -1);
};

/**
 * Return true if this player has more money than given parameter
 * @param {number} money
 * @return {boolean}
 */
Player.prototype.hasEnoughMoneyThan = function (money) {
    return this.money >= money;
};

/**
 * Modify this player's balance by given amount of money
 * Can be negative or positive value
 * @param {number} amount
 * @return {number} money left
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
 * @param {number} money
 * @return {number} money left
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
