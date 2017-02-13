from Squares import * 
from Player import * 

class Board:
    """
    This class represents the board state and provides functions to change the
    board state. 
    """
    NUM_SQUARES = 40
    UTIL_POS = [12, 28]
    TRANS_POS = [5, 15, 25, 35]
    CHEST_POS = [2, 17, 33]
    CHANCE_POS = [7, 22, 36]
    CORNER_POS = [0, 10, 20, 30]
    TAX_POS = [4, 38]
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
    
    def __init__(self, num_players):
        """
        Initialises the board with the relevant squares in the correct place
        """

        # Initialise Squares
        self._board = [None for _ in range(Board.NUM_SQUARES)]

        for pos in Board.UTIL_POS:
            self._board[pos] = UtilitySquare(pos)

        for pos in Board.TRANS_POS:
            self._board[pos] = TransportSquare(pos)

        for pos in Board.CHEST_POS:
            self._board[pos] = ActionSquare(pos, action="chest")

        for pos in Board.CHANCE_POS:
            self._board[pos] = ActionSquare(pos, action="chance")

        for pos in Board.TAX_POS:
            self._board[pos] = ActionSquare(pos, action="tax")

        for pos in Board.CORNER_POS:
            if pos == Board.CORNER_POS[1] or pos == Board.CORNER_POS[2]:
                self._board[pos] = ActionSquare(pos, action="stay")
            elif pos == Board.CORNER_POS[0]:
                self._board[pos] = ActionSquare(pos, action="go")
            elif pos == Board.CORNER_POS[3]:
                self._board[pos] = ActionSquare(pos, action="jail")

        for pos, info in Board.PROPERTY_POS_INFO.items():
            price, rent, estate, prop_id = info 
            self._board[pos] = PropertySquare(pos, price, rent, estate, prop_id)

        # create players
        self._players = [Player(i) for i in range(num_players)]

        # Initialise players at position 0 (Go)
        self._player_positions = {}
        for p in self._players:
            self._player_positions[p] = 0 
            self._board[0].add_player(p)

    def __str__(self):
        """
        Returns a string representation of the baord. 
        """
        s = ""
        for i, square in enumerate(self._board):
            if i > 0 and not i%5:
                s += "\n"
            s += str(square) + " "
        return s 


    def move_player(self, player_id, new_pos):
        """
        Moves Player with id "player_id" from old position to "new_pos". 
        """
        player = self._players[player_id]
        # remove from old square
        self._board[self._player_positions[player]].remove_player(player)

        # add to new square
        self._player_positions[player] = new_pos
        self._board[new_pos].add_player(player)

    def get_players(self, pos):
        """
        returns a list of all players at position pos. 
        """
        return list(self._board[pos])

    def get_pos(self, player_id):
        """
        Returns the square id which the player with id "player_id" is on. 
        """
        return self._player_positions[self._players[player_id]]

    def get_square(self, pos):
        """
        Returns the square at position pos. 
        """
        if pos >= Board.NUM_SQUARES:
            raise IndexError(
                "Board.get_square({}): Index {} not in Board of size {}".format(
                    pos, pos, Board.NUM_SQUARES)) 
        return self._board[pos]

    def take_money(self, player_id, amount):
        """
        Takes "amount" amount of money from Player with id "player_id"
        """
        player = self._players[player_id]
        player.money -= amount

    def give_money(self, player_id, amount):
        """
        Gives "amount" amount of money to Player with id "player_id"
        """
        player = self._players[player_id]
        player.money += amount

    def obtain_get_out_jail_free(self, player_id):
        """
        Gives the Player with id "player_id" a get out of jail free card. 
        """
        player = self._players[player_id]
        player.free = True 

    def go_to_jail(self, player_id):
        """
        Moves player with id "player_id" to jail"
        """
        self.move_player(player_id, Board.JAIL_POS)
        player = self._players[player_id]
        player.jail = True 

    def leave_jail(self, player_id):
        """
        Moves the player wit id "player_id" out of jail
        """
        player = self._players[player_id]
        player.jail = False 

    def use_get_out_jail_free(self, player_id):
        """
        Player with id "player_id" uses their get out of jail free card. 
        """
        player = self._players[player_id]
        if not player.free:
            raise ValueError(
                "Board.use_get_out_jail_free({}): Player with id {} has no get out of jail free card".format(
                    player_id, player_id))
        player.free = False 
        player.jail = False 