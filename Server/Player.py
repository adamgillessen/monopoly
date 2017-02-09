class Player:
    """
    This class represents a player's state. 
    """
    ID = 0
    INITIAL_MONEY = 2000

    def __init__(self):
        """
        id - player id
        money - the amount of money the player currently has
        properties - the properties which the player owns
        postion - the postion on the board of the current player
        utils - the utils which the player currently owns
        transports - the transports which the player currently owns 
        free - True if the player has a get out if jail free card, else False
        """
        self._id = Player.ID 
        Player.ID += 1 
        self._money = Player.INITIAL_MONEY
        self._properties = set()
        self._position = 0
        self._utils = set()
        self._transports = set() 
        self._free = False 