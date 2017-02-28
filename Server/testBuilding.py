import unittest
from Server import *
import subprocess
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException, UnexpectedAlertPresentException
import time

class BuildingTest(unittest.TestCase):
    """
    Test for building houses

    http://selenium-python.readthedocs.io/

    Install instructions to run:

        pip install selenium
        Download Chrome driver : https://sites.google.com/a/chromium.org/chromedriver/downloads
        Place driver in PATH

    Edit line 34 to your to the client index.html file
    
    """

    def setUp(self):
        self.server = subprocess.Popen(["python3", "Server.py"])
        self.keys = [1,2]
        self.players = { i: webdriver.Chrome() for i in self.keys}
        for player in self.players:
            self.players[player].get("file:///Users/caoifedavis/Documents/monopoly/Client/index.html")
            WebDriverWait(self.players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-connect")))
            print(">> Player ",player,"has connected")
            WebDriverWait(self.players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-connect"))).click()
            
        WebDriverWait(self.players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-start-now")))
        WebDriverWait(self.players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-start-now"))).click()

   
    def test_building(self):
        players = self.players
        keys = self.keys
        while True:
            round_no_roll = True
            for player in keys:
                if player != None:
                    if keys.count(None)==len(keys)-1:
                        return
                    print(">> Player ",player,"'s turn") 
                    while players[player].find_element_by_id("btn-roll").is_displayed():
                        bid = False
                        print(">> Player ",player, " rolled")
                        players[player].find_element_by_id("btn-roll").click()
                        round_no_roll =False
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
                                print(">> Player ",player, "choice to auction")
                                WebDriverWait(players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-buy-no"))).click()
                                bid = True

                            elif players[player].find_element_by_id("submit").text=="Bid":
                                print(">> Player ",player, "didn't have enough money")
                                bid = True
                            if bid:
                                print(">> Player ", 1 , "bid")
                                bid_area = players[1].find_element_by_id("input-chat")
                                bid_area.clear()
                                bid_area.send_keys(11)
                                players[1].find_element_by_id("submit").click()
                                print(">> Player ",2, "bid")
                                bid_area = players[2].find_element_by_id("input-chat")
                                bid_area.clear()
                                bid_area.send_keys(10)
                                players[2].find_element_by_id("submit").click()

                            if player == 1:
                                for item in players[1].find_elements_by_class_name("owned"):
                                    ActionChains(players[1]).move_to_element_with_offset(item, 0, 20).click().perform()
                                    if players[1].find_element_by_id("p-c-build").is_displayed():
                                        print("Building on property",players[1].find_element_by_id("property-id").text )
                                        players[1].find_element_by_id("p-c-build").click()
                                    


                            print(">> Player ",player, " ended their turn")
                            WebDriverWait(players[player], 5).until(EC.element_to_be_clickable((By.ID, "btn-end-turn"))).click()
            if round_no_roll:
                break     
            
                
                    
    
    def tearDown(self):
        for player in self.players:
            self.players[player].close()
        self.server.kill()

if __name__ == "__main__":
    unittest.main()