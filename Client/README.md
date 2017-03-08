# README  

This is the ReadMe for Client-side

---

### Index  
1. [How to run the game](#1)
2. [Documentation](#2)
   1. [What does each file do](#2-1)
   2. [Principle of JavaScript](#2-2)
   3. [How to co-op with other groups' servers?](#2-3)

--

### <a name="1"></a>1. How to run the game
1. Make sure __TWO__ servers are up and running  

   > For more detail please see [README.md](../Server/README.md) in Server folder
2. Open up a broswer and go to ["localhost:8000"](http://localhost:8000)
3. Click __"Connect"__ button in the webpage
4. Wait for enough player to start the game.

--

### <a name="2"></a>2. Documentation
#### <a name="2-1"></a>1. What does each file do

|                Name (.js)                | Description                              |
| :--------------------------------------: | :--------------------------------------- |
|         [Auction](js/Auction.js)         | A specific class used to handle the game logic during an Auction |
|   [Communication](js/Communication.js)   | Send and receive messages to/from server |
|            [Game](js/Game.js)            | A class that encapsulates variables that stores game state and data |
|         [Helpers](js/Helpers.js)         | A place for some frequently used helper functions |
| [LobbyController](js/LobbyController.js) | View Controller for the lobby (Connect Screen) |
|          [Models](js/Models.js)          | Contains Classes at Model-layer in the MVC archtitecture |
|  [ViewController](js/ViewController.js)  | View Controller for the main game        |

#### <a name="2-2"></a>2. Principle of JavaScript

JavaScript is an unique language where function is "the First Class citizen" like Python. Also its mainly used in an event-driven environment, for instance, a webpage, where no code will be executed until some kind of event happens, for instance, a button being clicked by user.

There is no traditional main() entry in this project.

So nearly half of the codes are dealing with all kinds of events, they are called "callback" functinos, because they don't get a change to run until some events occur and call them.

In this project, there are two main sources of events:  

|   Source of event    | location of callback func that handles event |
| :------------------: | :--------------------------------------: |
|     User inputs      | [`js/ViewController.js`](js/ViewController.js) > `addCallbacksToButtons` |
| Messages from server | [`js/Communication.js`](js/Communication.js) > `parseMessage` |

### <a name="2-3"></a>3. How to co-op with other groups servers?

I think there are 2 main obstacles for this thing:  
1. Technology used to communicate _(We are using WebSocket)_  
2. Message format for the communication _(We are using JSON and you can have a look at all the formats under the [/Resources/Message Format](../Resources/Message Format)_  

So all we should do to make our games running with each other, is to adapt that two things. 

The codes related to this two thing can be located inside [`js/Communication.js`](js/Communication.js) 
So it should be enough to just modify the codes inside [`js/Communication.js`](js/Communication.js) 