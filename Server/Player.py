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

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, new_id):
        self._id = new_id

    @property
    def double_roll(self):
        return self._double_roll

    @id.setter
    def double_roll(self, new_double_roll):
        self._double_roll = new_double_roll

    def add_property(self, property_square):
        """
        Adds the new property to the player's position.

        :param property_square - the PropertySquare being added
        """
        self._properties.add(property_square)

    def add_utility(self, utility_square):
        """
        Adds the new utility to the player's position.

        :param utility_square - the UtilitySquare being added
        """
        self._utils.add(utility_square)

    def add_transport(self, transport_square):
        """
        Adds the new transport to the player's position.

        :param transport_square - the TransportSquare being added
        """
        self._transports.add(transport_square)

    def num_transports(self):
        """
        :return the number of transports the player owns
        """
        return len(self._transports)

    def num_utils(self):
        """
        The number of utilities which the player owns.
        :return the number of utilities the player owns
        """
        return len(self._utils)