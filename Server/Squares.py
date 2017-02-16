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
        id - the id of the square in relation to the baord [0-39]
        players - The players which are on the Square at any given moment
        """
        self._id = square_id
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
        return self._square_type

    @square_type.setter
    def square_type(self, new_square_type):
        self._square_type = new_square_type

    def add_player(self, player):
        """
        Adds the player to this square
        """
        self._players.append(player)

    def remove_player(self, player):
        """
        Removes the player from the current square
        """
        try:
            self._players.remove(player)
        except ValueError:
            raise ValueError("Square.remove_player(p): p not on square")

    def has_player(self, player):
        """
        Returns true if player is on this square, false otherwise. 
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
        action - the action which results in landing on this square
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
        return self._action

    @action.setter
    def action(self, new_action):
        self._action = new_action 

class OwnableSquare(Square):
    """
    Represents a square which can be bought. 
    """
    def __init__(self, square_id, price):
        super().__init__(square_id)
        self._price = price
        self._is_owned = False
        self._owner = None 

    @property
    def is_owned(self):
        return self._is_owned

    @is_owned.setter
    def is_owned(self, new_is_owned):
        self._is_owned = new_is_owned 

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, new_price):
        self._price = new_price 

    @property
    def owner(self):
        return self._price

    @owner.setter
    def owner(self, new_owner):
        self._owner = new_owner 





class PropertySquare(OwnableSquare):
    """
    This class represents a property square.
    """

    def __init__(self, square_id, price, base_rent, estate, property_id):
        """
        price - the price to buy the property
        base_rent - the base rent price*
        estate - the estate id of the property

        *The base rent well double for each house built on the property. A hotel
        equates to 5 houses. So  rent = base_rent * (2^num_houses_on_square)
        """
        super().__init__(square_id, price)
        self._base_rent = base_rent 
        self._estate = estate
        self._property_id = property_id
        self._square_type = Square.PROPERTY
        self._num_houses = 0

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

class UtilitySquare(OwnableSquare):
    """
    This class represents a utility. There are two of these in the game.
    """

    def __init__(self, square_id, price, one_owned = 4, two_owned = 10):
        """
        one_owned - the number which will be multiplied by the diceroll to
                    decide the rent if a player lands here when only one
                    utility os owned.
        two_owned - same as one_owned but for when both utilities are owned.
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
        return self._one_owned

    @one_owned.setter
    def one_owned(self, new_one_owned):
        self._one_owned = new_one_owned 

    @property
    def two_owned(self):
        return self._two_owned

    @two_owned.setter
    def two_owned(self, new_two_owned):
        self._two_owned = new_two_owned 


class TransportSquare(OwnableSquare):
    """
    This class represents a transport square. There are four of these in the game.
    The base rent is common to all transports. 
    """

    def __init__(self, square_id, price, base_rent = 500):
        """
        rent - this is the base_rent of the square*

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
        return self._base_rent