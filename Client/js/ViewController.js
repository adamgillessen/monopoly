/**
 * Created by jeff on 13/02/2017.
 */
"use strict";

/**
 * Class with static methods and viriables only
 * Layer: View and Controller
 */
function ViewController() {

}

/**
 * Which square is being displayed in the detail pane
 * @type {number}
 */
ViewController.currentSelectedSquare = 0;

/**
 * Name of each square
 */
ViewController.tableName = JSON.parse('{"0":"GO","1":"Old Kent Road","10":"Jail","11":"Pall Mall","12":"Electric Company","13":"Whitehall","14":"Northumberland Avenue","15":"Marylebone Station","16":"Bow Street","17":"Community Chest","18":"Marlborough Street","19":"Vine Street","2":"Community Chest","20":"Free Parking","21":"Strand","22":"Chance","23":"Fleet Street","24":"Trafalger Square","25":"Fenchurch St. Station","26":"Leicester Square","27":"Coventry Street","28":"Internet","29":"Dundrum S.C","3":"Whitechapel Road","30":"Go to Jail","31":"Regent Street","32":"Oxford Street","33":"Community Chest","34":"Bond Street","35":"Liverpool St. Station","36":"Chance","37":"Park Lane","38":"Super Tax","39":"Mayfair","4":"Income Tax","5":"Kings Cross Station","6":"The Angel, Islington","7":"Chance","8":"Euston Road","9":"Pentonville Road"}');

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

/**
 * Add callback functions to events generated in Models.js
 */
ViewController.addCallbacksToEvents = function () {
    Player.prototype.onCardChange = function () {
        if (game.isThisClient(this.id)) {
            this.hasCard ? $("#free-card").show() : $("#free-card").hide();
        }
    };

    Player.prototype.onJailChange = function () {
        if (game.isThisClient(this.id)) {
            this.inJail ? $("#btn-use-card").show() : $("#btn-use-card").hide();

            if (this.inJail) {
                // You goes to jail
                // doubleRoll is invalid
                // because u cant roll anymore
                game.doubleRoll = false;
            }
        } else {
            // Others get out of jail
            if (!this.inJail) {
                log(sprintf("Player %d has been set free", this.id), 5);
            }
        }
    };

    Player.prototype.onMoneyChange = function () {
        if (game.isThisClient(this.id)) {
            $("#money").text("£" + this.money);
        }
    };

    Player.prototype.onPositionChange = function () {
        ViewController.movePlayer(this.id, this.position);
    };

    Player.prototype.onGoPassed = function () {
        if (game.isThisClient(this.id)) {
            log("You have passed GO, got 200", this.id);
        } else {
            log(sprintf("Player %d has passed GO, got 200", this.id), this.id);
        }

        selectPlayerModel(this.id).changeMoney(200);
    };

    Square.prototype.onOwnerChange = function () {
        if (this.id === ViewController.currentSelectedSquare) {
            selectSquareModel(this.id).showDetail();
        }

        // If this player gets new property, add it to inventory
        if (game.isThisClient(this.owner)) {
            ViewController.addToInventory(this.id);
        }
    };

    Square.prototype.onMortgageChange = function () {
        if (this.id === ViewController.currentSelectedSquare) {
            selectSquareModel(this.id).showDetail();
        }
    };

    Square.prototype.onRentChange = function () {
        if (this.id === ViewController.currentSelectedSquare) {
            selectSquareModel(this.id).showDetail();
        }
    };

    Square.prototype.onBuildProgressChange = function () {
        if (this.id === ViewController.currentSelectedSquare) {
            selectSquareModel(this.id).showDetail();
        }
    };
};

/**
 * Add all callback functions to buttons
 */
