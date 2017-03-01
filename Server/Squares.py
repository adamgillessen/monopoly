class Square:
    """
    This class represents a single square on the Monopoly board. 
    """
    ACTION = 0
    PROPERTY = 1
    UTILITY = 2
    TRANSPORT = 3
    def __init__(self, square_id):
        """
        :param square_id: the id of the square in relation to the baord [0-39]
        """
        self._square_id = square_id
        self._players = []
        self._square_type = None 

    def __iter__(self):
        """
        An iterator which returns every player currently on this square. 
        """
        for p in self._players:
            yield p 

    def __str__(self):
        """
        Returns a string representation of the Square. 
        """
        return "Square {}: [{}]".format(self._id, " ".join(str(p) for p in self._players))


    @property
    def square_type(self):
        """
        The type of the square which must be one of the Square class variabls.
        """
        return self._square_type

    @square_type.setter
    def square_type(self, new_square_type):
        self._square_type = new_square_type

    @property
    def square_id(self):
        """
        The unique identifier of the square.
        """
        return self._square_id

    @square_id.setter
    def square_id(self, new_square_id):
        self._square_id = new_square_id

    def add_player(self, player):
        """
        Adds the player to this square

        :param player: the player object to be added
        """
        self._players.append(player)

    def remove_player(self, player):
        """
        Removes the player from the current square.

        :param player: ther player object to be removed
        """
        self._players.remove(player)

    def has_player(self, player):
        """
        Returns true if player is on this square, false otherwise. 

        :returns: a boolean
        """
        return player in self._players

class ActionSquare(Square):
    """
    This class represents an Actionable Square. This includes:
        - Community Chest Squares
        - Chance Squares
        - Go Square
        - Jail Square
        - Free Parking Square
        - Go to Jail Square
        - Tax
    """
    CHEST = 0
    CHANCE = 1
    JAIL = 2
    STAY = 3
    TAX = 4

    def __init__(self, square_id, action):
        """
        :param square_id: the id of the square
        :param action: the action which results in landing on this square
            [chest|chance|jail|stay|tax]
        """
        super().__init__(square_id)
        self._action = action
        self._square_type = Square.ACTION

    def __str__(self):
        """
        Returns a string representation of the ActionSquare.
        """
        return "Action" + super().__str__()

    @property
    def action(self):
        """
        The action whcih the square could represent. Must be one
        of the ActionSquare class variables.
        """
        return self._action

    @action.setter
    def action(self, new_action):
        self._action = new_action 

class OwnableSquare(Square):
    """
    Represents a square which can be bought. 
    """
    def __init__(self, square_id, price):
        """
        :param square_id: the id of the square
        :param price: the price which must be paid to own the square
        """
        super().__init__(square_id)
        self._price = price
        self._is_owned = False
        self._owner = -1 
        self._is_mortgaged = False
        self._mortgage_value = price // 2

    @property
    def is_owned(self):
        """
        Whether or not the square is owned by someone

        :returns: True if the square is owned by a player, False otherwise
        """
        return self._is_owned

    @is_owned.setter
    def is_owned(self, new_is_owned):
        self._is_owned = new_is_owned 

    @property
    def price(self):
        """
        The price a player must pay to own the square.

        :returns: an integer representing the price
        """
        return self._price

    @price.setter
    def price(self, new_price):
        self._price = new_price 

    @property
    def owner(self):
        """
        Information on the current owner. If there is no owner, -1 is returned.

        :returns: the owner id of the current owner
        """
        if self._is_owned:
            return self._owner
        else:
            return -1 
    @owner.setter
    def owner(self, new_owner):
        self._owner = new_owner 

    @property
    def is_mortgaged(self):
        return self._is_mortgaged

    @is_mortgaged.setter
    def is_mortgaged(self, new_is_mortgaged):
        self._is_mortgaged = new_is_mortgaged 

    @property
    def mortgage_value(self):
        return self._mortgage_value



class PropertySquare(OwnableSquare):
    """
    This class represents a property square.
    """

    def __init__(self, square_id, price, base_rent, estate):
        """
        :param price: the price to buy the property
        :param base_rent: the base rent price*
        :param estate: the estate id of the property

        *The base rent well double for each house built on the property. A hotel
        equates to 5 houses. So  rent = base_rent * (2^num_houses_on_square)
        """
        super().__init__(square_id, price)
        self._base_rent = base_rent 
        self._estate = estate
        self._square_type = Square.PROPERTY
        self._num_houses = 0
        self._house_cost = base_rent

    def __str__(self):
        """
        Returns a string representation of the PropertySquare.
        """
        return "Property" + super().__str__()

    @property
    def num_houses(self):
        return self._num_houses

    @num_houses.setter
    def num_houses(self, new_num_houses):
        self._num_houses = new_num_houses 

    @property
    def base_rent(self):
        return self._base_rent

    @property
    def estate(self):
        return self._estate

    @property
    def house_cost(self):
        return self._house_cost

class UtilitySquare(OwnableSquare):
    """
    This class represents a utility. There are two of these in the game.
    """

    def __init__(self, square_id, price, one_owned = 4, two_owned = 10):
        """
        :param one_owned: the number which will be multiplied by the diceroll to
            decide the rent if a player lands here when only one utility os owned.
        :param two_owned: same as one_owned but for when both utilities are owned.
        """
        super().__init__(square_id, price)
        self._square_type = Square.UTILITY
        self._one_owned = one_owned
        self._two_owned = two_owned

    def __str__(self):
        """
        Returns a string representation of the UtilitySquare.
        """
        return "Utility" + super().__str__()

    @property
    def one_owned(self):
        """
        This is the multiplier which the dice is multiplied by when one utility
        is owned and the rent is being calculated. 

        :returns: an integer
        """
        return self._one_owned

    @property
    def two_owned(self):
        """
        This is the multiplier which the dice is multiplied by when two utilities
        are owned and the rent is being calculated. 

        :returns: an integer
        """
        return self._two_owned


class TransportSquare(OwnableSquare):
    """
    This class represents a transport square. There are four of these in the game.
    The base rent is common to all transports. 
    """

    def __init__(self, square_id, price, base_rent = 500):
        """
        :param square_id: the id of the square
        :param price: the price someone mustpay to buy the property
        :param base_rent: this is the base_rent of the square*

        *The base rent will double for each utility owned equating to the actual rent
        """
        super().__init__(square_id, price)
        self._base_rent = base_rent 
        self._square_type = Square.TRANSPORT

    def __str__(self):
        """
        Returns a string representation of the TransportSquare.
        """
        return "Transport" + super().__str__()

    @property
    def base_rent(self):
        """
        The rent someone must pay when there are no houses on the square.

        :returns: the integer base rent
        """
        return self._base_rent