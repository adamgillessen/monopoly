/**
 * Created by jeff on 13/02/2017.
 */
"use strict";

/**
 * Layer: View and Controller
 */
function ViewController() {

}

/**
 * Which square is being displayed in the detail pane
 * @type {int}
 */
ViewController.currentSelectedSquare = undefined;

// Add circles that represents players to HTML
ViewController.createPlayers = function (num) {
    var template = '<div id="player-%d" class="player">%d</div>';

    for (var lop = 1; lop <= num; lop++) {
        $("#cell-0").append($(sprintf(template, lop, lop)));
    }

    $(".player").each(function () {
        $(this).css("background-color", ranColor());
    });
};

ViewController.addCallbacksToEvents = function () {
    Player.onMoneyChange = function (id, money) {
        $("#money").text(money);
    };

    Player.onPositionChange = function (id, from, to) {
        ViewController.movePlayer(id, to);
    };

    Property.onOwnerChange = function (id, owner) {
        if (id === ViewController.currentSelectedSquare) {
            showCellDetail(id);
        }
    };
};

/**
 * Add all callback functions to button here
 */
ViewController.addCallbacksToButtons = function () {
    $("#btn-roll").click(function () {
        game.connector.sendMessage(generateMessage("roll", null));

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
            // Change money value first
            game.model.selectPlayer(game.clientID).changeMoney(-game.model.selectCell(propertyIndex).price);

            // Change property owner, too
            game.model.selectCell(propertyIndex).changeOwner(game.clientID);

            // Send buy message to server
            game.connector.sendMessage(generateMessage("buy", {
                "property": propertyIndex
            }));
        } else {
            // todo: auction
            console.log("You dont have enough money!");
        }

        // End of turn reached
        ViewController.preEndTurn();
    });

    /**
     * todo
     * Auction
     */
    $("#btn-buy-no").click(function () {
        // Dont buy
        game.connector.sendMessage(generateMessage("buy", {
            property: -1
        }));

        // End of turn reached
        ViewController.preEndTurn();
    });

    $("#btn-end-turn").click(function () {
        game.connector.sendMessage(generateMessage("end_turn", null));
        ViewController.endTurn();
    });

    // Show detail pane of a selected cell
    $(".cell").click(function () {
        var id = parseInt($(this)[0].id.replace("cell-", ""));
        showCellDetail(id);
        ViewController.currentSelectedSquare = id;
    });
};

/**
 * Move circle that represents player to the given cell by id
 * @param {int} to: id of cell to
 * @param {int} player: player id
 */
ViewController.movePlayer = function (player, to) {
    selectPlayer(player).detach().appendTo(selectCell(to));
};

/**
 * Call this if its current client's turn
 * Show control pane
 */
ViewController.yourTurn = function () {
    showButtons([BUTTONS.roll]);
};

/**
 * Show buy window to user
 * @param propertyIndex: from range 0 - 39
 */
ViewController.promptBuyWindow = function (propertyIndex) {
    showButtons([BUTTONS.buy_options]);
    setContextValue("buy", propertyIndex);
};

/**
 * Reachs end of turn, show end turn button to players and more
 */
ViewController.preEndTurn = function () {
    showButtons([BUTTONS.end_turn]);
};

/**
 * Call this after end turn button pressed
 */
ViewController.endTurn = function () {
    showButtons(null);
};
