"""
This controls the Squares and Players and manages the whole game.
"""

from Squares import *
from Player import *
from Cards import *
import random

class Board:
    """
    This class represents the board state and provides functions to change the
    board state.
    """
    _NUM_SQUARES = 40
    _CHEST_POS = [2, 17, 33]
    _CHANCE_POS = [7, 22, 36]
    _CORNER_POS = [0, 10, 20, 30]
    _TAX_POS = [4, 38]
    # _UTIL_POS_INFO[position] = price
    _UTIL_POS_INFO = {
        12 : 200,
        28 : 200,
    }
    # _TRANS_POS_INFO[position] = price
    _TRANS_POS_INFO = {
        5 : 150,
        15 : 150,
        25 : 150,
        35 : 150,
    }
    # _PROPERTY_POS_INFO[position] = [price, rent, estate]
    _PROPERTY_POS_INFO = {
        1 : [60, 10, 0],
        3 : [60, 20, 0],
        6 : [100, 30, 1],
        8 : [100, 30, 1],
        9 : [120, 40, 1],
        11 : [140, 50, 2],
        13 : [140, 50, 2],
        14 : [160, 60, 2],
        16 : [180, 70, 3],
        18 : [180, 70, 3],
        19 : [200, 80, 3],
        21 : [220, 90, 4],
        23 : [220, 90, 4],
        24 : [240, 100, 4],
        26 : [260, 110, 5],
        27 : [260, 110, 5],
        29 : [280, 120, 5],
        31 : [300, 130, 6],
        32 : [300, 130, 6],
        34 : [320, 150, 6],
        37 : [350, 175, 7],
        39 : [400, 200, 7],
    }
    _JAIL_POS = 10
    _GO_AMOUNT = 200
    _GO_POS = 0
    _BAIL_COST = 50
    def __init__(self, num_players):
        """
        Initialises the board with the relevant squares in the correct place.

        :param num_players: the number of players going to play the game
        """

        # Initialise Squares
        self._board = [None for _ in range(Board._NUM_SQUARES)]

        for pos in Board._CHEST_POS:
            self._board[pos] = ActionSquare(pos, action=ActionSquare.CHEST)

        for pos in Board._CHANCE_POS:
            self._board[pos] = ActionSquare(pos, action=ActionSquare.CHANCE)

        for pos in Board._TAX_POS:
            self._board[pos] = ActionSquare(pos, action=ActionSquare.TAX)

        for pos in Board._CORNER_POS:
            if pos in Board._CORNER_POS[:3]:
                self._board[pos] = ActionSquare(pos, action=ActionSquare.STAY)
            elif pos == Board._CORNER_POS[3]:
                self._board[pos] = ActionSquare(pos, action=ActionSquare.JAIL)

        for pos, price in Board._UTIL_POS_INFO.items():
            self._board[pos] = UtilitySquare(pos, price)

        for pos, price in Board._TRANS_POS_INFO.items():
            self._board[pos] = TransportSquare(pos, price)

        for pos, info in Board._PROPERTY_POS_INFO.items():
            price, rent, estate = info
            self._board[pos] = PropertySquare(pos, price, rent, estate)

        # create players
        self._players = {i:Player(i) for i in range(1, num_players + 1)}
        self._current_turn = 1

        # Initialise players at position 0 (Go)
        self._player_positions = {}
        for p in self._players.values():
            self._player_positions[p] = 0
            self._board[0].add_player(p)

        self._is_in_game = {}
        for player_id in self._players:
            self._is_in_game[player_id] = True

        # initialise
        self._action_cards = {
            MoveCard(Board._GO_POS, "Advance to GO"),
            GainMoneyCard(200, "Bank error in your favour; collect 200"),
            LoseMoneyCard(50, "Doctor's fee; pay 50"),
            GainMoneyCard(50, "From sale of stock, you get 50"),
            GetOutOfJailFreeCard(),
            MoveCard(Board._JAIL_POS, "Go to Jail"),
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
            MoveCard(Board._GO_POS, "Advance to GO"),
            GainMoneyCard(50, "Bank pays you a dividened; collect 50"),
            GetOutOfJailFreeCard(),
            GetOutOfJailFreeCard(),
            MoveCard(Board._JAIL_POS, "Go to Jail"),
            LoseMoneyCard(15, "Pay 15 in poor tax"),
            GainMoneyCard(150, "Your building and loan matures; collect 150"),
            GainMoneyCard(100, "You have won 100 in a crossword competition"),
            MoveCard(random.choice(list(Board._UTIL_POS_INFO)), "Move to a utility"),
        } | {
            MoveCard(i, "Move to property {}".format(i)) for i in (random.choice(list(Board._PROPERTY_POS_INFO)) for _ in range(3))
        }

    def __str__(self):
        """
        Board String method.

        :returns: a string representation of the baord
        """
        s = ""
        for i, square in enumerate(self._board):
            if i > 0 and not i%5:
                s += "\n"
            s += str(square) + " "
        return s

    def next_player(self):
        """
        Increments and returns the next player whose turn it is.

        :returns: the player_id of the next player
        """
        while True:
            self._current_turn += 1
            if self._current_turn == len(self._players) + 1:
                self._current_turn = 1

            if self._is_in_game[self._current_turn]:
                break
        return self._current_turn


    def all_players(self):
        """
        A list of player ids in the game.

        :returns: a list of all player ids
        """
        return [player_id for player_id in self._players.keys() if self._is_in_game[player_id]]

    def game_state(self):
        """
        Builds up a dictionary of the current game state in the format of the
        board_sync JSON message format.

        :returns: the json dictionary
        """
        msg = {
            "type":"board_sync",
            "cells": {},
            "players": {},
        }
        for pos, info in Board._PROPERTY_POS_INFO.items():
            price, rent, estate = info
            property_square = self.get_square(pos)
            msg["cells"][str(pos)] = {}
            msg["cells"][str(pos)]["id"] = pos
            msg["cells"][str(pos)]["owner"] = property_square.owner

        for pos, price in Board._TRANS_POS_INFO.items():
            transport_square = self.get_square(pos)
            msg["cells"][str(pos)] = {}
            transport_id = transport_square.square_id
            msg["cells"][str(pos)]["id"] = pos
            msg["cells"][str(pos)]["owner"] = transport_square.owner

        for pos, price in Board._UTIL_POS_INFO.items():
            utility_square = self.get_square(pos)
            msg["cells"][str(pos)] = {}
            transport_id = utility_square.square_id
            msg["cells"][str(pos)]["id"] = pos
            msg["cells"][str(pos)]["owner"] = utility_square.owner

        for player_id, player in self._players.items():
            if self._is_in_game[player_id]:
                pos = self._player_positions[player]
                msg["players"][str(player_id)] = {}
                msg["players"][str(player_id)]["id"] = player_id
                msg["players"][str(player_id)]["is_in_jail"] = player.jail
                msg["players"][str(player_id)]["money"] = player.money
                msg["players"][str(player_id)]["position"] = pos
                msg["players"][str(player_id)]["has_card"] = player.free 

        return msg


    def roll_dice(self):
        """
        Simulates a dice roll. Returns a pair of integers representing the value
        on each dice.

        :returns: a tuple of ints of length 2
        """
        d1, d2 = (random.choice(range(1, 7)) for _ in range(2))
        return d1, d2

    def move_player(self, player_id, new_pos):
        """
        Moves Player with id "player_id" from old position to "new_pos".

        :param player_id: the ID of the player being moved
        :param new_pos: the (zero indexed) position on the board the player is moving too
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

        :param pos: the location of the square ebing queried
        :returns: a list of all players at position pos.
        """
        return list(self._board[pos])

    def get_pos(self, player_id):
        """
        Get the position of the square a player is on.

        :param player_id: the id of the player being looked for
        :returns: the position of the square which the player is on
        """
        return self._player_positions[self._players[player_id]]

    def get_square(self, pos):
        """
        Get a Square Object.

        :param pos: the position of the Square you are looking for
        :returns: The square object at position pos
        """
        if pos >= Board._NUM_SQUARES:
            raise IndexError(
                "Board.get_square({}): Index {} not in Board of size {}".format(
                    pos, pos, Board._NUM_SQUARES))
        return self._board[pos]

    def take_money(self, player_id, amount):
        """
        Takes "amount" amount of money from Player with id "player_id".

        :param player_id: the id of the player in question
        :param amount: the amount of money to be taken from this player
        """
        player = self._players[player_id]
        player.money -= amount

    def give_money(self, player_id, amount):
        """
        Gives "amount" amount of money to Player with id "player_id".

        :param player_id: the id of the player in question
        :param amount: the amount of money to be given to this player
        """
        player = self._players[player_id]
        player.money += amount

    def obtain_get_out_jail_free(self, player_id):
        """
        Gives the Player with id "player_id" a get out of jail free card.

        :param player_id: the id of the player being given the card
        """
        player = self._players[player_id]
        player.free = True

    def go_to_jail(self, player_id):
        """
        Moves player with id "player_id" to jail".

        :param player_id: the id of the player going to jail
        """
        self.move_player(player_id, Board._JAIL_POS)
        player = self._players[player_id]
        player.jail = True

    def leave_jail(self, player_id, free_card = False):
        """
        Player with id "player_id" uses their get out of jail free card.

        :param player_id: the id of the player using their card
        :param free_card: True if using a get out of jail free card to leave jail
        """
        player = self._players[player_id]
        player.jail = False
        if free_card:
            player.free = False
        self.take_money(player_id, Board._BAIL_COST)
        
    def remove_player(self, player_id):
        """
        Gracefully removes a plyer from the game.

        :param player_id: the id of the player being removed
        """
        player = self._players[player_id]
        for asset in player.get_assets():
            asset.owner = -1
            asset.is_owned = False
        self._is_in_game[player_id] = False

        current_square = self.get_square(self.get_pos(player_id))
        current_square.remove_player(player)

    def is_valid_player(self, player_id):
        """
        Checks of the player_id is a valid one.

        :param player_id: the id of the player being queried
        :returns: True of the player is valid, False otherwise
        """
        return player_id in self._is_in_game.keys() and self._is_in_game[player_id]

    def build_house(self, player_id, property_id):
        """
        Builds a house on the property whose id is property_id, owned by player_id

        :param player_id: the id of the player who owns the square
        :param property_d: the id of the property which the house is being built on
        """
        player = self._players[player_id]
        property_square = self.get_square(property_id)
        if property_square.is_owned and property_square.owner == player_id:
            # hinges on the fact the estate ids 0 and 7 only have two properties
            # estate ids in between all have 3 properties in them
            _, _, estate_id = Board._PROPERTY_POS_INFO[property_id]
            estate_prop_count = 0
            for owned_property in player.properties:
                if owned_property.estate == estate_id:
                    estate_prop_count += 1 

            if (estate_id in (0, 7) and estate_prop_count == 2)\
                or (estate_id in range(2, 7) and estate_prop_count == 3):
                if property_square.num_houses < 5:
                    property_square.num_houses += 1
                    self.take_money(player_id, property_square.house_cost) 
                    return 
        raise BuildException

    def sell_house(self, player_id, property_id):
        """
        Sells the house on a property and returns half of the cost of
        buying it to the user. 

        :param player_id: the id of the player who owns the square
        :param property_d: the id of the property which the house is being built on
        """
        player = self._players[player_id]
        property_square = self.get_square(property_id)
        if property_square.is_owned and property_square.owner == player_id:
            # hinges on the fact the estate ids 0 and 7 only have two properties
            # estate ids in between all have 3 properties in them
            _, _, estate_id = Board._PROPERTY_POS_INFO[property_id]
            estate_prop_count = 0
            for owned_property in player.properties:
                if owned_property.estate == estate_id:
                    estate_prop_count += 1 

            if (estate_id in (0, 7) and estate_prop_count == 2)\
                or (estate_id in range(2, 7) and estate_prop_count == 3):
                if property_square.num_houses > 0:
                    property_square.num_houses -= 1
                    self.give_money(player_id, property_square.house_cost // 2) 
                    return 
        raise BuildException

    def get_house_cost(self, property_id):
        """
        Returns the cost to build a new house for a property.

        :param property_id: the id of the property which is being queried
        :returns: the cost to build a house on that property
        """
        property_square = self.get_square(property_id)
        return property_square.base_rent 

    def get_num_houses(self, property_id):
        """
        Returns the number of houses on a property

        :param property_id: the id of the property being queried
        """
        return self.get_square(property_id).num_houses

    def get_current_rent(self, property_id):
        """
        Returns the current rent for landing on a property

        :param property_id: the id of the property which is being queried
        :returns: the current rent which a user will pay for landing on that swaure
        """
        property_square = self.get_square(property_id)
        current_rent = property_square.base_rent * (2 ** property_square.num_houses)
        return current_rent

    def mortgage_property(self, player_id, property_id):
        """
        Mortgages a property so that the player gets the mortgage value of the
        property. The player then collects no rent until they buy back the
        property for the mortgage value +10%.

        :param player_id: the id of the player who owns the property
        :param property_id: the id of the property which is being mortgaged
        :raises: a MortgageException if the player cannot perform the action
        """
        property_square = self.get_square(property_id)
        if property_square.owner == player_id and not property_square.is_mortgaged:
            property_square.is_mortgaged = True
            self.give_money(player_id, property_square.mortgage_value)
        else:
            raise MortgageException

    def unmortgage_property(self, player_id, property_id):
        """
        Buys a property back from the bank. Costs a player the mortgage
        value + 10%.

        :param player_id: the id of the player who owns the property
        :param property_d: the id of the property which is mortgaged
        :raises: a MortgageException if the player cannot perform the action
        """
        property_square = self.get_square(property_id)
        player = self._players[player_id]
        cost = int(property_square.mortgage_value * 1.1)
        if property_square.owner == player_id and property_square.is_mortgaged \
            and player.money > cost:

            property_square.is_mortgaged = False
            self.take_money(player_id, cost)
        else:
            raise MortgageException

    def get_sell_value(self, property_id):
        """
        Gets the money which you would get from selling
        a house on property property_id.

        :returns: the selling value of a house 
        """
        return self.get_house_cost(property_id) // 2 



    def take_turn(self, player_id, dice1, dice2):
        """
        Runs the specified player's turn based on their dice roll result.

        :param player_id: The id of the player whose turn it is
        :param dice1: the result of dice 1
        :param dice2: the result of dice 2
        """
        player = self._players[player_id]

        if dice1 == dice2 and dice1 + dice2 != 0:
            if not player.jail:
                player.double_roll = True
                re_check_location = True
            else:
                player.jail = False
                player.double_roll = False
                re_check_location = False
        else:
            re_check_location = False
            if player.jail:
                print(">> Player didn't roll a double and is in jail")
                dice1, dice2 = 0, 0

        new_pos = self.get_pos(player_id) + dice1 + dice2
        if new_pos > 39:
            self.give_money(player_id, Board._GO_AMOUNT)
            new_pos %= 40
        self.move_player(player_id, new_pos)

        square = self.get_square(new_pos)

        if square.square_type in (Square.PROPERTY, Square.UTILITY, Square.TRANSPORT):
            #print(">>Square is ownable square")
            # can be bought or may be bought already
            if square.is_owned:
                #print(">>Square is owned")
                if square.owner != player_id:
                    if square.is_mortgaged:
                        what_happened = "This property is mortgaged - no rent"
                    else:
                        if square.square_type == Square.PROPERTY:
                            #print(">>Square is a property square")
                            rent = square.base_rent * (2**square.num_houses)
                        elif square.square_type == Square.UTILITY:
                            #print(">>Square is a utility square")
                            dice_roll_sum = sum(self.roll_dice())
                            owner = self._players[square.owner]
                            if owner.num_utils() == 1:
                                rent = dice_roll_sum * square.one_owned
                            else:
                                rent = dice_roll_sum * square.two_owned
                        elif square.square_type == Square.TRANSPORT:
                            #print(">>Square is a transport square")
                            owner = self._players[square.owner]
                            rent = square.base_rent * (2**owner.num_transports())

                        try:
                            self.take_money(player_id, rent)
                        except PlayerLostError:
                            self.remove_player(player_id)
                            raise PlayerLostError
                        what_happened = "Player {} paid ${} to {} in rent.".format(
                            player_id, rent, square.owner)
                        self.give_money(square.owner, rent)

                else:
                    what_happened = "Player {} already owns square".format(player_id)

                yield "paid_rent|" + what_happened

            else:
                #print(">>Square is not owned")
                buy_auction = yield "buy_auction"
                if buy_auction == "buy":
                    #print(">>User will buy")
                    cost = square.price
                    square.owner = player_id
                    self.take_money(player_id, cost)
                    new_owner = self._players[player_id]
                    
                    square.is_owned = True

                    if square.square_type == Square.PROPERTY:
                        new_owner.add_property(square)
                    elif square.square_type == Square.UTILITY:
                        new_owner.add_utility(square)
                    elif square.square_type == Square.TRANSPORT:
                        new_owner.add_transport(Square)

                    yield "property_bought"

                elif buy_auction == "auction":
                    #print(">>User will auction")
                    highest_bidder, bid = yield None
                    if highest_bidder:
                        square.owner = highest_bidder
                        self.take_money(highest_bidder, bid)
                        new_owner = self._players[highest_bidder]

                        square.is_owned = True

                        if square.square_type == Square.PROPERTY:
                            new_owner.add_property(square)
                        elif square.square_type == Square.UTILITY:
                            new_owner.add_utility(square)
                        elif square.square_type == Square.TRANSPORT:
                            new_owner.add_transport(Square)

                    yield "property_auctioned"

                else:
                    print(">>Expecting buy, auction or no_buy but got '%s'"%(str(buy_auction)))
                    raise Exception("Out of turn message")

        elif square.square_type == Square.ACTION:
            # could be [chest|chance|jail|stay|tax]
            #print(">>Square is action square")
            what_happened = []
            if square.action in (ActionSquare.CHEST, ActionSquare.CHANCE):
                #print(">>Square is chest | chance")
                if square.action == ActionSquare.CHEST:
                    what_happened.append("Player {} drew a Chest card".format(
                        player_id))
                elif square.action == ActionSquare.CHANCE:
                    what_happened.append("Player {} drew a Chance card".format(
                        player_id))

                card = random.choice(list(self._action_cards))
                if card.card_type == Card.MOVE:
                    new_pos = card.move_to_pos
                    self.move_player(player_id, new_pos)
                    if new_pos != Board._JAIL_POS:
                        re_check_location = True
                    else:
                        player.double_roll = False
                        re_check_location = False
                        player.jail = True
                        player.jail_turn_count = 0
                elif card.card_type == Card.GAIN_MONEY:
                    amount = card.gain_amount
                    self.give_money(player_id, amount)
                elif card.card_type == Card.LOSE_MONEY:
                    amount = card.lose_amount
                    try:
                        self.take_money(player_id, amount)
                    except PlayerLostError:
                        self.remove_player(player_id)
                        raise PlayerLostError
                elif card.card_type == Card.GET_OUT_OF_JAIL:
                    player.free = True

                what_happened.append(card.text)

            elif square.action == ActionSquare.JAIL:
                #print(">>Sqaure is Go to Jail square")
                player.double_roll = False
                re_check_location = False
                player.jail = True
                player.jail_turn_count = 0
                self.move_player(player_id, Board._JAIL_POS)

                what_happened.append("Player {} went to jail".format(
                        player_id))
            elif square.action == ActionSquare.STAY:
                #print(">>Sqaure is free parking")
                if player.jail:
                    what_happened.append("Player {} is still in jail".format(
                            player_id))
                else:
                    what_happened.append("Player {} got free parking".format(
                            player_id))
            elif square.action == ActionSquare.TAX:
                #print(">>Sqaure is get taxed square")
                tax = 100 * (2**Board._TAX_POS.index(new_pos))
                try:
                    self.take_money(player_id, tax)
                except PlayerLostError:
                    self.remove_player(player_id)
                    raise PlayerLostError
                what_happened.append("Player {} paid {} in tax".format(
                        player_id, tax))

            yield "action_square|" + "\n".join(what_happened)

        new_roll = player.double_roll
        player.double_roll = False
        yield re_check_location, new_roll

class BuildException(Exception):
    """
    An exception which occurs when a player attempts to 
    either build or sell a house when they are not allowed to
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

class MortgageException(Exception):
    """
    An exception which will be raised when a player trys to Mortgage 
    a property when they are not allowed to. 
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
