class Square:
    """
    This class represents a single square on the Monopoly board. 
    """

    def __init__(self, square_id):
        """
        id - the id of the square in relation to the baord [0-39]
        players - The players which are on the Square at any given moment
        """
        self._id = square_id
        self._players = []

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

    def __init__(self, square_id, action):
        """
        action - the action which results in landing on this square
            [chest|chance|jail|go|stay|tax]
        """
        super().__init__(square_id)
        self._action = action

    def __str__(self):
        """
        Returns a string representation of the ActionSquare.
        """
        return "Action" + super().__str__()

class PropertySquare(Square):
    """
    This class represents a property square.
    """

    def __init__(self, square_id, price, rent, estate, property_id):
        """
        price - the price to buy the property
        rent - the base rent price*
        estate - the estate id of the property

        *The base rent well double for each house built on the property. A hotel
        equates to 5 houses. So  rent = base_rent * (2^num_houses_on_square)
        """
        super().__init__(square_id)
        self._price = price 
        self._rent = rent 
        self._estate = estate
        self._property_id = property_id

    def __str__(self):
        """
        Returns a string representation of the PropertySquare.
        """
        return "Property" + super().__str__()

class UtilitySquare(Square):
    """
    This class represents a utility. There are two of these in the game.
    """

    def __init__(self, square_id, one_owned = 4, two_owned = 10):
        """
        one_owned - the number which will be multiplied by the diceroll to
                    decide the rent if a player lands here when only one
                    utility os owned.
        two_owned - same as one_owned but for when both utilities are owned.
        """
        super().__init__(square_id)

    def __str__(self):
        """
        Returns a string representation of the UtilitySquare.
        """
        return "Utility" + super().__str__()

class TransportSquare(Square):
    """
    This class represents a transport square. There are four of these in the game.
    The base rent is common to all transports. 
    """

    def __init__(self, square_id, rent = 500):
        """
        rent - this is the base_rent of the square*

        *The base rent will double for each utility owned equating to the actual rent
        """
        super().__init__(square_id)
        self._rent = rent 

    def __str__(self):
        """
        Returns a string representation of the TransportSquare.
        """
        return "Transport" + super().__str__()
