/**
 * Global variables
 */
"use strict";

/**
 * Possible states of game
 * @type {{OTHERS_TURN: string, ROLL: string, BUY: string, AUCTION: string, EOT: string, SPECTATOR: string}}
 */
var GAME_STATE = {
    OTHERS_TURN: "OTHERS_TURN",
    ROLL: "ROLL",
    BUY: "BUY",
    AUCTION: "AUCTION",
    EOT: "END OF TURN",
    SPECTATOR: "Watching"
};

/**
 * Game class
 * Contains info about current game
 * @constructor
 */
function Game() {
    /**
     * Unique ID for this player/client
     * Obtained from server
     * @type {number}
     */
    this.clientID = undefined;

    /**
     * Stores players lose or not
     * @type {{1: boolean, 2: boolean}}
     */
    this.playerStates = {};

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
    // Not lose
    for (var lop = 1; lop <= num; lop++) {
        this.playerStates[lop] = false;
    }

    this.model.initCells();
    this.model.initPlayers(num);

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
Game.prototype.isThisClient = function (source) {
    valid(source);
    if (typeof source !== "number") {
        source = parseInt(source);
    }
    return this.clientID === source;
};

/**
 * Start Auction
 * @param {Object} data: Message obj of type "auction_start"
 */
Game.prototype.startAuction = function (data) {
    valid(data);

    this.state = GAME_STATE.AUCTION;

    if (this.auctionHandler === null) {
        this.auctionHandler = new Auction();
    }
    this.auctionHandler.start(data);
};

/**
 * End Auction
 * @param {Object} data: Message obj of type "auction_finished"
 */
Game.prototype.endAuction = function (data) {
    this.auctionHandler.finish(data);

    if (this.isMyTurn()) {
        ViewController.preEndTurn();
    } else {
        this.state = GAME_STATE.OTHERS_TURN;
    }

    this.auctionHandler = null;
};

Game.prototype.youLose = function () {
    alert("You lose!\nYou are now spectating game");
    this.state = GAME_STATE.SPECTATOR;
};

Game.prototype.youWin = function () {
    alert("YOU WIN!");
};

Game.prototype.otherWin = function (id) {
    alert(sprintf("Player %d has WON!", id));
};

Game.prototype.otherLose = function (id) {
    alert(sprintf("Player %d has lose", id));
};

Game.prototype.gameOver = function () {
    alert("This round is OVER\nYou can now close this page");
};

/**
 * Stores info about entire app
 * Global variable
 * @type {Game}
 */
var game = new Game();
