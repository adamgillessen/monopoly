from Squares import * 

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
    # PROPERTY_POS_INFO[position] = [price, rent, estate]
    PROPERTY_POS_INFO = {
        1 : [60, 10, 0],
        3 : [60, 20, 0],
        6 : [100, 30, 1],
        8 : [100, 30, 1],
        9 : [120, 40, 1],
        11 : [140, 50, 2],
        13 : [140, 50, 2],
        14 : [160, 60, 2],
        16 : [180, 70, 3],
        18 : [180, 70, 3],
        19 : [200, 80, 3],
        21 : [220, 90, 4],
        23 : [220, 90, 4],
        24 : [240, 100, 4],
        26 : [260, 110, 5],
        27 : [260, 110, 5],
        29 : [280, 120, 5],
        31 : [300, 130, 6],
        32 : [300, 130, 6],
        34 : [320, 150, 6],
        37 : [350, 175, 7],
        39 : [400, 200, 7],
    } 
    
    def __init__(self):
        """
        Initialises the board with the relevant squares in the correct place
        """
        self._b = [None for _ in range(Board.NUM_SQUARES)]

        for pos in Board.UTIL_POS:
            self._b[pos] = UtilitySquare(pos)

        for pos in Board.TRANS_POS:
            self._b[pos] = TransportSquare(pos)

        for pos in Board.CHEST_POS:
            self._b[pos] = ActionSquare(pos, action="chest")

        for pos in Board.CHANCE_POS:
            self._b[pos] = ActionSquare(pos, action="chance")

        for pos in Board.CORNER_POS:
            if pos == Board.CORNER_POS[1] or pos == Board.CORNER_POS[2]:
                self._b[pos] = ActionSquare(pos, action="stay")
            elif pos == Board.CORNER_POS[0]:
                self._b[pos] = ActionSquare(pos, action="go")
            elif pos == Board.CORNER_POS[3]:
                self._b[pos] = ActionSquare(pos, action="jail")

        for pos, info in Board.PROPERTY_POS_INFO.items():
            price, rent, estate = info 
            self._b[pos] = PropertySquare(pos, price, rent, estate)

if __name__ == "__main__":
    Board()