var conn = new WebSocket("ws://localhost:4444");

conn.onmessage = function (e) {
    console.log(e.data);
};

document.getElementById("btnSend").addEventListener("click", function () {
    console.log("Sent: \n" + document.getElementById("input").value);
    conn.send(document.getElementById("input").value);
});
