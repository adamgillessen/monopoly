/**
 * Global variables
 */
"use strict";

var GAME_STATE = {
    OTHERS_TURN: "OTHERS_TURN",
    ROLL: "ROLL",
    BUY: "BUY",
    AUCTION: "AUCTION",
    EOT: "END OF TURN"
};

function Game() {
    /**
     * Unique ID for this player/client
     * Obtained from server
     * @type {number}
     */
    this.clientID = undefined;

    /**
     * Instance of Connector class
     * @type {Connector}
     */
    this.connector = new Connector();

    /**
     * Instance of Board class
     * @type {Board}
     */
    this.model = new Board();

    /**
     * Current state of this client
     * @type {string}
     */
    this.state = GAME_STATE.OTHERS_TURN;

    /**
     * Auction Handler
     * Handles the game logic during an auction
     * @type {Auction}
     */
    this.auctionHandler = null;

    /**
     * ID of player who is on the turn
     * @type {number}
     */
    this.currentTurn = false;

    /**
     * True if this player rolled a double in the previous roll
     * @type {boolean}
     */
    this.doubleRoll = false;
}

/**
 * Initialize variables that game would use later
 * @param {number} num: number of players
 */
Game.prototype.initGame = function (num) {
    this.model.initCells();
    this.model.initPlayer(num);

    ViewController.addCallbacksToButtons();
    ViewController.addCallbacksToEvents();
    ViewController.createPlayers(num);
};

/**
 * Is current turn my turn?
 * @returns {boolean}
 */
Game.prototype.isMyTurn = function () {
    return this.clientID === this.currentTurn;
};

/**
 * Is the source this player?
 * @param {number} source
 * @return {boolean}
 */
Game.prototype.isSource = function (source) {
    return this.clientID === source;
};

Game.prototype.startAuction = function (data) {
    this.state = GAME_STATE.AUCTION;

    if (this.auctionHandler === null) {
        this.auctionHandler = new Auction();
    }
    this.auctionHandler.start(data);
};

Game.prototype.endAuction = function (data) {
    this.auctionHandler.finish(data);

    if (this.isMyTurn()) {
        ViewController.preEndTurn();
    } else {
        this.state = GAME_STATE.OTHERS_TURN;
    }

    this.auctionHandler = null;
};

/**
 * Stores info about entire app
 * Global variable
 * @type {Game}
 */
var game = new Game();
