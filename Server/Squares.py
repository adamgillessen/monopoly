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

class ActionSquare(Square):
    """
    This class represents an Actionable Square. This includes:
        - Community Chest Squares
        - Chance Squares
        - Go Square
        - Jail Square
        - Free Parking Square
        - Go to Jail Square
    """

    def __init__(self, square_id, action):
        """
        action - the action which results in landing on this square
            [chest|chance|jail|go|stay]
        """
        super().__init__(square_id)
        self._action = action

class PropertySquare(Square):
    """
    This class represents a property square.
    """

    def __init__(self, square_id, price, rent, estate):
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