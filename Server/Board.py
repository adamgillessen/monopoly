"""
This controls the Squares and Players and manages the whole game. 
"""

from Squares import * 
from Player import * 
import random

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
    # UTIL_POS_INFO[position] = price
    UTIL_POS_INFO = {
        12 : 200,
        28 : 200
    }
    # TRANS_POS_INFO[position] = price
    TRANS_POS_INFO = {
        5 : 150,
        15 : 150,
        25 : 150,
        35 : 150
    }
    # PROPERTY_POS_INFO[position] = [price, rent, estate, id]
    PROPERTY_POS_INFO = {
        1 : [60, 10, 0, 0],
        3 : [60, 20, 0, 1],
        6 : [100, 30, 1, 2],
        8 : [100, 30, 1, 3],
        9 : [120, 40, 1, 4],
        11 : [140, 50, 2, 5],
        13 : [140, 50, 2, 6],
        14 : [160, 60, 2, 7],
        16 : [180, 70, 3, 8],
        18 : [180, 70, 3, 9],
        19 : [200, 80, 3, 10],
        21 : [220, 90, 4, 11],
        23 : [220, 90, 4, 12],
        24 : [240, 100, 4, 13],
        26 : [260, 110, 5, 14],
        27 : [260, 110, 5, 15],
        29 : [280, 120, 5, 16],
        31 : [300, 130, 6, 17],
        32 : [300, 130, 6, 18],
        34 : [320, 150, 6, 19],
        37 : [350, 175, 7, 20],
        39 : [400, 200, 7, 21],
    }
    JAIL_POS = 9
    GO_AMOUNT = 200
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

        for pos, price in Board.UTIL_POS_INFO.items():
            self._board[pos] = UtilitySquare(pos, price)

        for pos, price in Board.TRANS_POS_INFO.items():
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

    def roll_dice(self):
        """
        Simulates a dice roll. Returns a pair of integers representing the value
        on each dice. 
        :return a tuple of ints of length 2
        """
        d1, d2 = (random.randint(1, 7) for _ in range(2))
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
        print("Here")
        player = self._players[player_id]

        if dice1 == dice2:
            player.double_roll = True 

        new_pos = player.get_pos() + dice1 + dice2
        if new_pos > 39:
            self.give_money(player_id, Board.GO_AMOUNT)
            new_pos %= 40
        self.move_player(player_id, new_pos)

        square = self.get_square(new_pos)

        if square.square_type in (Square.PROPERTY, Square.UTILITY, Square.TRANSPORT):
            # can be bought or may be bought already
            if square.is_owned:
                if square.square_type == Square.PROPERTY:
                    rent = square.base_rent * (2**square.num_houses)
                elif square.square_type == Square.UTILITY:
                    dice_roll_sum = sum(self.roll_dice())
                    owner = self._players[square.owner]
                    if owner.num_utils() == 1:
                        rent = dice_roll_sum * square.one_owned
                    else:
                        rent = dice_roll_sum * square.two_owned
                elif square.square_type == Square.TRANSPORT:
                    owner = self._players[square.owner]
                    rent = square.base_rent * (2**owner.num_transports())

                self.give_money(square.owner, rent)
                self.take_money(player_id, rent)
            else:
                buy_auction = yield "buy_auction"
                if buy_auction == "buy":
                    cost = square.price
                    square.owner = player_id
                    self.take_money(player_id, cost)
                    new_owner = self._players[player_id]
                
                elif buy_auction == "auction":
                    highest_bidder = yield None 
                    bid = yield None
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
        elif square.square_type == Square.ACTION:
            # could be [chest|chance|jail|stay|tax]
            if square.action == ActionSquare.CHEST:
                pass
            elif square.action == ActionSquare.CHANCE:
                pass
            elif square.action == ActionSquare.JAIL:
                self.move_player(player_id, Board.JAIL_POS)
            elif square.action == ActionSquare.STAY:
                pass
            elif square.action == ActionSquare.TAX:
                tax = 100 * (2**Board.TAX_POS.index(new_pos))

if __name__ == "__main__":
    b = Board(4)
    b.take_turn(1, 1, 2).send(None)
    print(b)