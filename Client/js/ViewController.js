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

ViewController.addCallbacksToEvents = function () {
    Player.onMoneyChange = function (id, money) {
        $("#money").text("£" + money);
    };

    Player.onPositionChange = function (id, from, to) {
        ViewController.movePlayer(id, to);
    };

    Player.onGoPassed = function (id) {
        if (game.isSource(id)) {
            log("You have passed GO, got 200", id);
        } else {
            log(sprintf("Player %d has passed GO, got 200", id), id);
        }

        game.model.selectPlayer(id).changeMoney(200);
    };

    Property.onOwnerChange = function (id, owner) {
        if (id === ViewController.currentSelectedSquare) {
            ViewController.showCellDetail(id);
        }

        // If this player gets new property, add it to inventory
        if (game.isSource(owner)) {
            ViewController.addToInventory(id);
        }
    };

    Property.onBuildProgressChange = function (id, progress) {
        if (id === ViewController.currentSelectedSquare) {
            ViewController.showCellDetail(id);
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
        ViewController.showCellDetail(id);
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
            if (getThisPlayerModel().hasEnoughMoneyThan(selectCellModel(propertyToBuild).rent)) {
                // Send build message
                game.connector.sendMessage(generateMessage("build_house", {
                    property: propertyToBuild
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
        // todo: mortgage
    });

    // Sell property
    $("#p-c-sell").click(function () {
        // todo: sell
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
        // todo: Get out of jail card

        var current = $(sprintf(templateProperty, id, id, ViewController.tableName[id]));
        current.appendTo('#inventory');

        // Click item in Inventory Pane
        current.click(function () {
            var id = parseInt($(this).children(".square").text());
            ViewController.showCellDetail(id);
        });
    }

    game.model.propertiesOwnedByThisPlayer.push(id);
    game.model.propertiesOwnedByThisPlayer.sort(function (a, b) {
        return a > b;
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

        var bid = game.auctionHandler.bid(price);

        log("You have placed bid: " + bid, game.clientID);
    } else {
        // Send Chat
        game.connector.sendMessage(generateMessage("chat", {
            text: stringVal
        }));
    }
};

/**
 * Show details of a given cell to the detail-pane section in HTML
 * @param {number} id
 */
ViewController.showCellDetail = function (id) {
    if (typeof id !== "number") {
        id = parseInt(id);
    }

    var notProperties = [5, 12, 15, 25, 28, 35];

    ViewController.currentSelectedSquare = id;

    var name = ViewController.tableName[id];
    var cell = game.model.selectCell(id);

    if (cell.type === "property") {
        // Hide action pane
        // Show property pane
        $("#property").show();
        $("#action").hide();

        // Add class
        $("#property-banner").removeClass();
        $("#property-banner").addClass("cell-" + id);

        // ID
        $("#property-id").text(cell.id);
        // Property Name
        $("#property-name").text(name);

        // Estate info
        if (cell.estate === -1) {
            // This is UTIL or TRANS
            $("#property-estate").text(" --- ");
            $("#property-build").text(" --- ");
        } else {
            // This is Property
            $("#property-estate").text("Estate: " + cell.estate);
            $("#property-build").text(generateProgressBar(cell.buildProgress, 5));
        }

        // Price info
        $("#property-price").text("Price: £" + cell.price);
        // Rent info
        if (cell.rent === -1) {
            $("#property-rent").text("");
        } else {
            $("#property-rent").text(sprintf("Rent: £%d", cell.displayRent));
        }

        // Control pane hide.
        $("#property-controls").hide();

        // Owner info
        var owner = cell.owner;
        if (owner === -1) {
            $("#property-owner").text("ON SALE");
        } else {
            if (game.isSource(owner)) {
                $("#property-owner").text("Owner: You");
                $("#property-controls").show();

                // Show or hide "Build" button base on this is property or other
                // If this is property
                if (notProperties.indexOf(id) < 0) {
                    if (game.model.canBuildHouse(id)) {
                        showPropertyButtons([BUTTONS_PROPERTY.build, BUTTONS_PROPERTY.mortgage, BUTTONS_PROPERTY.sell]);
                    } else {
                        showPropertyButtons([BUTTONS_PROPERTY.mortgage, BUTTONS_PROPERTY.sell]);
                    }
                    // Change rent info
                    $("#build-cost").text(cell.rent);
                } else {
                    // This is util or transp
                    showPropertyButtons([BUTTONS_PROPERTY.mortgage, BUTTONS_PROPERTY.sell]);
                }
            } else {
                $("#property-owner").text("Owner: Player " + owner);
            }
        }
    } else {
        $("#action").show();
        $("#property").hide();

        $("#action-banner").removeClass();
        $("#action-banner").addClass("cell-" + id);

        $("#action-id").text(cell.id);
        $("#action-description").text(name);
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
    showButtons([BUTTONS.roll]);
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
