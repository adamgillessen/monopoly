"""
This is the server which will control the Monopoly game and interface 
with the Clients. 
"""
try:
    import websocket_server
except ImportError:
    print("You need to install websocket-server")
    print("Run:\n\tpip3 install websocket-server")
    exit(1)
import json
import random
from Board import * 
import sys 
from multiprocessing import Process, SimpleQueue
import time
import os 


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
        self._new_roll = True

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
        self._current_turn = self._board.next_player()

    @property
    def current_turn_generator(self):
        """
        This is the generator which is handling the current turn on the board.

        :returns: the generator which is keeping track of the current turn
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

    def is_valid_player(self, player_id):
        """
        Checks of the player_id is a valid one.

        :param player_id: the id of the player being queried
        :returns: True of the player is valid, False otherwise
        """
        return self._board.is_valid_player(player_id)

    @property
    def new_roll(self):
        """
        This says whether or not the server should roll the dice for a new turn or give 0 values so
        a player will take a turn from the same square (when they get moved to a square by a card)
        """
        return self._new_roll

    @new_roll.setter
    def new_roll(self, new_new_roll):
        self._new_roll = new_new_roll

    def mortgage_property(self, player_id, property_id):
        """
        Mortgaes a property so that the player gets the mortage value of the property
        but they collect no rent on it and must buy it back for 10% extra. 

        :param player_id: the id of the player performing the action
        :param proeprty_id: the id of the property which is being acted on
        """
        self._board.mortgage_property(player_id, property_id)

    def unmortgage_property(self, player_id, property_id):
        """
        Buys the property back from the bank, paying an additional
        10% of what the mortage value is. 

        :param player_id: the id of the player performing the action
        :param proeprty_id: the id of the property which is being acted on
        """
        self._board.unmortgage_property(player_id, property_id)

    def sell_house(self, player_id, property_id):
        """
        Sells the house which is owned by player-id and id'd by property id

        :param player_id: the id of the player performing the action
        :param proeprty_id: the id of the property which is being acted on
        """
        self._board.sell_house(player_id, property_id)

    def build_house(self, player_id, property_id):
        """
        Builds a house on property_id owned by playe_id

        :param player_id: the id of the player performing the action
        :param proeprty_id: the id of the property which is being acted on
        """
        self._board.build_house(player_id, property_id)

    def get_current_rent(self, property_id):
        """
        The rent which a player will be charged if they land on the square.

        :param property_id: the id of the property being queried
        :returns: the current rent of the property
        """
        return self._board.get_current_rent(property_id)

    def get_num_houses(self, property_id):
        """
        Returns the number of houses which are currently on property_id

        :param property_id: the id of the property being queried
        :returns: the number of houses on the property
        """
        return self._board.get_num_houses(property_id)

    def leave_jail(self, player_id, free_card = False):
        """
        Has player_id leave jail and continue the game as normal

        :param player_id: the id of the player leaving jail
        """
        self._board.leave_jail(player_id, free_card)

    def get_sell_value(self, property_id):
        """
        Gets the money which you would get from selling
        a house on property property_id.

        :returns: the selling value of a house 
        """
        return self._board.get_sell_value(property_id)


class ClientCount():
    """
    A counter object which is used by each Game Board to count
    the number of clients currently connected to the game.
    """
    def __init__(self):
        self._c = 0
        self._game_started = False

    def __str__(self):
        return str(self._c)

    def inc(self):
        """
        Increments the counter
        """
        self._c += 1 

    def dec(self):
        """
        Decrements the counter
        """
        self._c -= 1 

    def val(self):
        """
        Gets the current number of connected clients

        :returns: the current counter value
        """
        return self._c 

    @property
    def game_started(self):
        """
        True if the game has already begun, false if players can still join
        """
        return self._game_started

    @game_started.setter
    def game_started(self, new_val):
        self._game_started = new_val

        

def new_game_board(hostname, portnumber, queue, game_id):
    """
    This holds the environment for a new game board process.

    :param hostname: the hostname which the game board whill run on
    :param portnumber: the port-number which the web socket will listen on
    :param  queue: the process queue which is used for inter process communication
    :param game_id: the id number of the current game environment
    """

    s = Server()
    num_clients = ClientCount()
    ws = websocket_server.WebsocketServer(portnumber, hostname)
    

    def client_leave(client, server):
        """
        This function will be run when a client disconnects from the server. 

        :param client: the new client dictionary
        :param server: a reference to the WebSocket Server
        """
        
        if not num_clients.game_started:
            queue.put(("new_board", game_id))
            time.sleep(0.1)
            ws.shutdown()
            queue.put(("exit", game_id))

        num_clients.dec()
        if num_clients.val() <= 0:
            ws.shutdown()
            queue.put(("exit", game_id))


    def new_client(client, server):
        """
        This function will be run when a new client connects to the server. 

        :param client: the new client dictionary
        :param server: a reference to the WebSocket Server
        """
        num_clients.inc()


    def recv_message(client, server, message):
        """
        This function will be run when a message is recieved from one of
        the connected clients.

        :param client: the client dictionary which the message came from
        :param server: a reference to the WebSocket Server
        :param message: the message which has been received
        """
        print("Received: {}".format(message))
        json_string = json.loads(message)

        if json_string["type"] == "player_join":
            new_id =  s.next_id()

            if num_clients.game_started:
                del server.clients[server.clients.index(client)]
                return

            response_json = {
                "type" : "player_join_ack",
                "key" : json_string["key"],
                "your_id" :new_id,
                "current_player" : s.num_players(),
                "expects" : 4,
                "game_start" : False if s.num_players() < 4 else True,
            }
            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"))
            print("Sending: {}".format(response_json_string))
            if s.num_players() == 4:
                s.start_game()

                board_sync_json = s.game_state()
                board_sync_string = json.dumps(board_sync_json)
                server.send_message_to_all(board_sync_string.encode("utf-8"))
                print("Sending: {}".format(board_sync_string))


                response_json = {
                    "type": "your_turn",
                    "source": 1,
                }
                response_json_string = json.dumps(response_json)
                server.send_message_to_all(response_json_string.encode("utf-8"))
                print("Sending: {}".format(response_json_string))

                num_clients.game_started = True

                queue.put(("new_board", game_id))


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
            server.send_message_to_all(response_json_string.encode("utf-8"))
            print("Sending: {}".format(response_json_string))
            
            board_sync_json = s.game_state()
            board_sync_string = json.dumps(board_sync_json)
            server.send_message_to_all(board_sync_string.encode("utf-8"))
            print("Sending: {}".format(board_sync_string))

            response_json = {
                "type": "your_turn",
                "source": 1,
            }
            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"))
            print("Sending: {}".format(response_json_string))

            num_clients.game_started = True

            queue.put(("new_board", game_id))
        
        elif json_string["type"] == "roll":
            player_id = json_string["source"]
            if s.new_roll:
                dice1, dice2 = s.roll_dice()
            else:
                dice1, dice2 = 0, 0
                s.new_roll = False
            response_json = {
                "type": "roll_result",
                "source": player_id,
                "result": [dice1, dice2],
            }

            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"))
            print("Sending: {}".format(response_json_string))

            s.current_turn_generator = s.take_turn(player_id, dice1, dice2)
            try:
                msg = s.current_turn_generator.send(None)
                if msg.startswith("action_square") or msg.startswith("paid_rent"):
                    what_happened = msg.split("|")[1]
                    response_json = {
                        "type": "textual_update",
                        "text": what_happened,
                    }

                    response_json_string = json.dumps(response_json)
                    server.send_message_to_all(response_json_string.encode("utf-8"))
                    print("Sending: {}".format(response_json_string))

            except PlayerLostError:
                response_json = {
                    "type": "player_lose",
                    "player": s.current_player(),
                }
                response_json_string = json.dumps(response_json)
                server.send_message_to_all(response_json_string.encode("utf-8"))
                print("Sending: {}".format(response_json_string))

                board_sync_json = s.game_state()
                board_sync_string = json.dumps(board_sync_json)
                server.send_message_to_all(board_sync_string.encode("utf-8"))
                print("Sending: {}".format(board_sync_string))
                            
                s.next_player()
                new_current_player_id = s.current_player()
                response_json = {
                    "type": "your_turn",
                    "source": new_current_player_id,
                }
                response_json_string = json.dumps(response_json)
                server.send_message_to_all(response_json_string.encode("utf-8"))
                print("Sending: {}".format(response_json_string))


            
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
                server.send_message_to_all(response_json_string.encode("utf-8"))
                print("Sending: {}".format(response_json_string))

        elif json_string["type"] == "auction":
            response_json = {
                "type" : "auction_start",
                "competitor": s.get_all_players(),
                "source": json_string["source"],
                "property": json_string["property"],
                "base_price": 10,
            }
            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"))
            print("Sending: {}".format(response_json_string))
            s.current_bidders = s.get_all_players()
            s.bids = {}
            s.auction_property = json_string["property"]
            s.current_turn_generator.send("auction")

        elif json_string["type"] == "auction_bid":
            player_id = json_string["source"]
            bid_amount = json_string["price"]
            if bid_amount != 0:
                s.bids[player_id] = bid_amount
            else:
                s.current_bidders.remove(player_id)

            response_json = {
                "type": "auction_bid_ack",
                "source": json_string["source"],
            }
            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"))
            print("Sending: {}".format(response_json_string))
            
            if len(s.current_bidders) == 0:
                response_json = {
                    "type": "auction_finished",
                    "property": s.auction_property,
                    "price": 0,
                    "winner": -1,
                }
                response_json_string = json.dumps(response_json)
                server.send_message_to_all(response_json_string.encode("utf-8"))
                print("Sending: {}".format(response_json_string))
            
                s.current_turn_generator.send((None, 0))

            elif len(s.bids) == len(s.current_bidders):
                max_bid_players, max_bid = s.get_auction_result()
                if len(max_bid_players) == 1:
                    response_json = {
                        "type": "auction_finished",
                        "property": s.auction_property,
                        "price": max_bid,
                        "winner": max_bid_players[0],
                    }
                    response_json_string = json.dumps(response_json)
                    server.send_message_to_all(response_json_string.encode("utf-8"))
                    print("Sending: {}".format(response_json_string))
                
                    s.current_turn_generator.send((max_bid_players[0], max_bid))

                else:
                    response_json = {
                        "type" : "auction_start",
                        "competitor": max_bid_players,
                        "source": -1,
                        "property": s.auction_property,
                        "base_price": max_bid,
                    }
                    response_json_string = json.dumps(response_json)
                    server.send_message_to_all(response_json_string.encode("utf-8"))
                    print("Sending: {}".format(response_json_string))
                    s.current_bidders = max_bid_players
                    s.bids = {}

        elif json_string["type"] == "end_turn":
            if s.is_valid_player(json_string["source"]):
                board_sync_json = s.game_state()
                board_sync_string = json.dumps(board_sync_json)
                server.send_message_to_all(board_sync_string.encode("utf-8"))
                print("Sending: {}".format(board_sync_string))
                
                re_check_location, new_roll = s.current_turn_generator.send(None)
                if not re_check_location:
                    s.next_player()
                    s.new_roll = True 
                else:
                    s.new_roll = new_roll

                new_current_player_id = s.current_player()
                response_json = {
                    "type": "your_turn",
                    "source": new_current_player_id,
                }
                response_json_string = json.dumps(response_json)
                server.send_message_to_all(response_json_string.encode("utf-8"))
                print("Sending: {}".format(response_json_string))

        elif json_string["type"] == "chat":
            response_json = json_string
            response_json["type"] = "chat_sync"
            response_json_string = json.dumps(response_json)
            server.send_message_to_all(response_json_string.encode("utf-8"))
            print("Sending: {}".format(response_json_string))

        elif json_string["type"] == "build_house":
            player_id = json_string["source"]
            property_id = json_string["property"]
            try:
                if json_string["sell"]:
                    s.sell_house(player_id, property_id)
                    current_rent = s.get_current_rent(property_id)
                    num_houses = s.get_num_houses(property_id)
                    gained_money = s.get_sell_value(property_id)

                    response_json = {
                        "type" : "build_ack",
                        "property": json_string["property"],
                        "source": json_string["source"],
                        "current_rent": current_rent,
                        "sell": True,
                        "num_houses": num_houses,
                        "gained_money": gained_money,
                    }
                    response_json_string = json.dumps(response_json)
                    server.send_message_to_all(response_json_string.encode("utf-8"))
                    print("Sending: {}".format(response_json_string))
                    
                else:
                    s.build_house(player_id, property_id)
                    current_rent = s.get_current_rent(property_id)
                    num_houses = s.get_num_houses(property_id)
                    response_json = {
                        "type" : "build_ack",
                        "property": json_string["property"],
                        "source": json_string["source"],
                        "current_rent": current_rent,
                        "sell": False,
                        "num_houses": num_houses,
                    }
                    response_json_string = json.dumps(response_json)
                    server.send_message_to_all(response_json_string.encode("utf-8"))
                    print("Sending: {}".format(response_json_string))
            except BuildException:
                        pass

        elif json_string["type"] == "pay_bail":
            player_id = json_string["source"]
            if json_string["get_out_of_jail_free"]:
                s.leave_jail(player_id, free_card = True)
            else:
                s.leave_jail(player_id, free_card = False) 

            board_sync_json = s.game_state()
            board_sync_string = json.dumps(board_sync_json)
            server.send_message_to_all(board_sync_string.encode("utf-8"))
            print("Sending: {}".format(board_sync_string))

        elif json_string["type"] == "mortgage_property":
            player_id = json_string["player"]
            property_id = json_string["property"]
            try:
                if json_string["unmortgage"]:
                    s.unmortgage_property(player_id, property_id)
                else:
                    s.mortgage_property(player_id, property_id)

                response_json = {
                    "type": "mortgage_property_ack",
                    "property": property_id, 
                    "player": player_id, 
                    "unmortgage": json_string["unmortgage"],
                }
                response_json_string = json.dumps(response_json)
                server.send_message_to_all(response_json_string.encode("utf-8"))
                print("Sending: {}".format(response_json_string))

                board_sync_json = s.game_state()
                board_sync_string = json.dumps(board_sync_json)
                server.send_message_to_all(board_sync_string.encode("utf-8"))
                print("Sending: {}".format(board_sync_string))
        
            except MortgageException:
                pass

    ws.set_fn_new_client(new_client)
    ws.set_fn_message_received(recv_message)
    ws.set_fn_client_left(client_leave)
    ws.run_forever()


if __name__ == "__main__":
    try:
        hostname, portnumber = sys.argv[1:]
        portnumber = int(portnumber)
    except ValueError:
        hostname = "localhost"
        portnumber = 4444

    print("Hostname:", hostname)
    current_game_port_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'Client', "current_game_port"))

    ps = {}
    comms_queue = SimpleQueue()
    game_id = 0
    new_game = True
    while True:
        if new_game:
            with open(current_game_port_path, "w") as f:
                f.write(str(portnumber))

            p = Process(target=new_game_board, args = (
                hostname, portnumber, comms_queue, game_id))
            p.start()
            ps[game_id] = p 
            new_game = False
            portnumber += 1
            game_id += 1


        result, from_game_id = comms_queue.get()
        if result == "exit":
            ps[from_game_id].terminate()

        elif result == "new_board":
            new_game = True