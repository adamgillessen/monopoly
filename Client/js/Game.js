/**
 * Codes that control the whole game
 */

function Game() {
    /**
     * WebSocket, use this to send message to server
     * @type {WebSocket}
     */
    this.socket = undefined;

    /**
     * Used only during connecting phase for server to identify client
     * @type {int}
     */
    this.identificationNum = undefined;
    /**
     * Unique ID for this player/client
     * Obtained from server
     * @type {int}
     */
    this.clientID = undefined;

    /**
     * Parser for message from server
     * @type {Parser}
     */
    this.parser = new Parser();
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
