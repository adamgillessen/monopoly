import unittest
from Squares import * 
class SquareUnitTests(unittest.TestCase):
    """
    UnitTests for all classes in this file. 
    """
    def test_Square_add_player(self):
        s = Square(0)
        p = object()
        s.add_player(p)
        self.assertTrue(s.has_player(p))

        s.remove_player(p)
        self.assertFalse(s.has_player(p))

if __name__ == "__main__":
    unittest.main()