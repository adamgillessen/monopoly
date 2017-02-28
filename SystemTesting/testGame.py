import unittest
from Server import *
import subprocess
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException, UnexpectedAlertPresentException
import os


class GameTest(unittest.TestCase):
    """
    Test for gameplay

    http://selenium-python.readthedocs.io/

    Install instructions to run:

        pip install selenium
        Download Chrome driver : https://sites.google.com/a/chromium.org/chromedriver/downloads
        Place driver in PATH

    Edit line 32 to your to the client index.html file

    """
    client_location = "file:///Users/caoifedavis/Documents/monopoly/Client/index.html"
    
    def setUp(self):
        self.server = subprocess.Popen(["python3", "Server.py"])
        self.keys = [1,2,3,4]
        self.players = { i: webdriver.Chrome() for i in self.keys}
        for player in self.players:
            self.players[player].get(GameTest.client_location)
            self.players[player].find_element_by_id("btn-connect").click()
        WebDriverWait(self.players[player], 5).until(EC.visibility_of_element_located((By.ID, "game-area")))
   
    def test_full_game_auction_and_buy(self):
        
        players = self.players
        keys = self.keys
        removeable = []

        while True:
            round_no_roll = True
            for player in keys:
                if player != None:
                    if keys.count(None)==len(keys)-1:
                        return
                    print(">> Player ",player,"'s turn") 
                    while players[player].find_element_by_id("btn-roll").is_displayed():
                        round_no_roll =False
                        print(">> Player ",player, " rolled")
                        players[player].find_element_by_id("btn-roll").click()
                                              
                        print(">> Check if player ",player, "lost")
                        try :
                            players[player].switch_to.alert.accept()
                            lost = True
                            print(">> Player ",player, " lost")
                            keys[keys.index(player)] = None
                            continue
                        except NoAlertPresentException:
                            if players[player].find_element_by_id("prompt-buy").is_displayed():
                                print(">> Player ",player, "landed on a property")
                                if random.choice([True, False]):
                                    print(">> Player ",player, "choose to buy")
                                    WebDriverWait(players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-buy-yes"))).click()
                                else:
                                    print(">> Player ",player, "choice to auction")
                                    WebDriverWait(players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-buy-no"))).click()

                            elif players[player].find_element_by_id("submit").text=="Bid":
                                print(">> Player ",player, "didn't have enough money")

                            while True:
                                for p in keys:
                                    print(">> Check if player ",p, " can bid")
                                    if p != None and players[p].find_element_by_id("submit").text=="Bid":
                                        print(">> Player ",p, "bid")
                                        money = int(players[p].find_element_by_id("money").text[1:])
                                        bid_area = players[p].find_element_by_id("input-chat")
                                        base_bid = int(bid_area.get_attribute("value"))
                                        bid_area.clear()
                                        if money < base_bid:
                                            money = 0
                                            base_bid = 0
                                        elif money > 400:
                                            money = 400
                                        bid_area.send_keys(random.randint(base_bid,money-1))
                                        players[p].find_element_by_id("submit").click()
                                if players[player].find_element_by_id("btn-end-turn").is_displayed():
                                    break

                            print(">> Player ",player, " ended their turn")
                            WebDriverWait(players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-end-turn"))).click()
            if round_no_roll:
                break      

   
            
                
                    
    
    def tearDown(self):
        for player in self.players:
            self.players[player].close()
        self.server.kill()

cwd = os.getcwd()
client_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'Client', "index.html"))
GameTest.client_location = "file://"  + client_path

if __name__ == "__main__":
    unittest.main()