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
    this.viewController = new GameController();

    /**
     * Initialize game board
     * @param {int} num: number of players
     */
    Game.prototype.initGame = function (num) {
        this.model.randomlyGenerateCells();
        this.model.createPlayers(num);

        this.viewController.initBoard();
        this.viewController.createPlayers(num);

        for (var lop = 0; lop < num; lop++) {
            this.viewController.movePlayer(lop, this.model.playerAtByID(lop), 0);
        }
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
    $("#btnRoll").click(function () {
        game.model.selectPlayer(0).move(3);
        game.viewController.movePlayer(0, game.model.playerAtByID(0), 0);
    });
});
