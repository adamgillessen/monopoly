"""
This controls the Squares and Players and manages the whole game. 
"""

from Squares import * 
from Player import * 
from Cards import * 
import random
import itertools 

class Board:
    """
    This class represents the board state and provides functions to change the
    board state. 
    """
    NUM_SQUARES = 40
    CHEST_POS = [2, 17, 33]
    CHANCE_POS = [7, 22, 36]
    CORNER_POS = [0, 10, 20, 30]
    TAX_POS = [4, 38]
    # UTIL_POS_INFO[position] = price, property_id
    UTIL_POS_INFO = {
        12 : [200, 7],
        28 : [200, 20],
    }
    # TRANS_POS_INFO[position] = price, property_id
    TRANS_POS_INFO = {
        5 : [150, 2],
        15 : [150, 10],
        25 : [150, 17],
        35 : [150, 25],
    }
    # PROPERTY_POS_INFO[position] = [price, rent, estate, id]
    PROPERTY_POS_INFO = {
        1 : [60, 10, 0, 0],
        3 : [60, 20, 0, 1],
        6 : [100, 30, 1, 3],
        8 : [100, 30, 1, 4],
        9 : [120, 40, 1, 5],
        11 : [140, 50, 2, 6],
        13 : [140, 50, 2, 8],
        14 : [160, 60, 2, 9],
        16 : [180, 70, 3, 11],
        18 : [180, 70, 3, 12],
        19 : [200, 80, 3, 13],
        21 : [220, 90, 4, 14],
        23 : [220, 90, 4, 15],
        24 : [240, 100, 4, 16],
        26 : [260, 110, 5, 18],
        27 : [260, 110, 5, 19],
        29 : [280, 120, 5, 21],
        31 : [300, 130, 6, 22],
        32 : [300, 130, 6, 23],
        34 : [320, 150, 6, 24],
        37 : [350, 175, 7, 26],
        39 : [400, 200, 7, 27],
    }
    JAIL_POS = 10
    GO_AMOUNT = 200
    GO_POS = 0
    def __init__(self, num_players):
        """
        Initialises the board with the relevant squares in the correct place
        :param num_players - the number of players going to play the game
        """

        # Initialise Squares
        self._board = [None for _ in range(Board.NUM_SQUARES)]

        for pos in Board.CHEST_POS:
            self._board[pos] = ActionSquare(pos, action=ActionSquare.CHEST)

        for pos in Board.CHANCE_POS:
            self._board[pos] = ActionSquare(pos, action=ActionSquare.CHANCE)

        for pos in Board.TAX_POS:
            self._board[pos] = ActionSquare(pos, action=ActionSquare.TAX)

        for pos in Board.CORNER_POS:
            if pos in Board.CORNER_POS[:3]:
                self._board[pos] = ActionSquare(pos, action=ActionSquare.STAY)
            elif pos == Board.CORNER_POS[3]:
                self._board[pos] = ActionSquare(pos, action=ActionSquare.JAIL)

        for pos, info in Board.UTIL_POS_INFO.items():
            price, _ = info 
            self._board[pos] = UtilitySquare(pos, price)

        for pos, info in Board.TRANS_POS_INFO.items():
            price, _ = info 
            self._board[pos] = TransportSquare(pos, price)

        for pos, info in Board.PROPERTY_POS_INFO.items():
            price, rent, estate, prop_id = info 
            self._board[pos] = PropertySquare(pos, price, rent, estate, prop_id)

        # create players
        self._players = {i:Player(i) for i in range(1, num_players + 1)}

        # Initialise players at position 0 (Go)
        self._player_positions = {}
        for p in self._players.values():
            self._player_positions[p] = 0 
            self._board[0].add_player(p)

        # initialise
        self._action_cards = {
            MoveCard(Board.GO_POS, "Advance to GO"),
            GainMoneyCard(200, "Bank error in your favour; collect 200"),
            LoseMoneyCard(50, "Doctor's fee; pay 50"),
            GainMoneyCard(50, "From sale of stock, you get 50"),
            GetOutOfJailFreeCard(),
            MoveCard(Board.JAIL_POS, "Go to Jail"),
            GainMoneyCard(50, "Grand Opera opening night; collect 50"),
            GainMoneyCard(100, "Holiday Fund matures; collect 100"),
            GainMoneyCard(20, "Income Tax Refund; collect 20"),
            GainMoneyCard(10, "It's your birthday; collect 10"),
            GainMoneyCard(100, "Life Insurance matures; collect 100"),
            LoseMoneyCard(100, "Pay hospital fee; play 100"),
            LoseMoneyCard(150, "Pay school fees; lose 150"),
            GainMoneyCard(25, "Receive 25 in consultancy fees"),
            GainMoneyCard(10, "You have won second place in a beauty contest; collect 10"),
            GainMoneyCard(100, "You receive inheritance; collect 100"),
            MoveCard(Board.GO_POS, "Advance to GO"),
            GainMoneyCard(50, "Bank pays you a dividened; collect 50"),
            GetOutOfJailFreeCard(),
            GetOutOfJailFreeCard(),
            MoveCard(Board.JAIL_POS, "Go to Jail"),
            GainMoneyCard(15, "Pay 15 in poor tax"),
            GainMoneyCard(150, "Your building and loan matures; collect 150"),
            GainMoneyCard(100, "You have won 100 in a crossword competition"),
            MoveCard(random.choice(list(Board.UTIL_POS_INFO)), "Move to a utility"),
        } | {
            MoveCard(i, "Move to property {}".format(i)) for i in (random.choice(list(Board.PROPERTY_POS_INFO)) for _ in range(3))
        }

        self._current_player = None           

    def __str__(self):
        """
        Board String method.
        :return a string representation of the baord
        """
        s = ""
        for i, square in enumerate(self._board):
            if i > 0 and not i%5:
                s += "\n"
            s += str(square) + " "
        return s 

    def game_state(self):
        """
        Returns a dictionary of a the game state in the "baord_sync" format.
        """
        msg = {
            "type":"board_sync",
            "cells": {},
            "players": {},
        }
        for pos, info in Board.PROPERTY_POS_INFO.items():
            price, rent, estate, property_id = info 
            property_square = self.get_square(pos)
            msg["cells"][str(pos)] = {}
            msg["cells"][str(pos)]["type"] = "property"
            msg["cells"][str(pos)]["id"] = pos  
            msg["cells"][str(pos)]["owner"] = property_square.owner 
            msg["cells"][str(pos)]["price"] =  price 
            msg["cells"][str(pos)]["property_id"] = property_id

        for pos, info in Board.TRANS_POS_INFO.items():
            price, property_id = info 
            transport_square = self.get_square(pos)
            msg["cells"][str(pos)] = {}
            transport_id = transport_square.square_id 
            msg["cells"][str(pos)]["type"] = "property"
            msg["cells"][str(pos)]["id"] = pos  
            msg["cells"][str(pos)]["owner"] = transport_square.owner 
            msg["cells"][str(pos)]["price"] = price 
            msg["cells"][str(pos)]["property_id"] = property_id

        for pos, info in Board.UTIL_POS_INFO.items():
            price, property_id = info 
            transport_square = self.get_square(pos)
            msg["cells"][str(pos)] = {}
            transport_id = transport_square.square_id 
            msg["cells"][str(pos)]["type"] = "property"
            msg["cells"][str(pos)]["id"] = pos  
            msg["cells"][str(pos)]["owner"] = transport_square.owner 
            msg["cells"][str(pos)]["price"] = price 
            msg["cells"][str(pos)]["property_id"] = property_id

        """
        all_actions = sorted(itertools.chain(
            Board.CHEST_POS, 
            Board.CHANCE_POS, 
            Board.CORNER_POS, 
            Board.TAX_POS))
        
        for action_id, pos in enumerate(all_actions):
            msg["cells"][str(action_id)] = {}
            msg["cells"][str(action_id)]["type"] = "action"
            msg["cells"][str(action_id)]["id"] = pos  
            msg["cells"][str(action_id)]["action_id"] = action_id"""

        for player_id, player in self._players.items():
            pos = self._player_positions[player]
            msg["players"][str(player_id)] = {}
            msg["players"][str(player_id)]["id"] = player_id
            msg["players"][str(player_id)]["is_in_jail"] = player.jail 
            msg["players"][str(player_id)]["money"] = player.money 
            msg["players"][str(player_id)]["position"] = pos 

        return msg 


    def roll_dice(self):
        """
        Simulates a dice roll. Returns a pair of integers representing the value
        on each dice. 
        :return a tuple of ints of length 2
        """
        while True:
            d1, d2 = (random.randint(1, 6) for _ in range(2))
            if d1 != d2:
                break
        return d1, d2 

    def move_player(self, player_id, new_pos):
        """
        Moves Player with id "player_id" from old position to "new_pos". 
        :param player_id - the ID of the player being moved
        :param new_pos - the (zero indexed) position on the board the player is moving too
        """
        player = self._players[player_id]
        # remove from old square
        self._board[self._player_positions[player]].remove_player(player)

        # add to new square
        self._player_positions[player] = new_pos
        self._board[new_pos].add_player(player)

    def get_players(self, pos):
        """
        Gets all the players in the game at a location.
        :param pos - the location of the square ebing queried
        :return a list of all players at position pos. 
        """
        return list(self._board[pos])

    def get_pos(self, player_id):
        """
        Get the position of the square a player is on. 
        :param player_id - the id of the player being looked for
        :return the position of the square which the player is on 
        """
        return self._player_positions[self._players[player_id]]

    def get_square(self, pos):
        """
        Get a Square Object
        :param pos - the position of the Square you are looking for
        :return The square object at position pos
        """
        if pos >= Board.NUM_SQUARES:
            raise IndexError(
                "Board.get_square({}): Index {} not in Board of size {}".format(
                    pos, pos, Board.NUM_SQUARES)) 
        return self._board[pos]

    def take_money(self, player_id, amount):
        """
        Takes "amount" amount of money from Player with id "player_id"
        :param player_id the id of the player in question
        :param amount the amount of money to be taken from this player
        """
        player = self._players[player_id]
        player.money -= amount

    def give_money(self, player_id, amount):
        """
        Gives "amount" amount of money to Player with id "player_id"
        :param player_id the id of the player in question
        :param amount the amount of money to be given to this player
        """
        player = self._players[player_id]
        player.money += amount

    def obtain_get_out_jail_free(self, player_id):
        """
        Gives the Player with id "player_id" a get out of jail free card. 
        :param player_id - the id of the player being given the card
        """
        player = self._players[player_id]
        player.free = True 

    def go_to_jail(self, player_id):
        """
        Moves player with id "player_id" to jail"
        :param player_id - the id of the player going to jail
        """
        self.move_player(player_id, Board.JAIL_POS)
        player = self._players[player_id]
        player.jail = True 

    def leave_jail(self, player_id):
        """
        Moves the player wit id "player_id" out of jail
        :param player_if the id of the player being moved out of jail
        """
        player = self._players[player_id]
        player.jail = False 

    def use_get_out_jail_free(self, player_id):
        """
        Player with id "player_id" uses their get out of jail free card. 
        :param player_id the id of the player using their card
        """
        player = self._players[player_id]
        if not player.free:
            raise ValueError(
                "Board.use_get_out_jail_free({}): Player with id {} has no get out of jail free card".format(
                    player_id, player_id))
        player.free = False 
        player.jail = False 

    def add_house(self, pos):
        """
        Adds a house to the Square at position pos. 
        :param pos - the position of the square the house is being added to
        """
        square = self.get_square(pos)
        square.num_houses += 1 

    def take_turn(self, player_id, dice1, dice2):
        """
        Runs the specified player's turn based on their dice roll result.

        :param player_id - The id of the player whose turn it is
        :param dice1 - the result of dice 1
        :param dice2 - the result of dice 2

        This is a generator which will yield the actions a user must address. 
        The final value of the generator will be a human-readable string which
        explains what happened in this turn. This return will also raise a 
        StopIteration exception. 
        """
        if not self._current_player:
            self._current_player = player_id
            self._human_string = []
        
        self._human_string.append("Player {}'s turn.".format(player_id))
        player = self._players[player_id]

        if dice1 == dice2:
            self._human_string.append("Player {} rolled a double.".format(player_id))
            player.double_roll = True 
            re_check_location = True
        else:
            re_check_location = False

        new_pos = self.get_pos(player_id) + dice1 + dice2
        if new_pos > 39:
            self.give_money(player_id, Board.GO_AMOUNT)
            new_pos %= 40
            self._human_string.append("Player {} passed go and got $200.".format(player_id))
        self._human_string.append("Player {} landed on position {}.".format(player_id, new_pos))
        self.move_player(player_id, new_pos)

        square = self.get_square(new_pos)

        if square.square_type in (Square.PROPERTY, Square.UTILITY, Square.TRANSPORT):
            print(">>Square is ownable square")
            # can be bought or may be bought already
            if square.is_owned:
                print(">>Square is owned")
                if square.square_type == Square.PROPERTY:
                    print(">>Square is a property square")
                    rent = square.base_rent * (2**square.num_houses)
                elif square.square_type == Square.UTILITY:
                    print(">>Square is a utility square")
                    dice_roll_sum = sum(self.roll_dice())
                    owner = self._players[square.owner]
                    if owner.num_utils() == 1:
                        rent = dice_roll_sum * square.one_owned
                    else:
                        rent = dice_roll_sum * square.two_owned
                elif square.square_type == Square.TRANSPORT:
                    print(">>Square is a transport square")
                    owner = self._players[square.owner]
                    rent = square.base_rent * (2**owner.num_transports())

                self._human_string.append("Player {} paid ${} to {} in rent.".format(
                    player_id, rent, square.owner))

                self.give_money(square.owner, rent)
                self.take_money(player_id, rent)
                yield None
            else:
                print(">>Square is not owned")
                buy_auction = yield "buy_auction"
                if buy_auction == "buy":
                    selling_square = True
                    print(">>User will buy")
                    cost = square.price
                    square.owner = player_id
                    self.take_money(player_id, cost)
                    new_owner = self._players[player_id]
                    self._human_string.append("Player {} bought square {}.".format(
                        player_id, new_pos))
                    square.is_owned = True

                    if square.square_type == Square.PROPERTY:
                        new_owner.add_property(square)
                    elif square.square_type == Square.UTILITY:
                        new_owner.add_utility(square)
                    elif square.square_type == Square.TRANSPORT:
                        new_owner.add_transport(Square)
                    yield new_pos
                
                elif buy_auction == "auction":
                    """
                    selling_square = True
                    print(">>User will auction")
                    highest_bidder = yield None 
                    bid = yield None
                    square.owner = highest_bidder
                    self.take_money(highest_bidder, bid)
                    new_owner = self._players[highest_bidder]"""

                elif buy_auction == "no_buy":
                    print(">>User will not buy")
                    selling_square = False
                    self._human_string.append("Player {} didn't buy square {}.".format(
                        player_id, new_pos))
                    yield None

                else:
                    print(">>Expecting buy, auction or no_buy but got '%s'"%(str(buy_auction)))
                    raise Exception("Out of turn message")
                    
        elif square.square_type == Square.ACTION:
            # could be [chest|chance|jail|stay|tax]
            print(">>Square is action square")
            if square.action in (ActionSquare.CHEST, ActionSquare.CHANCE):
                print(">>Square is chest | chance")
                if square.action == ActionSquare.CHEST:
                    self._human_string.append("Player {} drew a Chest card".format(
                        player_id))
                elif square.action == ActionSquare.CHANCE:
                    self._human_string.append("Player {} drew a Chance card".format(
                        player_id))

                card = random.choice(list(self._action_cards))
                if card.card_type == Card.MOVE:
                    new_pos = card.move_to_pos
                    self.move_player(player_id, new_pos)
                    re_check_location = True
                elif card.card_type == Card.GAIN_MONEY:
                    amount = card.gain_amount
                    self.give_money(player_id, amount)
                elif card.card_type == Card.LOSE_MONEY:
                    amount = card.lose_amount
                    self.take_money(player_id, amount)
                elif card.card_type == Card.GET_OUT_OF_JAIL:
                    player.free = True

                self._human_string.append(card.text)

            elif square.action == ActionSquare.JAIL:
                print(">>Sqaure is Go to Jail square")
                self.move_player(player_id, Board.JAIL_POS)
                self._human_string.append("Player {} went to jail".format(
                        player_id))
            elif square.action == ActionSquare.STAY:
                print(">>Sqaure is free parking")
                self._human_string.append("Player {} got free parking".format(
                        player_id))
            elif square.action == ActionSquare.TAX:
                print(">>Sqaure is get taxed square")
                tax = 100 * (2**Board.TAX_POS.index(new_pos))
                self.take_money(player_id, tax)
                self._human_string.append("Player {} paid {} in tax".format(
                        player_id, tax))
            yield "action_square" # pauses generator to be in sync with server

        re_check_location = False # TODO double roll mechanism
        if re_check_location:
            if player.double_roll:
                player.double_roll = False
                dice1, dice2 = self.roll_dice()
                self._human_string.append("Player {} rolled again and got {} and {}".format(
                    player_id, dice1, dice2))
                re_check_turn = self.take_turn(player_id, dice1, dice2)
            else:
                re_check_turn = self.take_turn(player_id, 0, 0)
            yield from re_check_turn
        self._human_string = ["--TURN REPORT--"] + self._human_string + ["--END TURN REPORT--"]
        self._current_player = None
        yield "\n".join(self._human_string)


if __name__ == "__main__":
    b = Board(4)
    b.take_turn(1, 1, 2).send(None)