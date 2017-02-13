import unittest
from Board import * 
class BoardTests(unittest.TestCase):
    """
    Unit tests for all classes in self.boardaords.py
    """
    def setUp(self):
        self.num_players = 5
        self.board = Board(self.num_players)
        self.players = self.board.get_players(0)

    def tearDown(self):
        self.board = None
        self.players = None

    def test_move_player(self):
        p = self.players[0] 
        self.assertTrue(self.board.get_square(0).has_player(p))
        self.board.move_player(p.get_id(), 10)
        self.assertFalse(self.board.get_square(0).has_player(p))
        self.assertTrue(self.board.get_square(10).has_player(p))

    def test_get_players(self):
        # assumes all players initialised to position 0 
        print(len(self.board.get_players(0)))
        self.assertTrue(len(self.board.get_players(0)) == self.num_players)

    def test_take_money(self):
        player = self.players[0]
        before_amount = player.money 
        take_amount = 5
        self.board.take_money(player.get_id(), take_amount)
        self.assertTrue(player.money == before_amount - take_amount)

    def test_give_money(self):
        player = self.players[0]
        before_amount = player.money 
        give_amount = 5
        self.board.give_money(player.get_id(), give_amount)
        self.assertTrue(player.money == before_amount + give_amount)

    def test_go_to_jail(self):
        player = self.players[0]
        self.assertFalse(player.jail)
        self.board.go_to_jail(player.get_id())
        self.assertTrue(player.jail)
        self.assertTrue(self.board.get_pos(player.get_id()) == Board.JAIL_POS)

    def test_obtain_get_out_jail_free(self):
        player = self.players[0]
        self.assertFalse(player.free)
        self.board.obtain_get_out_jail_free(player.get_id())
        self.assertTrue(player.free)

    def test_use_get_out_jail_free(self):
        player = self.players[0] 
        self.board.obtain_get_out_jail_free(player.get_id())
        self.board.go_to_jail(player.get_id())
        self.assertTrue(player.jail)
        self.assertTrue(player.free)
        self.board.use_get_out_jail_free(player.get_id())
        self.assertFalse(player.jail)
        self.assertFalse(player.free)