/**
 * Created by Zijie Wu on 2/8/2017.
 */
"use strict";

var SQUARE_TYPE = {
    action: "Action-square",
    property: "Property-square",
    others: "Utility or transportation-square"
};

var FULL_BUILT_TIMES = 5;

function defaultCallback() {
    console.log("Callback not implemented");
}

/**
 * Layer: Model
 * Store info of the entire board game
 * Includes info for every cell and every player
 * @constructor
 */
function Board() {
    /**
     * A dict holds all squares info
     * @type {{number:Square}}
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
            // Is Property
            if (cellsData[lop].estate !== -1) {
                var estate = cellsData[lop].estate;

                this.squares[lop] = new Square(lop, SQUARE_TYPE.property).initProperty(estate, cellsData[lop].price, cellsData[lop].rent);

                if (this.propertyEstate[estate] === undefined) {
                    this.propertyEstate[estate] = [];
                }
                this.propertyEstate[estate].push(lop);
            } else {
                // Is UTIL or TRANS
                this.squares[lop] = new Square(lop, SQUARE_TYPE.others).initUtilOrTrans(cellsData[lop].price);
            }
        } else {
            this.squares[lop] = new Square(lop, SQUARE_TYPE.action);
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
Board.prototype.initPlayers = function (num) {
    for (var lop = 1; lop <= num; lop++) {
        this.players[lop] = new Player(lop).initPlayer(2000);
    }
};

/**
 * Return square by id
 * @param {number} id
 * @return {Square}
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
    // todo: bug fix
    var estate = this.squares[propertyID].estate;

    /**
     * ID of properties in this Estate
     * @type {[number]}
     */
    var properties = game.model.propertyEstate[estate];
    var lop;
    var iHigh = 0;
    var iLow = 0;

    for (lop = 0; lop < properties.length; lop++) {
        // If not all owned by this player
        // Return false
        if (!game.isThisClient(this.squares[properties[lop]].owner)) {
            return false;
        }

        // Find index of biggest number
        if (selectSquareModel(properties[iHigh]).buildProgress < selectSquareModel(properties[lop]).buildProgress) {
            iHigh = lop;
        }

        // Find index of smallest number
        if (selectSquareModel(properties[iLow]).buildProgress > selectSquareModel(properties[lop]).buildProgress) {
            iLow = lop;
        }
    }

    // All properties are evenly built, so you can build new one on top of them
    if (selectSquareModel(properties[iHigh]).buildProgress === selectSquareModel(properties[iLow]).buildProgress) {
        return true;
    }

    // Not evenly built, you can only build on lower one
    return selectSquareModel(properties[iLow]).buildProgress === selectSquareModel(properties[propertyID]).buildProgress;
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
 * Square class
 * @param {number} id
 * @param {string} type
 * @constructor
 */
function Square(id, type) {
    this.id = id;
    this.type = type;

    //////////////////////////////////////////////////////
    // Shared properties among Property, UTIL and TRANS
    //////////////////////////////////////////////////////
    this.estate = undefined;
    this.price = undefined;
    this.owner = undefined;

    ///////////////////////
    // Only for Property
    ///////////////////////
    /**
     * Costs to build this property
     * This is fixed
     * @type {number}
     */
    this.buildCost = undefined;
    this.buildProgress = undefined;

    /**
     * Amount of tax others should pay when lands on this
     * This could change when you build houses on this property
     * @type {number}
     */
    this.rent = undefined;
}

//////////////////
// Constructors //
//////////////////
/**
 * Initilize Property's properties
 * @param {number} estate
 * @param {number} price
 * @param {number} rent
 * @return {Square}
 */
Square.prototype.initProperty = function (estate, price, rent) {
    this.estate = estate;
    this.price = price;
    this.owner = -1;

    this.buildCost = rent;
    this.buildProgress = 0;
    this.rent = rent;

    return this;
};

/**
 * Initilize Util or TRANS's properties
 * @param {number} price
 * @return {Square}
 */
Square.prototype.initUtilOrTrans = function (price) {
    this.estate = -1;
    this.price = price;
    this.owner = -1;

    return this;
};

////////////////
// Callbacks //
///////////////
Square.prototype.onOwnerChange = defaultCallback;

Square.prototype.onBuildCostChange = defaultCallback;

Square.prototype.onBuildProgressChange = defaultCallback;

Square.prototype.onRentChange = defaultCallback;

////////////
// Setter //
////////////
Square.prototype.setOwner = function (owner) {
    if (!this.isBaseProperty()) {
        throw new Error(this.type + " has no owner");
    }

    var prev = this.owner;
    this.owner = owner;

    if (prev !== this.owner) {
        this.onOwnerChange();
    }
};

Square.prototype.setBuildCost = function (buildCost) {
    if (!this.isProperty()) {
        throw new Error(this.type + " has no build cost");
    }

    var prev = this.buildCost;
    this.buildCost = buildCost;

    if (prev !== this.buildCost) {
        this.onBuildCostChange();
    }
};

Square.prototype.setBuildProgress = function (progress) {
    if (!this.isProperty()) {
        throw new Error(this.type + " has no build progress");
    }

    var prev = this.buildProgress;
    this.buildProgress = progress;

    if (prev !== this.buildProgress) {
        this.onBuildProgressChange();
    }
};

Square.prototype.setRent = function (rent) {
    if (!this.isBaseProperty()) {
        throw new Error(this.type + " has no rent");
    }

    var prev = this.rent;
    this.rent = rent;

    if (prev !== this.rent) {
        this.onRentChange();
    }
};


/**
 * Is this square Property, UTIL or TRANS?
 * @return {boolean} true if this sqaure is one of the 3 type
 */
Square.prototype.isBaseProperty = function () {
    return this.type !== SQUARE_TYPE.action;
};

/**
 * Is this square property?
 * @return {boolean}
 */
Square.prototype.isProperty = function () {
    return this.type === SQUARE_TYPE.property;
};

/**
 * Things to do when given player lands on this square
 * @param {number} id
 */
Square.prototype.onLandOn = function (id) {
    if (!game.isThisClient(id)) {
        return;
    }

    if (this.isBaseProperty()) {
        // Lands on Property or UTIL or TRANS
        // Show buy
        if (this.owner === -1) {
            // Show buy option
            ViewController.promptBuyWindow(this.id);
        } else {
            ViewController.preEndTurn();
        }
    } else {
        // Lands on Action
        // Do nothing
        ViewController.preEndTurn();
    }
};

Square.prototype.build = function () {
    if (!this.isProperty()) {
        throw new Error("Cannot build on" + this.type);
    }

    this.setBuildProgress(this.buildProgress + 1);
};

Square.prototype.showDetail = function () {
    ViewController.currentSelectedSquare = this.id;
    var squareName = ViewController.tableName[this.id];

    switch (this.type) {
        case SQUARE_TYPE.action:
            $("#property").hide();
            $("#action").show();

            // Add class to DOM
            $("#action-banner").removeClass();
            $("#action-banner").addClass("cell-" + this.id);

            $("#action-id").text(this.id);
            $("#action-description").text(squareName);
            break;

        case SQUARE_TYPE.property:
            $("#property").show();
            $("#property-controls").hide();
            $("#action").hide();

            // Add class to DOM
            $("#property-banner").removeClass();
            $("#property-banner").addClass("cell-" + this.id);

            // ID
            $("#property-id").text(this.id);
            // Name
            $("#property-name").text(squareName);
            // Estate
            $("#property-estate").text("Estate: " + this.estate);
            // Build Progress
            $("#property-build").text(generateProgressBar(this.buildProgress, FULL_BUILT_TIMES));
            // Owner
            if (this.owner === -1) {
                $("#property-owner").text("ON SALE");
            } else {
                if (game.isThisClient(this.owner)) {
                    $("#property-owner").text("Owner: You");
                } else {
                    $("#property-owner").text("Owner: Player " + this.owner);
                }
            }
            // Price
            $("#property-price").text("Price: £" + this.price);
            // Rent
            $("#property-rent").text("Rent: £" + this.rent);
            // Control Pane
            if (game.isThisClient(this.owner)) {
                $("#property-controls").show();
                if (game.model.canBuildHouse(this.id)) {
                    showPropertyButtons([BUTTONS_PROPERTY.build, BUTTONS_PROPERTY.mortgage, BUTTONS_PROPERTY.sell]);
                    // Build Cost
                    $("#build-cost").text(this.buildCost);
                } else {
                    showPropertyButtons([BUTTONS_PROPERTY.mortgage, BUTTONS_PROPERTY.sell]);
                }
            }
            break;

        case SQUARE_TYPE.others:
            // ID
            $("#property-id").text(this.id);
            // Name
            $("#property-name").text(squareName);
            // Estate
            $("#property-estate").text(" --- ");
            // Build Progress
            $("#property-build").text(" --- ");
            // Owner
            if (this.owner === -1) {
                $("#property-owner").text("ON SALE");
            } else {
                if (game.isThisClient(this.owner)) {
                    $("#property-owner").text("Owner: You");
                } else {
                    $("#property-owner").text("Owner: Player " + this.owner);
                }
            }
            // Price
            $("#property-price").text("Price: £" + this.price);
            // Rent
            $("#property-rent").text(" --- ");
            // Control Pane
            if (game.isThisClient(this.owner)) {
                $("#property-controls").show();
                showPropertyButtons([BUTTONS_PROPERTY.mortgage, BUTTONS_PROPERTY.sell]);
            }
            break;

        default:
            throw new Error("Type Error: " + this.type);
    }
};

/**
 * Player class
 * @param {number} id
 * @constructor
 */
function Player(id) {
    this.id = id;
    this.position = undefined;
    this.money = undefined;
    this.inJail = undefined;
    this.hasCard = undefined;
}

Player.prototype.initPlayer = function (money) {
    this.position = 0;
    this.money = money;
    this.inJail = false;
    this.hasCard = false;

    return this;
};

Player.prototype.onGoPassed = defaultCallback;

Player.prototype.onPositionChange = defaultCallback;

Player.prototype.onMoneyChange = defaultCallback;

Player.prototype.onJailChange = defaultCallback;

Player.prototype.onCardChange = defaultCallback;

Player.prototype.setPosition = function (pos) {
    var prev = this.position;
    this.position = pos;

    if (prev !== this.position) {
        this.onPositionChange();
    }
};

Player.prototype.setMoney = function (money) {
    var prev = this.money;
    this.money = money;

    if (prev !== this.money) {
        this.onMoneyChange();
    }
};

Player.prototype.changeMoney = function (amount) {
    this.setMoney(this.money + amount);
};

Player.prototype.setJail = function (isInJail) {
    var prev = this.inJail;
    this.inJail = isInJail;

    if (prev !== this.inJail) {
        this.onJailChange();
    }
};

Player.prototype.setCard = function (hasCard) {
    var prev = this.hasCard;
    this.hasCard = hasCard;

    if (prev !== this.hasCard) {
        this.onCardChange();
    }
};

/**
 * Does this player has enough money to buy the given property ?
 * @param {number} propertyIndex: range from 0 - 39
 */
Player.prototype.canBuyProperty = function (propertyIndex) {
    return (this.hasEnoughMoneyThan(selectSquareModel(propertyIndex).price)) && (selectSquareModel(propertyIndex).owner === -1);
};

/**
 * Return true if this player has more money than given parameter
 * @param {number} money
 * @return {boolean}
 */
Player.prototype.hasEnoughMoneyThan = function (money) {
    return this.money >= money;
};

Player.prototype.moveByStep = function (steps) {
    if (steps === 0) {
        return this.position;
    }

    this.position = this.position + steps;

    if (this.position >= 40) {
        this.position -= 40;

        this.onGoPassed();
    }

    this.onPositionChange();

    return this.position;
};
