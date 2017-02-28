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

    def test_take_turn_property_square_not_owned_buy(self):
        player = self.players[0]
        old_money = player.money
        board = self.board
        prop_square = board.get_square(3)
        self.assertFalse(prop_square.is_owned)

        turn = board.take_turn(player.id, 1, 2)
        message1 = turn.send(None)
        self.assertTrue(message1 == "buy_auction")
        message2 = turn.send("buy")
        self.assertTrue(message2 == "property_bought")
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

        turn = board.take_turn(player1.id, 1, 2)
        message1 = turn.send(None)
        self.assertTrue((message1.startswith("paid_rent")))
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
        message1 = turn.send(None)
        self.assertTrue(message1 == "buy_auction")
        message2 = turn.send("buy")
        self.assertTrue(message2 == "property_bought")
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

        turn = board.take_turn(player1.id, 4, 8)
        message1 = turn.send(None)
        self.assertTrue((message1.startswith("paid_rent")))
        self.assertTrue(p1_old_money > player1.money)
        self.assertTrue(p2_old_money < player2.money)
        self.assertTrue(p1_old_money + p2_old_money == player1.money + player2.money)
        self.assertTrue(board.get_pos(player1.id) == 12)

        
    def test_take_turn_transport_square_not_owned_buy(self):
        player = self.players[0]
        old_money = player.money
        board = self.board
        trans_square = board.get_square(5)
        self.assertFalse(trans_square.is_owned)

        turn = board.take_turn(player.id, 2, 3)
        message1 = turn.send(None)
        self.assertTrue(message1 == "buy_auction")
        message2 = turn.send("buy")
        self.assertTrue(message2 == "property_bought")

        self.assertTrue(board.get_pos(player.id) == 5)
        self.assertTrue(trans_square.is_owned)
        self.assertTrue(trans_square.owner == player.id)
        self.assertTrue(trans_square.price + player.money == old_money)


    def test_take_turn_transport_square_owned(self):
        player1 = self.players[0]
        player2 = self.players[1]
        board = self.board
        trans_square = board.get_square(5)
        trans_square.is_owned = True 
        trans_square.owner = player2.id
        
        p1_old_money = player1.money
        p2_old_money = player2.money

        turn = board.take_turn(player1.id, 2, 3)
        message1 = turn.send(None)
        self.assertTrue(message1.startswith("paid_rent"))
        self.assertTrue(p1_old_money > player1.money)
        self.assertTrue(p2_old_money < player2.money)
        self.assertTrue(p1_old_money + p2_old_money == player1.money + player2.money)
        self.assertTrue(board.get_pos(player1.id) == 5)


    def test_take_turn_property_square_owned_auction(self):
        player = self.players[0]
        old_money = player.money
        board = self.board
        prop_square = board.get_square(3)
        self.assertFalse(prop_square.is_owned)

        turn = board.take_turn(player.id, 2, 1)
        message1 = turn.send(None)
        self.assertTrue(message1 == "buy_auction")
        message2 = turn.send("auction")
        self.assertTrue(message2 is None)
        highest_bidder = player.id 
        highest_bid = 500
        message3 = turn.send((highest_bidder, highest_bid))
        self.assertTrue(message3 == "property_auctioned")

        self.assertTrue(board.get_pos(player.id) == 3)
        self.assertTrue(prop_square.is_owned)
        self.assertTrue(prop_square.owner == player.id)
        self.assertTrue(highest_bid + player.money == old_money)


    def test_take_turn_transport_square_owned_auction(self):
        player = self.players[0]
        old_money = player.money
        board = self.board
        trans_square = board.get_square(5)
        self.assertFalse(trans_square.is_owned)

        turn = board.take_turn(player.id, 2, 3)
        message1 = turn.send(None)
        self.assertTrue(message1 == "buy_auction")
        message2 = turn.send("auction")
        self.assertTrue(message2 is None)
        highest_bidder = player.id 
        highest_bid = 500
        message3 = turn.send((highest_bidder, highest_bid))
        self.assertTrue(message3 == "property_auctioned")

        self.assertTrue(board.get_pos(player.id) == 5)
        self.assertTrue(trans_square.is_owned)
        self.assertTrue(trans_square.owner == player.id)
        self.assertTrue(highest_bid + player.money == old_money)


    def test_take_turn_util_square_owned_auction(self):
        player = self.players[0]
        old_money = player.money
        board = self.board
        util_square = board.get_square(12)
        self.assertFalse(util_square.is_owned)

        turn = board.take_turn(player.id, 4, 8)
        message1 = turn.send(None)
        self.assertTrue(message1 == "buy_auction")
        message2 = turn.send("auction")
        self.assertTrue(message2 is None)
        highest_bidder = player.id 
        highest_bid = 500
        message3 = turn.send((highest_bidder, highest_bid))
        self.assertTrue(message3 == "property_auctioned")

        self.assertTrue(board.get_pos(player.id) == 12)
        self.assertTrue(util_square.is_owned)
        self.assertTrue(util_square.owner == player.id)
        self.assertTrue(highest_bid + player.money == old_money)

    def test_player_lose(self):
        player = self.players[0]
        board = self.board
        player.money = 100
        trans_square = board.get_square(5)
        trans_square.is_owned = True 
        trans_square.owner = player.id
        player.add_transport(trans_square)

        self.assertTrue(len(player.get_assets()) == 1)
        turn = board.take_turn(player.id, 19, 19)  # will get taxed 200
        def f():
            turn.send(None)
        self.assertRaises(PlayerLostError, f)

        self.assertFalse(trans_square.is_owned)
        self.assertTrue(trans_square.owner == -1)

    def test_build_house_and_sell_house(self):
        player1 = self.players[0]
        player2 = self.players[1]
        board = self.board

        prop_square = board.get_square(1)
        prop_square.is_owned = True 
        prop_square.owner = player2.id
        player2.add_property(prop_square)

        # player 2 does not own all the estate
        def f():
            board.build_house(player2.id, prop_square.square_id)
        self.assertRaises(BuildException, f)

        prop_square = board.get_square(3)
        prop_square.is_owned = True 
        prop_square.owner = player2.id
        player2.add_property(prop_square)
        
        # player 1 does not own house
        def f():
            board.build_house(player1.id, prop_square.square_id)
        self.assertRaises(BuildException, f)


        self.assertTrue(prop_square.num_houses == 0)
        self.assertTrue(prop_square.base_rent == board.get_current_rent(prop_square.square_id))

        before_money = player2.money 
        board.build_house(player2.id, prop_square.square_id)
        after_money = player2.money

        self.assertTrue(after_money + prop_square.house_cost == before_money)
        self.assertTrue(prop_square.num_houses == 1)
        self.assertTrue(prop_square.base_rent != board.get_current_rent(prop_square.square_id))

        # player 1 does not own house
        def f():
            board.sell_house(player1.id, prop_square.square_id)
        self.assertRaises(BuildException, f)

        before_money = player2.money 
        board.sell_house(player2.id, prop_square.square_id)
        after_money = player2.money

        self.assertTrue(before_money + (prop_square.house_cost // 2) == after_money)

if __name__ == "__main__":
    unittest.main()