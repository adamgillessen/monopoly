/**
 * Created by jeff on 07/02/2017.
 * WebSocket demo
 */

/**
 * Global variables
 */
var connector = undefined;
var parser = new Parser();

/**
 * Parser Class
 * Parse message received from server
 * @constructor
 */
function Parser() {
    this.parse = function (raw_data) {
        console.log(raw_data);
    };
}


$(document).ready(function () {
    function create_websocket(ip, port) {
        var tmp = new WebSocket(sprintf("ws://%s:%s", ip, port));
        tmp.onmessage = function (e) {
            parser.parse(e.data);
        };

        window.onbeforeunload = function() {
            tmp.onclose = function () {}; // disable onclose handler first
            tmp.close()
        };
    }

    $("#btnConnect").click(function () {
        if (connector != undefined) {
            connector.close();
            connector = undefined;
        }

        var ip = $("#input-IP").val();
        var port = $("#input-port").val();

        if (connector != undefined) {
            connector.close();
            connector = undefined;
        }
        connector = create_websocket(ip, port);
    });
});