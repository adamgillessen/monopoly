"""
This is the server which will control the Monopoly game and interface 
with the Clients. 
"""

import websocket_server
import json
import random
from Board import * 

#Run to install the websocket server:
#    sudo pip3 install websocket-server

s = None

class Server:
    """
    This class holds all Server information and controls the board.
    """
    def __init__(self):
        """
        Instantiates a new Server object. 
        """
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
        self._board = Board(self.num_players())

    def take_turn(self, player_id, dice1, dice2):
        """
        Has the board run the next turn. 

        :param player_id the id of the player whose turn it is
        """
       
        print("D1, D2 : {}, {}".format(dice1, dice2))
        turn = self._board.take_turn(player_id, dice1, dice2)
        yield from turn

    def current_player(self):
        """
        Returns the player whose turn it currently is.
        :return the id of the current player
        """
        return self._current_turn

    def roll_dice(self):
        return self._board.roll_dice()

    def next_player(self):
        self._current_turn += 1
        if self._current_turn == self.num_players() + 1:
            self._current_turn = 1

    @property
    def current_turn_generator(self):
        return self._current_turn_generator

    @current_turn_generator.setter
    def current_turn_generator(self, new_current_turn_generator):
        self._current_turn_generator = new_current_turn_generator

    def game_state(self):
        return self._board.game_state()


def new_client(client, server):
    """
    This function will be run when a new client connects to the server. 
    :param client - the new client dictionary
    :param server - a reference to the WebSocket Server
    """
    pass # print("A new client {} has joined".format(client))



def recv_message(client, server, message):
    """
    This function will be run when a message is recieved from one of
    the connected clients. 
    :param client - the client dictionary which the message came from
    :param server - a reference to the WebSocket Server
    :param message - the message which has been received
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
        server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))
        if s.num_players() == 4:
            s.start_game()

            #board_sync_json = s.game_state()
            #board_sync_string = json.dumps(board_sync_json)
            #server.send_message_to_all(board_sync_string.encode("utf-8"));print("Sending: {}".format(board_sync_string))


            response_json = {
                "type": "your_turn",
                "source": 1,
            }
            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))


    elif json_string["type"] == "start_game_now":
        s.start_game()
        response_json = {
            "type": "player_join_ack",
            "key" : -1,
            "your_id": -1,
            "current_player" : s.num_players(),
            "expects" : 4,
            "game_start" : True,

        }
        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))
        
        #board_sync_json = s.game_state()
        #board_sync_string = json.dumps(board_sync_json)
        #server.send_message_to_all(board_sync_string.encode("utf-8"));print("Sending: {}".format(board_sync_string))

        response_json = {
            "type": "your_turn",
            "source": 1,
        }
        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))
    
    elif json_string["type"] == "roll":
        player_id = json_string["source"]
        dice1, dice2 = s.roll_dice()
        
        s.current_turn_generator = s.take_turn(player_id, dice1, dice2)
        s.current_turn_generator.send(None)
        
        response_json = {
            "type": "roll_result",
            "source": player_id,
            "result": [dice1, dice2],
        }

        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))

    elif json_string["type"] == "buy":
        if json_string["property"] == -1:
            s.current_turn_generator.send("no_buy")
        
        else:
            property_id = s.current_turn_generator.send("buy")
            response_json = {
                "type": "buy_ack",
                "source": s.current_player(),
                "property": property_id,
            }

            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))

        

    elif json_string["type"] == "end_turn":
        board_sync_json = s.game_state()
        human_string = s.current_turn_generator.send(None)
        board_sync_json["text"] = human_string

        board_sync_string = json.dumps(board_sync_json)
        server.send_message_to_all(board_sync_string.encode("utf-8"));print("Sending: {}".format(board_sync_string))

        print(human_string)
        
        s.next_player()
        new_current_player_id = s.current_player()
        response_json = {
            "type": "your_turn",
            "source": new_current_player_id,
        }
        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))

if __name__ == "__main__":
    s = Server()
    ws = websocket_server.WebsocketServer(4444, "127.0.0.1")
    ws.set_fn_new_client(new_client)
    ws.set_fn_message_received(recv_message)
    ws.run_forever()
