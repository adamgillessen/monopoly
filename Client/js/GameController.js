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
            $("#hideout").append($(sprintf(template, lop, lop)));
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
            $(this).text("Hospital");
        });

        $("#btnRoll").click(function () {
            sendMessage(getMsgFunc("roll"));
        });
    };

    /**
     * Move circle that represents player to the given cell by id
     * @param {int|undefined} from: id of cell from
     * @param {int} to: id of cell to
     * @param {int} player: player id
     */
    GameController.prototype.movePlayer = function (player, to, from) {
        selectPlayer(player).detach().appendTo(selectCell(to));
    };

    GameController.prototype.yourTurn = function () {
        $("#control-pane").show();
    };
}