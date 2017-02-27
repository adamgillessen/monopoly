/**
 * Created by jeff on 2017/2/27.
 */

var SQUARE_TYPE = {
    action: "Action-square",
    property: "Property-square",
    util: "Utility-square",
    trans: "transportation-square"
};

function defaultCallback() {
    throw new Error("Callback not implemented");
}

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
Square.prototype.initProperty = function (estate, price, rent) {
    this.estate = estate;
    this.price = price;
    this.owner = -1;

    this.buildCost = rent;
    this.buildProgress = 0;
    this.rent = rent;

    return this;
};

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

    this.owner = owner;
    this.onOwnerChange();
};

Square.prototype.setBuildCost = function (buildCost) {
    if (!this.isProperty()) {
        throw new Error(this.type + " has no build cost");
    }

    this.buildCost = buildCost;
    this.onBuildCostChange();
};

Square.prototype.setBuildProgress = function (progress) {
    if (!this.isProperty()) {
        throw new Error(this.type + " has no build progress");
    }

    this.buildProgress = progress;
    this.onBuildProgressChange();
};

Square.prototype.setRent = function (rent) {
    if (this.isBaseProperty()) {
        throw new Error(this.type + " has no rent");
    }

    this.rent = rent;
    this.onRentChange();
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
    // todo
};

Square.prototype.build = function () {
    if (!this.isProperty()) {
        throw new Error("Cannot build on" + this.type);
    }

    var prevProgress = this.buildProgress;

    this.setBuildProgress(prevProgress + 1);
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
    this.position = pos;

    this.onPositionChange();
};

Player.prototype.setMoney = function (money) {
    this.money = money;

    this.onMoneyChange();
};

Player.prototype.changeMoney = function (amount) {
    this.setMoney(this.money + amount);
};

Player.prototype.setJail = function (isInJail) {
    this.inJail = isInJail;

    this.onJailChange();
};

Player.prototype.setCard = function (hasCard) {
    this.hasCard = hasCard;

    this.onCardChange();
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

Player.prototype.moveByStep = function (steps) {
    this.position = this.position + step;

    if (this.position >= 40) {
        this.position -= 40;

        this.onGoPassed();
    }

    this.onPositionChange();

    return this.position;
};
