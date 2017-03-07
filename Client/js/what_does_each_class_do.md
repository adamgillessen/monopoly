####Auction.js
Contains: __Auction class__  
A specific class used to handle the game logic during an Auction

####Communication.js  
Contains: __Connector class__  
The communication between server and client are being processed here.  
To generate and send messages to server  
To receive and parse messages from server  

####Game.js  
Contains: __Game class__  
This class manage all the resources like the connector to server and board class that stores board information  
It is is used as a singleton class so there is only one instance of this class inside every client.

####Helpers.js
Just a bunch of useful but individual functions

####LobbyController.js
Codes to handle things like creating connector to server and pre-game situation, where already connected players are waiting for enough players to start the actual game.

####Models.js:
Contains:   
1. __Player class__: Represent each player  
2. __Square class__: Represent each square on the game board  
3. __Board class__: Manage all the squares on the game board and all the players connected to this game

####ViewController.js:
Contains: __ViewController class__  
A very big and long class handles every user input and respond to every message received from server to make the game running.