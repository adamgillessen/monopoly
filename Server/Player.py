class Player:
    """
    This class represents a player's state. 
    """
    INITIAL_MONEY = 2000

    def __init__(self, player_id):
        """
        id - player id
        money - the amount of money the player currently has
        properties - the properties which the player owns
        postion - the postion on the board of the current player
        utils - the utils which the player currently owns
        transports - the transports which the player currently owns 
        free - True if the player has a get out if jail free card, else False
        """
        self._id = player_id
        self._money = Player.INITIAL_MONEY
        self._properties = set()
        self._position = 0
        self._utils = set()
        self._transports = set() 
        self._free = False 
        self._jail = False 
        self._double_roll = False 

    def __str__(self):
        """
        Returns a string represention of the player. 
        """
        return "Player{}".format(self._id)

    @property
    def money(self):
        return self._money

    @money.setter
    def money(self, new_amount):
        self._money = new_amount

    @property
    def free(self):
        return self._free 

    @free.setter
    def free(self, new_val):
        self._free = new_val

    @property
    def jail(self):
        return self._jail

    @jail.setter
    def jail(self, new_val):
        self._jail = new_val

    def get_id(self):
        """
        Returns the id of self. 
        """
        return self._id 