ViewController.addCallbacksToButtons = function () {
    $("#btn-roll").click(function () {
        game.connector.sendMessage(generateMessage("roll", null));

        showButtons(null);
    });

    $("#btn-pay-bail").click(function () {
        // No enough money to pay bail
        if (!getThisPlayerModel().hasEnoughMoneyThan(50)) {
            alert("You don't have enough money to pay bail!");
            return;
        }

        // Log
        log("You have got out of Jail by paying bail", 5);

        // Set Model
        getThisPlayerModel().setJail(false);
        getThisPlayerModel().changeMoney(-50);

        // Send message
        game.connector.sendMessage(generateMessage("pay_bail", {
            useCard: false
        }));

        // You can still roll the dice
        ViewController.yourTurn();
    });

    $("#btn-use-card").click(function () {
        if (!getThisPlayerModel().hasCard || !getThisPlayerModel().inJail) {
            throw new Error("This button shouldn't be clicked");
        }

        // log
        log("You have got out of Jail by using\nGet Our of Jail Free Card", 5);

        // Set model
        getThisPlayerModel().setJail(false);
        getThisPlayerModel().setCard(false);

        // Send message
        game.connector.sendMessage(generateMessage("pay_bail", {
            useCard: true
        }));

        // You can still roll the dice
        ViewController.yourTurn();
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
            // Send buy message to server
            game.connector.sendMessage(generateMessage("buy", {
                "property": propertyIndex
            }));
        } else {
            log("You don't have enough money to buy this property", 5);
            log("Start Auction instead", 5);

            // Send auction message
            game.connector.sendMessage(generateMessage("auction", {
                property: propertyIndex
            }));
        }

        // End of turn reached
        ViewController.preEndTurn();
    });

    /**
     * Auction Button
     */
    $("#btn-buy-no").click(function () {
        var propertyIndex = parseInt(getContextValue("buy"));

        // Send auction message
        game.connector.sendMessage(generateMessage("auction", {
            property: propertyIndex
        }));
    });

    $("#btn-end-turn").click(function () {
        ViewController.endTurn();
    });

    $("#input-chat").keydown(function (e) {
        // Return key
        if (e.keyCode === 13) {
            ViewController.chatButtonClicked();
        }
    });

    $("#submit").click(function () {
        ViewController.chatButtonClicked();
    });

    // Show detail pane of a selected cell
    $(".cell").click(function () {
        var id = parseInt($(this)[0].id.replace("cell-", ""));
        selectSquareModel(id).showDetail();
    });

    /////////////////
    // Detail pane //
    /////////////////

    // Build property
    $("#p-c-build").click(function () {
        var propertyToBuild = ViewController.currentSelectedSquare;
        // Check if all properties of same estate are owned by this player
        if (game.model.canBuildHouse(propertyToBuild)) {
            // Check if this player has enough money to build
            if (getThisPlayerModel().hasEnoughMoneyThan(selectSquareModel(propertyToBuild).buildCost)) {
                // Send build message
                game.connector.sendMessage(generateMessage("build_house", {
                    property: propertyToBuild,
                    sell: false
                }));
            } else {
                alert("You don't have enough money to build!");
            }
        } else {
            alert("You can only build after you owns all properties in the same estate!");
        }
    });

    // Mortgage property
    $("#p-c-mortgage").click(function () {
        game.connector.sendMessage(generateMessage("mortgage_property", {
            property: ViewController.currentSelectedSquare,
            unmortgage: false
        }));
    });

    // Un-mortgage property
    $("#p-c-unmortgage").click(function () {
        if (!getThisPlayerModel().hasEnoughMoneyThan(selectSquareModel(ViewController.currentSelectedSquare).price / 2 * 1.1)) {
            alert("You don't have enough money to buy back this property!");
            return;
        }

        game.connector.sendMessage(generateMessage("mortgage_property", {
            property: ViewController.currentSelectedSquare,
            unmortgage: true
        }));
    });

    // Sell property
    $("#p-c-sell").click(function () {
        game.connector.sendMessage(generateMessage("build_house", {
            property: ViewController.currentSelectedSquare,
            sell: true
        }));
    });
};

/**
 * Add element to Inventory pane in HTML
 *
 * @param {number} id: ID of property, if ID === 41, it means "Get out of Jail free" card
 */
ViewController.addToInventory = function (id) {
    function addEachToInventory(id) {
        var templateProperty = '<div class="owned">' +
            '<div class="square cell-%d">%d</div>' +
            '<div class="placename">%s</div>' +
            '</div>';

        var current = $(sprintf(templateProperty, id, id, ViewController.tableName[id]));
        current.appendTo('#inventory');

        // Click item in Inventory Pane
        current.click(function () {
            var id = parseInt($(this).children(".square").text());
            selectSquareModel(id).showDetail();
        });
    }

    game.model.propertiesOwnedByThisPlayer.push(id);
    game.model.propertiesOwnedByThisPlayer.sort(function (a, b) {
        if (a === b) {
            return 0;
        }

        return a > b ? 1 : -1;
    });

    // Clear all items in Inventory pane
    $(".owned").remove();

    for (var lop = 0; lop < game.model.propertiesOwnedByThisPlayer.length; lop++) {
        addEachToInventory(game.model.propertiesOwnedByThisPlayer[lop]);
    }
};

/**
 * Function to be executed when the button in the chat window is clicked
 */
ViewController.chatButtonClicked = function () {
    var stringVal = $("#input-chat").val();
    // Clear input field
    $("#input-chat").val("");

    if (stringVal === null || stringVal === undefined || stringVal.length === 0) {
        return;
    }

    if (game.state === GAME_STATE.AUCTION && game.auctionHandler.state === AUCTION_STATE.YOU_BID) {
        try {
            var price = parseInt(stringVal);
        } catch (err) {
            log("Please enter valid integer!", 5);
        }

        game.auctionHandler.bid(price);
    } else {
        // Send Chat
        game.connector.sendMessage(generateMessage("chat", {
            text: stringVal
        }));
    }
};

/**
 * Move circle that represents player to the given cell by id
 * @param {number} to: id of cell to
 * @param {number} player: player id
 */
ViewController.movePlayer = function (player, to) {
    selectPlayer(player).detach().appendTo(selectCell(to));
};

/**
 * Call this if its current client's turn
 * Show control pane
 */
ViewController.yourTurn = function () {
    if (getThisPlayerModel().inJail) {
        showButtons([BUTTONS.roll, BUTTONS.pay_bail]);
    } else {
        showButtons([BUTTONS.roll]);
    }
};

/**
 * Show buy window to user
 * @param propertyID: from range 0 - 39
 */
ViewController.promptBuyWindow = function (propertyID) {
    showButtons([BUTTONS.buy_options]);
    setContextValue("buy", propertyID);
};

/**
 * Actually start Auction time!
 * @param {auction_start} data
 */
ViewController.promptAuctionWindow = function (data) {
    game.startAuction(data);
};

/**
 * Reachs end of turn, show end turn button to players and more
 */
ViewController.preEndTurn = function () {
    game.state = GAME_STATE.EOT;
    showButtons([BUTTONS.end_turn]);
};

/**
 * Call this after end turn button pressed
 */
ViewController.endTurn = function () {
    showButtons(null);
    game.connector.sendMessage(generateMessage("end_turn", null));
};
