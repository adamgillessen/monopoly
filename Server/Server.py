import websocket_server
import json

"""
Run to install the websocket_server:
    sudo pip3 install websocket-server
"""
s = None

class Server:
    """
    This class holds all Server information. 
    """

    def __init__(self):
        self._current_turn = 1
        self._board = None
        self._num_players = 0

    def next_id(self):
        """
        Returns the next client id. 
        """
        self._num_players += 1
        return self._num_players 

    def num_players(self):
        """
        Returns the number of players currently connected to the game. 
        """
        return self._num_players

    def start_game(self):
        """
        Initialises a board with the current players. 
        """
        self._b = Board(self.num_players())


def new_client(client, server):
    """
    This function will be run when a new client connects to the server. 
    client - the new client dictionary
    server - a reference to the WebSocket Server
    """
    print("A new client {} has joined".format(client))



def recv_message(client, server, message):
    """
    This function will be run when a message is recieved from one of
    the connected clients. 
    client - the client dictionary which the message came from
    server - a reference to the WebSocket Server
    message - the message which has been received
    """
    global s 
    print("Received: {}".format(message))
    json_string = json.loads(message)

    if json_string["type"] == "player_join":
        response_json = {
            "type" : "player_join_ack",
            "key" : json_string["key"],
            "your_id" : s.next_id(),
            "current_player" : s.num_players(),
            "expects" : 4,
            "game_start" : False if s.num_players() < 4 else True,
        }
        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"))
        if s.num_players() == 4:
            response_json = {
                "type": "your_turn",
                "source": 1,
            }
            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"))

    elif json_string["type"] == "start_game_now":
        response_json = {
            "type": "player_join_ack",
            "key" : -1,
            "your_id": -1,
            "current_player" : s.num_players(),
            "expects" : 4,
            "game_start" : True,

        }
        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"))
        
        response_json = {
            "type": "your_turn",
            "source": 1,
        }
        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"))


if __name__ == "__main__":
    s = Server()
    ws = websocket_server.WebsocketServer(4444, "127.0.0.1")
    ws.set_fn_new_client(new_client)
    ws.set_fn_message_received(recv_message)
    ws.run_forever()