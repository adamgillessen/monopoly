from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket

template = """{"type": "player_join_ack","key": 123456,"your_id": 2,"current_player": 2,"expects": 4,"game_start": false}"""


class SimpleEcho(WebSocket):

    def handleMessage(self):
        # echo message back to client
        # self.sendMessage(unicode(template, "utf-8"))
        self.sendMessage(self.data)

    def handleConnected(self):
        print self.address, 'connected'

    def handleClose(self):
        print self.address, 'closed'


server = SimpleWebSocketServer('', 4444, SimpleEcho)
server.serveforever()