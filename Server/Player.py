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
        position - the position on the board of the current player
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
        """
        The current amount of money the player has.
        """
        return self._money

    @money.setter
    def money(self, new_amount):
        self._money = new_amount
        if self._money <= 0:
            raise PlayerLostError

    @property
    def free(self):
        """
        Whether or not the player has a get out of jail free card.
        """
        return self._free 

    @free.setter
    def free(self, new_val):
        self._free = new_val

    @property
    def jail(self):
        """
        Whether or not the player is currently in jail.
        """
        return self._jail

    @jail.setter
    def jail(self, new_val):
        self._jail = new_val

    @property
    def id(self):
        """
        The unique identifier of the player.
        """
        return self._id

    @id.setter
    def id(self, new_id):
        self._id = new_id

    @property
    def double_roll(self):
        """
        Whether or not the player rolled a double on their last dice-roll.
        """
        return self._double_roll

    @double_roll.setter
    def double_roll(self, new_double_roll):
        self._double_roll = new_double_roll

    def add_property(self, property_square):
        """
        Adds the new property to the player's position.

        :param property_square: the PropertySquare being added
        """
        self._properties.add(property_square)

    def add_utility(self, utility_square):
        """
        Adds the new utility to the player's position.

        :param utility_square: the UtilitySquare being added
        """
        self._utils.add(utility_square)

    def add_transport(self, transport_square):
        """
        Adds the new transport to the player's position.

        :param transport_square: the TransportSquare being added
        """
        self._transports.add(transport_square)

    def num_transports(self):
        """
        :returns: the number of transports the player owns
        """
        return len(self._transports)

    def num_utils(self):
        """
        The number of utilities which the player owns.
        
        :returns: the number of utilities the player owns
        """
        return len(self._utils)

    def get_assets(self):
        """
        Gets all the assets this player owns.

        :returns: a list of assets this player owns
        """
        return list(self._properties) + list(self._utils) + list(self._transports)


    @property
    def jail_turn_count(self):
        """
        The number of turns which a player has been in jail. 
        """
        return self._jail_turn_count 

    @jail_turn_count.setter
    def jail_turn_count(self, new_val):
        self._jail_turn_count = new_val


    @property
    def properties(self):
        """
        A set of properties which the player owns.
        """
        return self._properties

    @properties.setter
    def properties(self, new_val):
        self._properties = new_val

class PlayerLostError(Exception):
    """
    An exception class which will be raised if a player's money goes below 0
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)