/**
 * Global variables
 */
"use strict";

function Game() {
    /**
     * Unique ID for this player/client
     * Obtained from server
     * @type {int}
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
     * Instance of ViewController class
     * @type {ViewController}
     */
    this.viewController = new ViewController();

    /**
     * Initialize game board
     * @param {int} num: number of players
     */
    Game.prototype.initGame = function (num) {
        this.model.initCells();
        this.model.initPlayer(num);

        this.viewController.addCallbacksToButtons();
        this.viewController.createPlayers(num);
    };

    /**
     * Is current turn my turn?
     * @param {int} ID
     * @returns {boolean}
     */
    Game.prototype.isMyTurn = function (ID) {
        return this.clientID === ID;
    }
}

/**
 * Stores info about entire app
 * Global variable
 * @type {Game}
 */
var game = new Game();


// Main
$(document).ready(function () {
});
