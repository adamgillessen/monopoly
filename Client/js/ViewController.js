/**
 * Created by jeff on 13/02/2017.
 */
"use strict";

/**
 * Layer: View and Controller
 * @constructor
 */
function ViewController() {
    // Add circles that represents players to HTML
    ViewController.prototype.createPlayers = function (num) {
        var template = '<div id="player-%d" class="player">%d</div>';

        for (var lop = 1; lop <= num; lop++) {
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
    ViewController.prototype.addCallbacksToButtons = function () {
        // Randomly set color for each cell
        // $(".cell").each(function () {
        //     $(this).css("background-color", ranColor());
        // });

        $("#btn-roll").click(function () {
            sendMessage(generateMessage("roll", null));

            showButtons(null);
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
                // todo: show buy failed
                console.log("You dont have enough money!");
            }

            // End of turn reached
            ViewController.prototype.preEndTurn();
        });

        $("#btn-buy-no").click(function () {
            // End of turn reached
            ViewController.prototype.preEndTurn();
        });

        $("#btn-end-turn").click(function () {
            sendMessage(generateMessage("end_turn", null));
            game.viewController.endTurn();
        });

        // Show detail pane of a selected cell
        $(".cell").click(function () {
            showCellDetail(parseInt($(this)[0].id.replace("cell-", "")));
        });
    };

    /**
     * Move circle that represents player to the given cell by id
     * @param {int} to: id of cell to
     * @param {int} player: player id
     */
    ViewController.prototype.movePlayer = function (player, to) {
        selectPlayer(player).detach().appendTo(selectCell(to));
    };

    /**
     * If its current client's turn
     * Show control pane
     */
    ViewController.prototype.yourTurn = function () {
        showButtons([BUTTONS.roll]);
    };

    /**
     * Show buy window to user
     * @param propertyIndex: from range 0 - 39
     */
    ViewController.prototype.promptBuyWindow = function (propertyIndex) {
        showButtons([BUTTONS.buy_options]);
        setContextValue("buy", propertyIndex);
    };

    /**
     * Reachs end of turn, show end turn button to players and more
     */
    ViewController.prototype.preEndTurn = function () {
        showButtons([BUTTONS.end_turn]);
    };

    /**
     * Call this after end turn button pressed
     */
    ViewController.prototype.endTurn = function () {
        showButtons(null);
    };
}