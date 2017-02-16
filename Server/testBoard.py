import unittest
from Board import * 
from Player import * 
from Squares import * 
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
        self.board.move_player(p.id, 10)
        self.assertFalse(self.board.get_square(0).has_player(p))
        self.assertTrue(self.board.get_square(10).has_player(p))

    def test_get_players(self):
        # assumes all players initialised to position 0 
        self.assertTrue(len(self.board.get_players(0)) == self.num_players)
        self.assertTrue(isinstance(self.board.get_players(0)[0], Player))

    def test_get_pos(self):
        p = self.players[0]
        self.assertTrue(self.board.get_pos(p.id) == 0)

    def test_get_square(self):
        self.assertTrue(isinstance(self.board.get_square(0), Square))

    def test_take_money(self):
        player = self.players[0]
        before_amount = player.money 
        take_amount = 5
        self.board.take_money(player.id, take_amount)
        self.assertTrue(player.money == before_amount - take_amount)

    def test_give_money(self):
        player = self.players[0]
        before_amount = player.money 
        give_amount = 5
        self.board.give_money(player.id, give_amount)
        self.assertTrue(player.money == before_amount + give_amount)

    def test_go_to_jail(self):
        player = self.players[0]
        self.assertFalse(player.jail)
        self.board.go_to_jail(player.id)
        self.assertTrue(player.jail)
        self.assertTrue(self.board.get_pos(player.id) == Board.JAIL_POS)

    def test_obtain_get_out_jail_free(self):
        player = self.players[0]
        self.assertFalse(player.free)
        self.board.obtain_get_out_jail_free(player.id)
        self.assertTrue(player.free)

    def test_use_get_out_jail_free(self):
        player = self.players[0] 
        self.board.obtain_get_out_jail_free(player.id)
        self.board.go_to_jail(player.id)
        self.assertTrue(player.jail)
        self.assertTrue(player.free)
        self.board.use_get_out_jail_free(player.id)
        self.assertFalse(player.jail)
        self.assertFalse(player.free)

    def test_add_house(self):
        s = self.board.get_square(1)
        self.assertTrue(s.num_houses == 0)
        self.board.add_house(1)
        self.assertTrue(s.num_houses == 1)

    def test_take_turn_property_square_not_owned_buy(self):
        player = self.players[0]
        old_money = player.money
        board = self.board
        prop_square = board.get_square(3)
        self.assertFalse(prop_square.is_owned)

        turn = board.take_turn(player.id, 1, 2)
        try:
            message1 = turn.send(None)
            self.assertTrue(message1 == "buy_auction")
            message2 = turn.send("buy") # message2 = "human readable string"
        except StopIteration:
            pass
        self.assertTrue(board.get_pos(player.id) == 3)
        self.assertTrue(prop_square.is_owned)
        self.assertTrue(prop_square.owner == player.id)
        self.assertTrue(prop_square.price + player.money == old_money)

    def test_take_turn_property_square_owned(self):
        player1 = self.players[0]
        player2 = self.players[1]
        board = self.board
        prop_square = board.get_square(3)
        prop_square.is_owned = True 
        prop_square.owner = player2.id
        prop_rent = prop_square.base_rent 

        p1_old_money = player1.money
        p2_old_money = player2.money

        try:
            turn = board.take_turn(player1.id, 1, 2)
            message1 = turn.send(None)
        except StopIteration:
            pass
        # message1 will be human readable string"""
        self.assertTrue(p1_old_money - prop_rent == player1.money)
        self.assertTrue(p2_old_money + prop_rent == player2.money)
        self.assertTrue(board.get_pos(player1.id) == 3)

    def test_take_turn_utility_square_not_owned_buy(self):
        player = self.players[0]
        old_money = player.money
        board = self.board
        util_square = board.get_square(12)
        self.assertFalse(util_square.is_owned)

        turn = board.take_turn(player.id, 4, 8)
        try:
            message1 = turn.send(None)
            self.assertTrue(message1 == "buy_auction")
            message2 = turn.send("buy") # message2 = "human readable string"
        except StopIteration:
            pass
        self.assertTrue(board.get_pos(player.id) == 12)
        self.assertTrue(util_square.is_owned)
        self.assertTrue(util_square.owner == player.id)
        self.assertTrue(util_square.price + player.money == old_money)

    def test_take_turn_utility_square_owned(self):
        player1 = self.players[0]
        player2 = self.players[1]
        board = self.board
        util_square = board.get_square(12)
        util_square.is_owned = True 
        util_square.owner = player2.id
        
        p1_old_money = player1.money
        p2_old_money = player2.money

        try:
            turn = board.take_turn(player1.id, 4, 8)
            message1 = turn.send(None)
        except StopIteration:
            pass
        # message1 will be human readable string"""
        self.assertTrue(p1_old_money > player1.money)
        self.assertTrue(p2_old_money < player2.money)
        self.assertTrue(p1_old_money + p2_old_money == player1.money + player2.money)
        self.assertTrue(board.get_pos(player1.id) == 12)



if __name__ == "__main__":
    unittest.main()