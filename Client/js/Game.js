/**
 * Codes that control the whole game
 */

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

    this.model = new Board();
    this.viewController = new ViewController();

    /**
     * Initialize game board
     * @param {int} num: number of players
     */
    Game.prototype.initGame = function (num) {
        this.model.initCells();

        this.viewController.addCallbacksToButtons();
        this.viewController.createPlayers(num);
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
