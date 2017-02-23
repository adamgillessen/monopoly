"""
This is the server which will control the Monopoly game and interface 
with the Clients. 
"""

import websocket_server
import json
import random
from Board import * 
import sys 

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
        self._current_bidders = None 

    def next_id(self):
        """
        Returns the next id which can be used by a joining player

        :returns: the next client id 
        """
        self._num_players += 1
        return self._num_players 

    def num_players(self):
        """
        Returns the number of players currently connected to the game. 

        :returns: the number of players in the game
        """
        return self._num_players

    def start_game(self):
        """
        Initialises a board with the current players. 
        """
        self._board = Board(self.num_players())

    def take_turn(self, player_id, dice1, dice2):
        """
        Has the board run the next turn. This is a proxy-method to the board's
        take_turn co-routine.

        :param player_id: the id of the player whose turn it is
        :param dice1: the value which dice1 is 
        :param dice2: the value which dice2 is         
        :yields: the results of the board's turn generator
        """
        turn = self._board.take_turn(player_id, dice1, dice2)
        yield from turn

    def current_player(self):
        """
        Returns the player whose turn it currently is.

        :returns: the id of the current player
        """
        return self._current_turn

    def roll_dice(self):
        """
        A proxy method to the board's roll_dice method.

        :returns: the result of the dice roll as a tuple of ints
        """
        return self._board.roll_dice()

    def next_player(self):
        """
        Changes the player whose turn it is from the last, to the next.
        """
        self._current_turn += 1
        if self._current_turn == self.num_players() + 1:
            self._current_turn = 1

    @property
    def current_turn_generator(self):
        """
        This is the generator which is handling the current turn on the board.
        """
        return self._current_turn_generator

    @current_turn_generator.setter
    def current_turn_generator(self, new_current_turn_generator):
        self._current_turn_generator = new_current_turn_generator

    def game_state(self):
        """
        This gets the current game state from the baord.

        :returns: a dictionary in the form of the board_sync message
        """
        return self._board.game_state()

    def get_all_players(self):
        """
        A list of all the player ids in the game.

        :returns: a list of player ids who are taking part in the game 
        """
        return self._board.all_players()

    @property
    def current_bidders(self):
        """
        This is a list of all player_ids which are invlolved in a bid
        """
        return self._current_bidders

    @current_bidders.setter
    def current_bidders(self, new_current_bidders):
        self._current_bidders = new_current_bidders

    @property
    def bids(self):
        """
        This is a dictionary of player_id, bid amount pairs for the current auction
        """
        return self._bids

    @bids.setter
    def bids(self, new_bids):
        self._bids = new_bids

    @property
    def auction_property(self):
        """
        This is the ID of the property currently being auctioned. 
        """
        return self._auction_property

    @auction_property.setter
    def auction_property(self, new_auction_property):
        self._auction_property = new_auction_property

    def get_auction_result(self):
        """
        Gets the results of the current auction. A list of player_ids of those who
        bid the max_amount and the actual maximum bid is returned. 

        :returns: a tuple of length 2 - (winning_players, max_bid_amount)
        """
        max_bid = max(self._bids.values())
        max_bid_players = [player_id for \
            player_id, bid_amount in self._bids.items() \
                if bid_amount == max_bid]
        return max_bid_players, max_bid

def new_client(client, server):
    """
    This function will be run when a new client connects to the server. 

    :param client: the new client dictionary
    :param server: a reference to the WebSocket Server
    """
    pass # print(">> Client {} has joined".format(client))



def recv_message(client, server, message):
    """
    This function will be run when a message is recieved from one of
    the connected clients.

    :param client: the client dictionary which the message came from
    :param server: a reference to the WebSocket Server
    :param message: the message which has been received
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

            board_sync_json = s.game_state()
            board_sync_string = json.dumps(board_sync_json)
            server.send_message_to_all(board_sync_string.encode("utf-8"));print("Sending: {}".format(board_sync_string))


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
        
        board_sync_json = s.game_state()
        board_sync_string = json.dumps(board_sync_json)
        server.send_message_to_all(board_sync_string.encode("utf-8"));print("Sending: {}".format(board_sync_string))

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
            s.current_turn_generator.send("buy")
            response_json = {
                "type": "buy_ack",
                "source": s.current_player(),
                "property": json_string["property"],
            }

            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))

    elif json_string["type"] == "auction":
        response_json = {
            "type" : "auction_start",
            "competitor": s.get_all_players(),
            "source": json_string["source"],
            "property": json_string["property"],
            "base_price": 10,
        }
        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))
        s.current_bidders = s.get_all_players()
        s.bids = {}
        s.auction_property = json_string["property"]

    elif json_string["type"] == "auction_bid":
        player_id = json_string["source"]
        bid_amount = json_string["price"]
        s.bids[player_id] = bid_amount

        response_json = {
            "type": "auction_bid_ack",
            "source": json_string["source"],
        }
        response_json_string = json.dumps(response_json)
        server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))
        
        if len(s.bids) == len(s.current_bidders):
            max_bid_players, max_bid = s.get_auction_result()
            if len(max_bid_players) == 1:
                response_json = {
                    "type": "auction_finished",
                    "property": s.auction_property,
                    "price": max_bid,
                    "winner": max_bid_players[0],
                }
                response_json_string = json.dumps(response_json)
                server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))
            
                s.current_turn_generator.send((max_bid_players[0], max_bid))

            else:
                response_json = {
                    "type" : "auction_start",
                    "competitor": max_bid_players,
                    "source": json_string["source"],
                    "property": json_string["property"],
                    "base_price": max_bid,
                }
                response_json_string = json.dumps(response_json)
                server.send_message_to_all(response_json_string.encode("utf-8"));print("Sending: {}".format(response_json_string))
                s.current_bidders = max_bid_players
                s.bids = {}
                s.auction_property = json_string["property"]

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
    hostname, portnumber = sys.argv[1:]
    portnumber = int(portnumber)
    s = Server()
    ws = websocket_server.WebsocketServer(portnumber, hostname)
    ws.set_fn_new_client(new_client)
    ws.set_fn_message_received(recv_message)
    ws.run_forever()
