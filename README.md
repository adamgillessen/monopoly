## CS3305 Team Software Project

### Team Members:
* Wu Zijie
* Caoife Davis
* Ultan Casey
* Adam Gillessen

Meeting Minutes can be found [here](https://docs.google.com/document/d/15NweTtgGW-K3wx3XQwjjnxLpIuCDaAU5f4-fV1tkW5c/edit?usp=sharing)

Team Charter can be found <a href="https://docs.google.com/document/d/1iONwklPpaQ7gQrXMIx4_vbfAziljX--6DvxdsBI8YaI/edit?usp=sharing">here</a>

## Table of content
Client - the client which will run in a user's web-browser  
Server - the server which will run the game for all clients  
Resources - assorted development information

## Todos:  
1. Remove property\_id and action\_id? Use each cell's position on board as ID instead, ranges from 0 to 39.   
2. Only include update info in board_sync? Say if player 1 bought property 2, then in the message, inside the "cells" section, only contians: _(Since this is the only value that could change)_  

	> "2": {  
	>     "owner": 1  
	> }  
3. ...
		
