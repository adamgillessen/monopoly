/**
 * Created by Zijie Wu on 2/8/2017.
 */
"use strict";

var SQUARE_TYPE = {
    action: "Action-square",
    property: "Property-square",
    others: "Utility or transportation-square"
};

var MAX_HOUSES = 5;

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
     * @type {{number:number[]}}
     */
    this.squares = {};

    /**
     * Contains properties in each estate
     * @type {{number:Array}}
     */
    this.propertyEstate = {};

    /**
     * A dict holds all players info
     * @type {{0: Player, 1: Player, 2: Player, 3: Player}}
     */
    this.players = {};

    /**
     * Array of properties owned by this player
     * @type {number[]}
     */
    this.propertiesOwnedByThisPlayer = [];
}


/**
 * Initialize data from hard coded JSON string (from data/model.json)
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
 * Initalize players, create new Player() and set thier money
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
 * <pre>
 * Check if this client can build a house on given property
 * Return true if
 * All properties in the same estate is owned by this player
 * And none of them is mortgaged
 * And they are evenly built
 * </pre>
 * @param {number} propertyID
 * @return {Boolean}
 */
Board.prototype.canBuildHouse = function (propertyID) {
    var estate = this.squares[propertyID].estate;

    /**
     * ID of properties in this Estate
     * @type {number[]}
     */
    var properties = game.model.propertyEstate[estate];
    var lop;
    var iHigh = 0;
    var iLow = 0;

    for (lop = 0; lop < properties.length; lop++) {
        // If not all owned by this player
        // All property must be un-mortgaged
        // Return false
        if (!game.isThisClient(this.squares[properties[lop]].owner) || selectSquareModel(properties[lop]).mortgaged) {
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
        // 5 max houses allowed
        return selectSquareModel(propertyID).buildProgress !== MAX_HOUSES;
    }

    // Not evenly built, you can only build on lower one
    return selectSquareModel(properties[iLow]).buildProgress === selectSquareModel(propertyID).buildProgress;
};

/**
 * <pre>
 * Check if this client can mortgage this property
 * Return true if
 * Not mortgaged
 * And client owns this property
 * And it has no houses built on top of this property
 * </pre>
 * @param {number} propertyID
 * @return {Boolean}
 */
Board.prototype.canMortgageProperty = function (propertyID) {
    var property = selectSquareModel(propertyID);
    if (property.isProperty()) {
        return !property.mortgaged && game.isThisClient(property.owner) && property.buildProgress === 0;
    }
    // This is UTIL or TRANS
    return !property.mortgaged && game.isThisClient(property.owner);
};

/**
 * <pre>
 * Check if this client can un-mortgage this property
 * Return true if
 * Client owns this property
 * And mortgaged
 * </pre>
 * @param {number} propertyID
 * @return {Boolean}
 */
Board.prototype.canUnmortgageProperty = function (propertyID) {
    var property = selectSquareModel(propertyID);
    return property.mortgaged && game.isThisClient(property.owner);
};

/**
 * <pre>
 *  Check if this client can sell house on property
 * </pre>
 * @param {number} propertyID
 * @return {boolean}
 */
Board.prototype.canSellHouse = function (propertyID) {
    // Only property may have "Sell" option
    if (!this.squares[propertyID].isProperty()) {
        return false;
    }

    // You can only sell if you built houses before
    return this.squares[propertyID].buildProgress > 0;
};

/**
 * Move player, given roll_result
 * @param {number} source
 * @param {number[]} result
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
    /**
     * Estate this property is in
     * Fixed
     * @type {number}
     */
    this.estate = undefined;
    /**
     * Price to buy this propety
     * Fixed
     * @type {number}
     */
    this.price = undefined;
    this.owner = undefined;
    /**
     * Is this property mortgaged or not
     * @type {Boolean}
     */
    this.mortgaged = undefined;

    ///////////////////////
    // Only for Property
    ///////////////////////
    /**
     * Costs to build this property
     * Fixed
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
 * @return {Square}: return this for method chaining
 */
Square.prototype.initProperty = function (estate, price, rent) {
    this.estate = estate;
    this.price = price;
    this.owner = -1;
    this.mortgaged = false;

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
    this.mortgaged = false;

    return this;
};

////////////////
// Callbacks //
///////////////
/**
 * Execute when the owner changes
 */
Square.prototype.onOwnerChange = defaultCallback;

/**
 * Execute when the mortgage state changes
 */
Square.prototype.onMortgageChange = defaultCallback;

/**
 * Execute when the build cost changes
 */
Square.prototype.onBuildCostChange = defaultCallback;

/**
 * Execute when the build progress changes
 */
Square.prototype.onBuildProgressChange = defaultCallback;

/**
 * Execute when the rent changes
 */
Square.prototype.onRentChange = defaultCallback;

////////////
// Setter //
////////////
/**
 * Set owner
 * @param {number} owner: new owner value
 */
Square.prototype.setOwner = function (owner) {
    if (!this.isBaseProperty()) {
        throw new Error(this.type + " has no owner");
    }

    // Only calls if the value get modified
    if (this.owner !== owner) {
        this.owner = owner;

        this.onOwnerChange();
    }
};

/**
 * Set mortgage state
 * @param {number} mortgage: new mortgage value
 */
Square.prototype.setMortgage = function (mortgage) {
    if (!this.isBaseProperty()) {
        throw new Error(this.type + " has no mortgage flag");
    }

    // Only calls if the value get modified
    if (this.mortgaged !== mortgage) {
        this.mortgaged = mortgage;

        this.onMortgageChange();
    }
};

/**
 * Set buildCost
 * @param {number} buildCost: new buildCost value
 */
Square.prototype.setBuildCost = function (buildCost) {
    if (!this.isProperty()) {
        throw new Error(this.type + " has no build cost");
    }

    // Only calls if the value get modified
    if (this.buildCost !== buildCost) {
        this.buildCost = buildCost;

        this.onBuildCostChange();
    }
};

/**
 * Set buildProgress
 * @param {number} progress: new progress value
 */
Square.prototype.setBuildProgress = function (progress) {
    if (!this.isProperty()) {
        throw new Error(this.type + " has no build progress");
    }

    // Only calls if the value get modified
    if (this.buildProgress !== progress) {
        this.buildProgress = progress;

        this.onBuildProgressChange();
    }
};

/**
 * Set rent
 * @param {number} rent: new rent value
 */
Square.prototype.setRent = function (rent) {
    if (!this.isBaseProperty()) {
        throw new Error(this.type + " has no rent");
    }

    // Only calls if the value get modified
    if (this.rent !== rent) {
        this.rent = rent;

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
    // Lands on GO
    if (this.id === 0) {
        log("Landed on GO, Got 200", id);
        selectPlayerModel(id).changeMoney(200);
    }

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
        // Lands on action
        // Do nothing
        ViewController.preEndTurn();
    }
};

/**
 * Preform build action on this property
 * <strong>Do check whether you can build first!</strong>
 */
Square.prototype.build = function () {
    if (!this.isProperty()) {
        throw new Error("Cannot build on" + this.type);
    }

    this.setBuildProgress(this.buildProgress + 1);
};

/**
 * Sell a house on property
 * @param {number} buildProgress: buildProgress after selling a house
 * @param {number} rent: rent after selling a house
 */
Square.prototype.sell = function (buildProgress, rent) {
    this.setBuildProgress(buildProgress);
    this.setRent(rent);
};

/**
 * Show the detail of this Square to the detail pane in HTML
 */
Square.prototype.showDetail = function () {
    ViewController.currentSelectedSquare = this.id;
    var squareName = ViewController.tableName[this.id];
    var ownerInfo = undefined;

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
            $("#property-build").text(generateProgressBar(this.buildProgress));
            // Owner & mortgage
            if (this.owner === -1) {
                ownerInfo = "ON SALE";
            } else {
                if (game.isThisClient(this.owner)) {
                    ownerInfo = "Owner: You";
                } else {
                    ownerInfo = "Owner: Player " + this.owner;
                }

                if (this.mortgaged) {
                    ownerInfo += " [Mortgaged]";
                }
            }
            $("#property-owner").text(ownerInfo);
            // Price
            $("#property-price").text("Price: £" + this.price);
            // Rent
            $("#property-rent").text("Rent: £" + this.rent);
            // Control Pane
            if (game.isThisClient(this.owner) && game.state !== GAME_STATE.SPECTATOR) {
                $("#property-controls").show();
                var btnToDisplay = [];
                // Build button
                if (game.model.canBuildHouse(this.id)) {
                    btnToDisplay.push(BUTTONS_PROPERTY.build);
                    // Update Build Cost
                    $("#build-cost").text(this.buildCost);
                }
                if (game.model.canMortgageProperty(this.id)) {
                    // Mortgage button
                    btnToDisplay.push(BUTTONS_PROPERTY.mortgage);
                }
                if (game.model.canUnmortgageProperty(this.id)) {
                    // Un-Mortgage button
                    btnToDisplay.push(BUTTONS_PROPERTY.unmortgage);
                }
                // Sell button
                if (game.model.canSellHouse(this.id)) {
                    btnToDisplay.push(BUTTONS_PROPERTY.sell);
                }
                showPropertyButtons(btnToDisplay);
            }
            break;

        case SQUARE_TYPE.others:
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
            $("#property-estate").text(" --- ");
            // Build Progress
            $("#property-build").text(" --- ");
            // Owner
            if (this.owner === -1) {
                ownerInfo = "ON SALE";
            } else {
                if (game.isThisClient(this.owner)) {
                    ownerInfo = "Owner: You";
                } else {
                    ownerInfo = "Owner: Player " + this.owner;
                }

                if (this.mortgaged) {
                    ownerInfo += " [Mortgaged]";
                }
            }
            $("#property-owner").text(ownerInfo);
            // Price
            $("#property-price").text("Price: £" + this.price);
            // Rent
            $("#property-rent").text(" --- ");
            // Control Pane
            if (game.isThisClient(this.owner) && game.state !== GAME_STATE.SPECTATOR) {
                $("#property-controls").show();

                if (game.model.canMortgageProperty(this.id)) {
                    // Mortgage button
                    showPropertyButtons([BUTTONS_PROPERTY.mortgage]);
                }
                if (game.model.canUnmortgageProperty(this.id)) {
                    // Un-Mortgage button
                    showPropertyButtons([BUTTONS_PROPERTY.unmortgage]);
                }
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

////////////////
// Callbacks //
///////////////
Player.prototype.onGoPassed = defaultCallback;

Player.prototype.onPositionChange = defaultCallback;

Player.prototype.onMoneyChange = defaultCallback;

Player.prototype.onJailChange = defaultCallback;

Player.prototype.onCardChange = defaultCallback;

//////////////
// Setters //
/////////////
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

/**
 * Change the balance of this player by amount
 * @param {number} amount
 */
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
    return this.money > money;
};

/**
 * Move this player by several steps forward
 * @param {number} steps
 * @return {*|number|undefined}
 */
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
