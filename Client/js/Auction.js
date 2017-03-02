/**
 * Created by jeff on 2017/2/22.
 */

/**
 * Auction handler
 * @constructor
 */
function Auction() {
    this.property = undefined;

    this.basePrice = undefined;

    this.state = undefined;
}

/**
 * State during Auction
 * @type {{YOU_BID: string, YOU_BIDED: string, NOT_YOUR_BID: string}}
 */
var AUCTION_STATE = {
    YOU_BID: "You should bid now",
    YOU_BIDED: "You have bided, please wait now",
    NOT_YOUR_BID: "None of your business"
};

/**
 * Start Auction
 * @param {object} data: "auction_start" json object
 */
Auction.prototype.start = function (data) {
    this.property = data["property"];
    this.basePrice = data["base_price"];

    showButtons(null);

    if (data["competitor"].indexOf(game.clientID) >= 0) {
        this.state = AUCTION_STATE.YOU_BID;

        // Don't forget to change it back
        $("#submit").text("Bid");
        $("#input-chat").val(this.basePrice);
    } else {
        this.state = AUCTION_STATE.NOT_YOUR_BID;
    }
};

/**
 * This client places bid
 * @param {number} price: The price this player placed
 */
Auction.prototype.bid = function (price) {
    if (this.state !== AUCTION_STATE.YOU_BID) {
        return;
    }

    this.state = AUCTION_STATE.YOU_BIDED;
    $("#submit").text("Send");

    // Bid 0 to quit Auction
    if (price === 0) {
        log("You quit this Auction", 5);
        game.connector.sendMessage(generateMessage("auction_bid", {
            price: 0
        }));

        return;
    }

    // What players bid must be greater than base line
    var finalPrice = price >= this.basePrice ? price : this.basePrice;
    // Base price is greater than what player has
    if (this.basePrice >= game.model.selectPlayer(game.clientID).money) {
        log("Invalid bid:\nYou don't have enough money to place minimal bid\nYou automatically quit this Auction", 5);
        finalPrice = 0;
    } else if (finalPrice >= game.model.selectPlayer(game.clientID).money) {
        // So Base price is lower than what player has,
        // And player placed bid more than they have
        // Change it
        log("Invalid bid:\nYou have placed more than what you have", 5);
        finalPrice = this.basePrice;
    }

    log("You have placed bid: £" + finalPrice, game.clientID);

    game.connector.sendMessage(generateMessage("auction_bid", {
        price: finalPrice
    }));
};

Auction.prototype.finish = function (data) {

};