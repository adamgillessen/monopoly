/**
 * Created by jeff on 2017/2/22.
 */

// Model and view layer
function Auction() {
    this.property = undefined;

    this.basePrice = undefined;

    this.state = undefined;
}

var AUCTION_STATE = {
    YOU_BID: "You should bid now",
    YOU_BIDED: "You have bided, please wait now",
    NOT_YOUR_BID: "None of your business"
};

Auction.prototype.start = function (data) {
    this.property = data["property"];
    this.basePrice = data["base_price"];

    showButtons(null);

    if (data["competitor"].indexOf(game.clientID) >= 0) {
        this.state = AUCTION_STATE.YOU_BID;

        // Don't forget to change it back
        $("#submit").text("Bid");
    } else {
        this.state = AUCTION_STATE.NOT_YOUR_BID;
    }
};

Auction.prototype.bid = function (price) {
    if (this.state !== AUCTION_STATE.YOU_BID) {
        return;
    }

    this.state = AUCTION_STATE.YOU_BIDED;
    $("#submit").text("Send");

    var finalPrice = price >= this.basePrice ? price : this.basePrice;
    game.connector.sendMessage(generateMessage("auction_bid", {
        price: finalPrice
    }));

    return finalPrice;
};

Auction.prototype.finish = function (data) {

};