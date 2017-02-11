/**
 * Created by jeff on 07/02/2017.
 * WebSocket demo
 */

var connector = new WebSocket("ws://localhost:4444");

connector.onmessage = function (e) {
    console.log("Received: " + e.data);
};
