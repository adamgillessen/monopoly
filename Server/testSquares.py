import unittest
from Squares import * 
from Player import * 
class SquareUnitTests(unittest.TestCase):
    """
    UnitTests for all classes in this file. 
    """
    def test_Square_add_player(self):
        s = Square(0)
        p = Player(1)
        s.add_player(p)
        self.assertTrue(s.has_player(p))

    def test_remove_player(self):
        s = Square(0)
        p = Player(1)
        s.add_player(p)
        s.remove_player(p)
        self.assertFalse(s.has_player(p))

    def test_property_square(self):
        s = PropertySquare(2, 200, 20, 0)
        self.assertTrue(s.num_houses == 0)
        s.num_houses += 1
        self.assertTrue(s.num_houses == 1)
        self.assertTrue(s.base_rent == 20)

    def test_utility_square(self):
        s = UtilitySquare(2, 500)
        self.assertTrue(s.one_owned == 4)
        self.assertTrue(s.two_owned == 10)

    def test_transport_square(self):
        s = TransportSquare(1, 20)
        self.assertTrue(s.base_rent == 500)

if __name__ == "__main__":
    unittest.main()