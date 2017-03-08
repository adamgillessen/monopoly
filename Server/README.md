###0. Check your Python Version
In order to run the server, make sure you are using Python 3.3 or greater. 

###1. Dependency

The only dependency is a WebSocket library  
Install it using `sudo pip3 install websocket-server`

###2. Run the servers

This game requires 2 servers both up and running to run the game.  

1. Run the game server:  
`python3 Server.py <hostname> <portnumber>`  
By default it runs on localhost:4444

2. Run the built-in HTTP server for Python:  
__Important: Navigate to the client directory (the folder with index.html, `[this repo]/Client/`) before running the HTTP Server__  
`python3 -m http.server`  
By default it runs on [localhost:8000](http://localhost:8000)
