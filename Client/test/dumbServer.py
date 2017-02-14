import websocket_server


def newClient(a, b):
    print("New client connected")


def incoming(client, server, message):
    print(message)


if __name__ == "__main__":
    ws = websocket_server.WebsocketServer(4444, "127.0.0.1")
    ws.set_fn_new_client(newClient)
    ws.set_fn_message_received(incoming)
    ws.run_forever()
