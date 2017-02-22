class Card:
    """
    This class represents a chest or chance card.
    """
    MOVE = 1
    GAIN_MONEY = 2
    LOSE_MONEY = 3
    GET_OUT_OF_JAIL = 4
    def __init__(self, type, text):
        self._card_type = type
        self._text = text 

    @property 
    def card_type(self):
        return self._card_type

    @property
    def text(self):
        return self._text

class MoveCard(Card):
    """
    Represents a card which moves a player to a new position.
    """
    # Move to GO, JAIL, 3 Properties, 1 transport
    def __init__(self, move_to_pos, text):
        super().__init__(Card.MOVE, text)
        self._move_to_pos = move_to_pos

    @property 
    def move_to_pos(self):
        return self._move_to_pos

class GainMoneyCard(Card):
    """
    Represents a card which gives more money to a player. 
    """
    def __init__(self, amount, text):
        super().__init__(Card.GAIN_MONEY, text)
        self._gain_amount = amount

    @property 
    def gain_amount(self):
        return self._gain_amount

class LoseMoneyCard(Card):
    """
    Represents a card which deducts money from a player. 
    """
    def __init__(self, amount, text):
        super().__init__(Card.LOSE_MONEY, text)
        self._lose_amount = amount

    @property 
    def lose_amount(self):
        return self._lose_amount

class GetOutOfJailFreeCard(Card):
    """
    Represents a get out of jail free card. 
    """
    def __init__(self):
        super().__init__(Card.GET_OUT_OF_JAIL, "Received Get out of Jail Free Card")