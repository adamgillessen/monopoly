from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket

class Server(WebSocket):
    def handleMessage(self):
        self.sendMessage(self.data)

    def handleConnected(self):
        print self.address, 'connected'

    def handleClose(self):
        print self.address, 'closed'


server = SimpleWebSocketServer('', 4444, SimpleEcho)
server.serveforever()