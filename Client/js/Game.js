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

    game.model.randomlyGenerateCells();
    game.model.createPlayers(4);
    game.viewController.initBoard();
    game.viewController.createPlayers(4);
    game.viewController.movePlayer(0, game.model.playerAtByID(0), 0);
    game.viewController.movePlayer(1, game.model.playerAtByID(1), 0);
    game.viewController.movePlayer(2, game.model.playerAtByID(2), 0);
    game.viewController.movePlayer(3, game.model.playerAtByID(3), 0);
});
