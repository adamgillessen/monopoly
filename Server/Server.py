import websocket_server
import json

"""
Run to install the websocket_server:
    sudo pip3 install websocket-server
"""


class Server:
    """
    This class holds all Server information. 
    """
    CLIENT_ID = 1

    def __init__(self):
        self.client_keys = {}

    def next_id(self):
        """
        Returns the next client id. 
        """
        temp = Server.CLIENT_ID
        Server.CLIENT_ID += 1 
        return temp 

    def num_players(self):
        """
        Returns the number of players currently connected to the game. 
        """
        return len(self.client_keys)

s = Server()

def new_client(client, server):
    """
    This function will be run when a new client connects to the server. 
    client - the new client object
    server - a reference to the WebSocket Server
    """
    print("A new client {} has joined".format(client))



def recv_message(client, server, message):
    """
    This function will be run when a message is recieved from one of
    the connected clients. 
    client - the client object which the message came from
    server - a reference to the WebSocket Server
    message - the message which has been received
    """
    global s
    print("Received: {}".format(message))
    json_string = json.loads(message)

    if json_string["type"] == "player_join":
        s.client_keys[client["id"]] = json_string["key"]

        response_json = {
            "type" : "player_join_ack",
            "key" : json_string["key"],
            "your_id" : s.next_id(),
            "current_player" : s.num_players(),
            "expects" : 4,
            "game_start" : True if s.num_players() == 4 else False,
        }

        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"))


ws = websocket_server.WebsocketServer(4444, "127.0.0.1")
ws.set_fn_new_client(new_client)
ws.set_fn_message_received(recv_message)
ws.run_forever()