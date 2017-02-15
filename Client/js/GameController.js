/**
 * Created by jeff on 13/02/2017.
 */

/**
 * Layer: View and Controller
 * @constructor
 */
function GameController() {
    // Add circles that represents players to HTML
    GameController.prototype.createPlayers = function (num) {
        var template = '<div id="player-%d" class="player">%d</div>';

        for (var lop = 0; lop < num; lop++) {
            $("#cell-0").append($(sprintf(template, lop, lop)));
        }

        $(".player").each(function () {
            $(this).css("background-color", function () {
                return "rgb(" + ranRange(255) + "," + ranRange(255) + "," + ranRange(255) + ")";
            });
        });
    };

    /**
     * Add all callback functions to button here
     */
    GameController.prototype.initBoard = function () {
        // Randomly set color for each cell
        $(".cell").each(function () {
            $(this).css("background-color", ranColor());
        });

        for (var lop = 0; lop < 40; lop++) {
            if (game.model.cells[lop].type == "property") {
                // Display property name and price
                selectCell(lop).text("Hospital" + " - " + game.model.cells[lop].price);
            } else {
                // Display action name
                selectCell(lop).text("Tax");
            }
        }

        $("#btn-roll").click(function () {
            sendMessage(generateMessage("roll", null));

            $(this).hide();
        });

        /**
         * On click:
         * 1. Get the index of property that player is going to buy
         * 2. Call the canBuyProperty func on that player
         * 3. Send this buy message to server
         */
        $("#btn-buy-yes").click(function () {
            var propertyIndex = parseInt(getContextValue("buy"));

            if (game.model.selectPlayer(game.clientID).canBuyProperty(propertyIndex)) {
                sendMessage(generateMessage("buy", {
                    "property": propertyIndex
                }));
            } else {
                // todo: warn locally, no need to send message
            }

            $("#prompt-buy").hide();
        });

        $("#btn-buy-no").click(function () {
            $("#prompt-buy").hide();
        });
    };

    /**
     * Move circle that represents player to the given cell by id
     * @param {int} to: id of cell to
     * @param {int} player: player id
     */
    GameController.prototype.movePlayer = function (player, to) {
        selectPlayer(player).detach().appendTo(selectCell(to));
    };

    GameController.prototype.yourTurn = function () {
        $(".your_turn").show();
    };

    /**
     * Show buy window to user
     * @param propertyIndex: from range 0 - 39
     */
    GameController.prototype.promptBuyWindow = function (propertyIndex) {
        console.log(">>>>>\n Buy", propertyIndex, "?");
        $("#prompt-buy").show();
        setContextValue("buy", propertyIndex);
    };
}